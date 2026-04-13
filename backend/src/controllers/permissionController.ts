import type { Context } from 'hono';
import { db } from '../db/index.js';
import { PermissionTable } from '../db/schema.js';
import type { PermissionFormValues } from '../schemas/permissionSchema.js';
import { DB_ERRORS, isDbError } from '../utils/dbError.js';

export const getPermissions = async (c: Context) => {
  const permissions = await db.query.PermissionTable.findMany();

  return c.json({ success: true, message: 'Successful', permissions });
};

export const createPermission = async (c: Context) => {
  try {
    const data = await c.req.json<PermissionFormValues>();

    const [newPermission] = await db
      .insert(PermissionTable)
      .values(data)
      .returning();

    return c.json(
      { success: true, message: 'Action created successfully', newPermission },
      201,
    );
  } catch (error) {
    console.log('Error', error);
    if (isDbError(error, DB_ERRORS.UNIQUE_VIOLATION))
      return c.json(
        {
          success: false,
          message: 'Action already exists',
          //   error: process.env.NODE_ENV === 'development' ? error : null,
        },
        409,
      );

    throw error;
  }
};
