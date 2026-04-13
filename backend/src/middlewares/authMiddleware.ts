import { and, eq, gt } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import { db } from '../db/index.js';
import { RoleTable, SessionTable, UserTable } from '../db/schema.js';

export const authMiddleware = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json(
      { success: false, message: 'Unauthorized: No session found' },
      401,
    );
  }

  const [result] = await db
    .select({ user: UserTable, session: SessionTable, role: RoleTable.name })
    .from(SessionTable)
    .innerJoin(UserTable, eq(SessionTable.userId, UserTable.id))
    .innerJoin(RoleTable, eq(UserTable.roleId, RoleTable.id))
    .where(
      and(
        eq(SessionTable.id, sessionId),
        gt(SessionTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  console.log(result);

  // db.query.SessionTable.findFirst({
  //   where: (session, { eq, and, gt }) =>
  //     and(eq(session.id, sessionId), gt(session.expiresAt, new Date())),
  //   with: {
  //     UserTable: {
  //       with: {
  //         RoleTable: { columns: { role: true } },
  //       },
  //     },
  //   },
  // });

  if (!result) {
    deleteCookie(c, 'session');
    return c.json(
      { success: false, message: 'Unauthorized: Session invalid or expired' },
      401,
    );
  }

  c.set('user', { ...result.user, role: result.role });
  c.set('session', result.session);

  await next();
};
