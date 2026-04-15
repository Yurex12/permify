import { and, eq, gt } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import { db } from '../db/index.js';
import {
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  SessionTable,
  UserTable,
} from '../db/schema.js';

export const authMiddleware = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json(
      { success: false, message: 'Unauthorized: No session found' },
      401,
    );
  }

  const result = await db.query.SessionTable.findFirst({
    where: (session, { eq }) => eq(session.id, sessionId),
    with: {
      user: {
        with: {
          role: {
            columns: { name: true },
            with: {
              rolePermissions: {
                with: { permission: { columns: { action: true } } },
              },
            },
          },
        },
      },
    },
  });

  console.log(result);

  if (!result) {
    deleteCookie(c, 'session');
    return c.json(
      { success: false, message: 'Unauthorized: Session invalid or expired' },
      401,
    );
  }

  const { user, ...session } = result;
  const { role, ...userData } = user;
  const permissions = role.rolePermissions.map((rp) => rp.permission?.action);

  c.set('session', session);
  c.set('user', {
    ...userData,
    role: role.name,
    permissions,
  });

  await next();
};
