import type { Context, Next } from 'hono';

export const hasPermission =
  (...requiredPermissions: string[]) =>
  async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

    if (user.role === 'admin') return await next();

    const userPermissions = user?.permissions ?? [];

    const isAuthorized = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!isAuthorized)
      return c.json({ success: false, message: 'Access Denied' }, 403);

    await next();
  };
