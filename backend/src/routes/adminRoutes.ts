import { Hono } from 'hono';
import {
  createPermission,
  getPermissions,
} from '../controllers/permissionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { validateInput } from '../middlewares/validateInput.js';
import { permissionSchema } from '../schemas/permissionSchema.js';
import {
  getRoles,
  updateRolePermission,
} from '../controllers/roleController.js';
import { roleSchema } from '../schemas/roleSchema.js';
import { paramSchema } from '../schemas/paramSchema.js';

const router = new Hono()
  .use('*', authMiddleware, isAdmin)

  //   Permission
  .post(
    '/permissions',
    validateInput('json', permissionSchema),
    createPermission,
  )
  .get('/permissions', getPermissions)

  //   Role
  .get('/roles', getRoles)
  .put(
    '/roles/:id/permissions',
    validateInput('param', paramSchema),
    validateInput('json', roleSchema),
    updateRolePermission,
  );

export default router;
