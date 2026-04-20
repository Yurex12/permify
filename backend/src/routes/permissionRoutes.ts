import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { hasPermission } from '../middlewares/hasPermission.js';
import { getPermissions } from '../controllers/permissionController.js';

const router = new Hono()
  .use('*', authMiddleware)
  .get('/', hasPermission('permission:read'), getPermissions);

export default router;
