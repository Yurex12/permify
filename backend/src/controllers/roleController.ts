import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { db } from '../db/index.js';
import { RolePermissionTable } from '../db/schema.js';
import type { RoleFormValues } from '../schemas/roleSchema.js';
import { DB_ERRORS, isDbError } from '../utils/dbError.js';

export const getRoles = async (c: Context) => {
  const roles = await db.query.RoleTable.findMany();

  return c.json({ success: true, message: 'Successful', roles });
};

export const updateRolePermission = async (c: Context) => {
  const roleId = c.req.param('id');
  const { permissionIds } = await c.req.json<RoleFormValues>();

  const uniquePermissionIds = [...new Set(permissionIds)];

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(RolePermissionTable)
        .where(eq(RolePermissionTable.roleId, roleId));

      const newLinks = uniquePermissionIds.map((id) => ({
        roleId,
        permissionId: id,
      }));

      await tx.insert(RolePermissionTable).values(newLinks);
    });
    return c.json({
      success: true,
      message: 'Permissions synced successfully',
    });
  } catch (error) {
    if (isDbError(error, DB_ERRORS.FOREIGN_KEY_VIOLATION)) {
      return c.json(
        {
          success: false,
          message:
            'Linking failed: The Role or one of the Permissions does not exist.',
        },
        400,
      );
    }

    throw error;
  }
};
