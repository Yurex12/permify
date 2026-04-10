import { and, eq, gt } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { db } from '../db/index.js';
import { SessionTable, UserTable } from '../db/schema.js';

export const authMiddleware = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json(
      { success: false, message: 'Unauthorized: No session found' },
      401,
    );
  }

  const [result] = await db
    .select({ user: UserTable, session: SessionTable })
    .from(SessionTable)
    .innerJoin(UserTable, eq(SessionTable.userId, UserTable.id))
    .where(
      and(
        eq(SessionTable.id, sessionId),
        gt(SessionTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!result) {
    return c.json(
      { success: false, message: 'Unauthorized: Session invalid or expired' },
      401,
    );
  }

  c.set('user', result.user);
  c.set('session', result.session);

  await next();
};
