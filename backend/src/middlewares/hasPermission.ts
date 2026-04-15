import type { Context, Next } from 'hono';

export const hasPermission = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (user?.role === 'admin') return await next();
};
