import { Hono } from 'hono';
import {
  createRole,
  deleteRole,
  getRoles,
  getRolePermissions,
  updateRole,
  updateRolePermission,
} from '../controllers/roleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateInput } from '../middlewares/validateInput.js';
import { paramSchema } from '../schemas/paramSchema.js';
import { rolePermissionSchema, roleSchema } from '../schemas/roleSchema.js';
import { hasPermission } from '../middlewares/hasPermission.js';

const role = new Hono()
  .use('*', authMiddleware)
  .get('/', hasPermission('role:read'), getRoles)
  .get(
    '/:id/permissions',
    hasPermission('role:read'),
    validateInput('param', paramSchema),
    getRolePermissions,
  )
  .post(
    '/',
    hasPermission('role:create'),
    validateInput('json', roleSchema),
    createRole,
  )
  .put(
    '/:id',
    hasPermission('role:update'),
    validateInput('param', paramSchema),
    validateInput('json', roleSchema),
    updateRole,
  )
  .delete(
    '/:id',
    hasPermission('role:delete'),
    validateInput('param', paramSchema),
    deleteRole,
  )
  .put(
    '/:id/permissions',
    hasPermission(''),
    validateInput('param', paramSchema),
    validateInput('json', rolePermissionSchema),
    updateRolePermission,
  );

export default role;
