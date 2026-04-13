import { hash, verify } from '@node-rs/argon2';
import type { Context } from 'hono';

import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  PasswordResetTable,
  RoleTable,
  SessionTable,
  UserTable,
  VerificationTable,
} from '../db/schema.js';

import type {
  AuthCodeFormValues,
  EmailSchema,
  LoginFormValues,
  ResetPasswordFormValues,
  SignupFormValues,
  UserIdSchema,
} from '../schemas/authSchema.js';

import { randomBytes, randomInt } from 'node:crypto';
import { getConnInfo } from '@hono/node-server/conninfo';
import { calculateExpiry } from '../utils/helpers.js';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

export const signupUser = async (c: Context) => {
  const { email, name, password } = await c.req.json<SignupFormValues>();

  const existingUser = await db.query.UserTable.findFirst({
    where: (user, { eq }) => eq(user.name, name),
    columns: { id: true },
  });

  if (existingUser)
    return c.json({ success: false, message: 'Email already exist.' }, 400);

  const hashedPassword = await hash(password);

  const defaultRole = await db.query.RoleTable.findFirst({
    where: (role, { eq }) => eq(role.name, 'user'),
  });

  if (!defaultRole)
    return c.json(
      { success: false, message: 'Default role does not exist. contact admin' },
      500,
    );

  const { newUser, token } = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(UserTable)
      .values({
        name: name,
        email: email,
        password: hashedPassword,
        roleId: defaultRole?.id,
      })
      .returning({ id: UserTable.id });

    const verificationCode = randomInt(100_000, 1_000_000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [{ token }] = await tx
      .insert(VerificationTable)
      .values({ userId: newUser.id, token: verificationCode, expiresAt })
      .returning({ token: VerificationTable.token });

    return { newUser, token };
  });

  // Send email

  return c.json(
    { success: true, message: 'Signup successful.', user: newUser },
    201,
  );
};

export const loginUser = async (c: Context) => {
  const { email, password, rememberMe } = await c.req.json<LoginFormValues>();

  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.email, email),
    extras: {},
  });

  if (!existingUser)
    return c.json(
      { success: false, message: 'Email or Password is incorrect.' },
      401,
    );

  const passwordMatch = await verify(existingUser.password, password);

  if (!passwordMatch)
    return c.json(
      { success: false, message: 'Email or Password is incorrect.' },
      401,
    );

  if (!existingUser.verifiedAt)
    return c.json(
      {
        success: false,
        message: 'Please verify your email before logging in.',
        userId: existingUser.id,
      },
      403,
    );

  const sessionId = randomBytes(32).toString('base64url');
  const expiresAt = calculateExpiry(rememberMe);
  const userAgent = c.req.header('User-Agent') || 'unknown';

  const info = getConnInfo(c);
  const ipAddress = info.remote.address || 'unknown';

  await db.insert(SessionTable).values({
    id: sessionId,
    userId: existingUser.id,
    expiresAt,
    userAgent,
    ipAddress,
  });

  setCookie(c, 'session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
      | 'none'
      | 'lax',
    expires: expiresAt,
  });

  const { password: _, ...userData } = existingUser;

  return c.json({
    success: true,
    message: 'Login successful.',
    user: userData,
  });
};

export const logoutUser = async (c: Context) => {
  const sessionId = getCookie(c, 'session');

  console.log('sessionId', sessionId);

  if (sessionId) {
    await db.delete(SessionTable).where(eq(SessionTable.id, sessionId));
  }

  deleteCookie(c, 'session', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
      | 'none'
      | 'lax',
  });

  return c.json({ success: true, message: 'Logged out successfully' });
};

export const verifyEMail = async (c: Context) => {
  const { token, userId } = await c.req.json<AuthCodeFormValues>();

  const verificationData = await db.query.VerificationTable.findFirst({
    where: and(
      eq(VerificationTable.userId, userId),
      eq(VerificationTable.token, token),
    ),
  });

  if (!verificationData)
    return c.json(
      { success: false, message: 'The code you entered is incorrect.' },
      404,
    );

  if (verificationData.expiresAt < new Date())
    return c.json(
      { success: false, message: 'Token already expired, request another' },
      400,
    );

  await db.transaction(async (tx) => {
    await tx
      .update(UserTable)
      .set({ verifiedAt: new Date() })
      .where(eq(UserTable.id, userId));
    await tx
      .delete(VerificationTable)
      .where(eq(VerificationTable.id, verificationData.id));
  });

  return c.json({ success: true, message: 'Email verified successfully.' });
};

export const resendVerificationCode = async (c: Context) => {
  const { userId } = await c.req.json<UserIdSchema>();

  const [user] = await db
    .select({ email: UserTable.email, verifiedAt: UserTable.verifiedAt })
    .from(UserTable)
    .where(eq(UserTable.id, userId));

  if (!user) return c.json({ success: false, message: 'user not found.' }, 404);

  if (user.verifiedAt) {
    return c.json(
      { success: false, message: 'Email is already verified.' },
      400,
    );
  }

  const { token } = await db.transaction(async (tx) => {
    await tx
      .delete(VerificationTable)
      .where(eq(VerificationTable.userId, userId));

    const verificationCode = randomInt(100_000, 1_000_000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [{ token }] = await tx
      .insert(VerificationTable)
      .values({ userId, token: verificationCode, expiresAt })
      .returning({ token: VerificationTable.token });

    return { token };
  });

  //  Send Token to email

  return c.json({
    success: true,
    message: 'Code has been sent to your email.',
  });
};

export const forgotPassword = async (c: Context) => {
  const { email } = await c.req.json<EmailSchema>();

  const [user] = await db
    .select({ userId: UserTable.id })
    .from(UserTable)
    .where(eq(UserTable.email, email));

  if (!user)
    return c.json({
      success: true,
      message: 'Code has been sent to your email.',
    });

  const { token } = await db.transaction(async (tx) => {
    await tx
      .delete(PasswordResetTable)
      .where(eq(PasswordResetTable.userId, user.userId));

    const verificationCode = randomInt(100_000, 1_000_000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [{ token }] = await tx
      .insert(PasswordResetTable)
      .values({ userId: user.userId, token: verificationCode, expiresAt })
      .returning({ token: PasswordResetTable.token });

    return { token };
  });

  //  Send Token to email

  return c.json({
    success: true,
    message: 'Code has been sent to your email.',
    userId: user.userId,
  });
};

export const verifyResetPasswordCode = async (c: Context) => {
  const { token, userId } = await c.req.json<AuthCodeFormValues>();

  const [verificationData] = await db
    .select()
    .from(PasswordResetTable)
    .where(
      and(
        eq(PasswordResetTable.userId, userId),
        eq(PasswordResetTable.token, token),
      ),
    );

  if (!verificationData)
    return c.json(
      { success: false, message: 'The code you entered is incorrect.' },
      404,
    );

  if (verificationData.expiresAt < new Date())
    return c.json(
      { success: false, message: 'Token already expired, request another' },
      400,
    );

  return c.json({ success: true, message: 'Token is correct', userId });
};

export const resetPassword = async (c: Context) => {
  const {
    password: newPassword,
    token,
    userId,
  } = await c.req.json<ResetPasswordFormValues>();

  const [passwordResetData] = await db
    .select()
    .from(PasswordResetTable)
    .where(
      and(
        eq(PasswordResetTable.userId, userId),
        eq(PasswordResetTable.token, token),
      ),
    );

  if (!passwordResetData)
    return c.json(
      {
        success: false,
        message: 'Token has expired, request another.',
      },
      400,
    );

  if (passwordResetData.expiresAt < new Date())
    return c.json(
      { success: false, message: 'Token already expired, request another' },
      400,
    );

  const newHashedPassword = await hash(newPassword);

  await db.transaction(async (tx) => {
    await tx
      .delete(PasswordResetTable)
      .where(eq(PasswordResetTable.userId, userId));

    await tx
      .update(UserTable)
      .set({ password: newHashedPassword })
      .where(eq(UserTable.id, userId));
  });

  //  Send confirmation mail

  return c.json({
    success: true,
    message: 'Password has been updated successfully.',
  });
};
