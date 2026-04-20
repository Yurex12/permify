import type { Context } from 'hono';
import { db } from '../db/index.js';
import { PermissionTable } from '../db/schema.js';

export const getPermissions = async (c: Context) => {
  const permissions = await db.query.PermissionTable.findMany();

  return c.json({ success: true, message: 'Successful', permissions });
};
