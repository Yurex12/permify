import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { db } from '../db/index.js';
import { UserTable, RoleTable } from '../db/schema.js';
import { DB_ERRORS, isDbError } from '../utils/dbError.js';
import type { Hono } from 'hono';

// Get current user profile
export const getMe = async (c: Context) => {
  const userId = c.get('userId');

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
    with: {
      role: true,
    },
  });

  if (!user) return c.json({ success: false, message: 'User not found' }, 404);

  const { password, ...userWithoutPassword } = user;
  return c.json({
    success: true,
    message: 'Successful',
    user: userWithoutPassword,
  });
};

// Get user by ID
export const getUserById = async (c: Context) => {
  const id = c.req.param('id');

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
    with: {
      role: true,
    },
  });

  if (!user) return c.json({ success: false, message: 'User not found' }, 404);

  const { password, ...userWithoutPassword } = user;
  return c.json({
    success: true,
    message: 'Successful',
    user: userWithoutPassword,
  });
};

// List all users (admin only)
export const getUsers = async (c: Context) => {
  const users = await db.query.UserTable.findMany({
    with: {
      role: true,
    },
  });

  const safeUsers = users.map(({ password, ...user }) => user);
  return c.json({ success: true, message: 'Successful', users: safeUsers });
};

// Assign role to user (admin only)
export const assignRoleToUser = async (c: Context) => {
  const userId = c.req.param('id');
  const { roleId } = await c.req.json<{ roleId: string }>();

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });

  if (!user) return c.json({ success: false, message: 'User not found' }, 404);

  const role = await db.query.RoleTable.findFirst({
    where: eq(RoleTable.id, roleId),
  });

  if (!role) return c.json({ success: false, message: 'Role not found' }, 404);

  try {
    await db.update(UserTable).set({ roleId }).where(eq(UserTable.id, userId));

    return c.json({ success: true, message: 'Role assigned successfully' });
  } catch (error) {
    if (isDbError(error, DB_ERRORS.FOREIGN_KEY_VIOLATION)) {
      return c.json(
        {
          success: false,
          message: 'Role assignment failed',
        },
        400,
      );
    }

    throw error;
  }
};
