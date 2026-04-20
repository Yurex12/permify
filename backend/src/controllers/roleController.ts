import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { db } from '../db/index.js';
import { RolePermissionTable, RoleTable } from '../db/schema.js';
import type {
  RoleFormValues,
  RolePermissionFormValues,
} from '../schemas/roleSchema.js';
import { DB_ERRORS, isDbError } from '../utils/dbError.js';

// role:read
export const getRoles = async (c: Context) => {
  const roles = await db.query.RoleTable.findMany();

  return c.json({ success: true, message: 'Successful', roles });
};

// role:create
export const createRole = async (c: Context) => {
  try {
    const { name } = await c.req.json<RoleFormValues>();

    await db.insert(RoleTable).values({ name: name.toLowerCase() });

    return c.json({ success: true, message: 'Role created successfully' }, 201);
  } catch (error) {
    if (isDbError(error, DB_ERRORS.UNIQUE_VIOLATION)) {
      return c.json(
        {
          success: false,
          message: 'Role already exists',
        },
        400,
      );
    }

    throw error;
  }
};
// role:update
export const updateRole = async (c: Context) => {
  const id = c.req.param('id');
  const { name } = await c.req.json<RoleFormValues>();

  try {
    const result = await db
      .update(RoleTable)
      .set({ name: name.toLowerCase() })
      .where(eq(RoleTable.id, id));

    if (result.count === 0)
      return c.json({ success: false, message: 'Role not found' }, 404);

    return c.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    if (isDbError(error, DB_ERRORS.UNIQUE_VIOLATION)) {
      return c.json(
        {
          success: false,
          message: 'Role already exists',
        },
        400,
      );
    }

    throw error;
  }
};

// role:delete
export const deleteRole = async (c: Context) => {
  const id = c.req.param('id');

  const result = await db.delete(RoleTable).where(eq(RoleTable.id, id));

  if (result.count === 0)
    return c.json({ success: false, message: 'Role not found' }, 404);

  return c.json({ success: true, message: 'Role deleted successfully' });
};

// role:read permissions
export const getRolePermissions = async (c: Context) => {
  const id = c.req.param('id');

  const roleDetails = await db.query.RoleTable.findFirst({
    where: (role, { eq }) => eq(role.id, id),
    with: {
      rolePermissions: {
        columns: { permissionId: false, roleId: false },
        with: {
          permission: true,
        },
      },
    },
  });

  if (!roleDetails)
    return c.json({ success: false, message: 'Role not found' }, 404);

  return c.json({ success: true, message: 'Successful', roleDetails });
};

//  role:updatePermissions

export const updateRolePermission = async (c: Context) => {
  const roleId = c.req.param('id');
  const { permissionIds } = await c.req.json<RolePermissionFormValues>();

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
