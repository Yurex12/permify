import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { validateInput } from '../middlewares/validateInput.js';
import { permissionSchema } from '../schemas/permissionSchema.js';
import {
  createPermission,
  getPermissions,
} from '../controllers/permissionController.js';
import { hasPermission } from '../middlewares/hasPermission.js';

const router = new Hono()
  .use('*', authMiddleware)
  .get('/', hasPermission('permission:view'), getPermissions)
  .post(
    '/',
    hasPermission('permission:create'),
    validateInput('json', permissionSchema),
    createPermission,
  );

export default router;
