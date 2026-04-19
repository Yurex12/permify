import { Hono } from 'hono';
import {
  getRoles,
  updateRolePermission,
} from '../controllers/roleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateInput } from '../middlewares/validateInput.js';
import { paramSchema } from '../schemas/paramSchema.js';
import { roleSchema } from '../schemas/roleSchema.js';
import { hasPermission } from '../middlewares/hasPermission.js';

const role = new Hono()
  .use('*', authMiddleware)
  .get('/', hasPermission('role:read'), getRoles)
  .put(
    '/:id/permissions',
    validateInput('param', paramSchema),
    validateInput('json', roleSchema),
    updateRolePermission,
  );

export default role;
