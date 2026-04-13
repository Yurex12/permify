import type { Context, Next } from 'hono';

export const isAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (user.role !== 'admin') {
    return c.json(
      {
        success: false,
        message:
          'Access Denied: You do not have permission to perform this action.',
      },
      403,
    );
  }

  await next();
};
