import { Hono } from 'hono';
import {
  createPermission,
  getPermissions,
} from '../controllers/permissionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { validateInput } from '../middlewares/validateInput.js';
import { permissionSchema } from '../schemas/permissionSchema.js';

const router = new Hono()
  .use('*', authMiddleware, isAdmin)
  .post(
    '/permissions',
    validateInput('json', permissionSchema),
    createPermission,
  )
  .get('/permissions', getPermissions);

export default router;
