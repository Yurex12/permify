import { Hono } from 'hono';
import {
  getMe,
  getUserById,
  getUsers,
  assignRoleToUser,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateInput } from '../middlewares/validateInput.js';
import { paramSchema } from '../schemas/paramSchema.js';
import { hasPermission } from '../middlewares/hasPermission.js';
import * as z from 'zod';

const assignRoleSchema = z.object({
  roleId: z.uuid('Invalid Role ID format'),
});

const user = new Hono()
  .use('*', authMiddleware)
  .get('/me', getMe)
  .get('/:id', validateInput('param', paramSchema), getUserById)
  .get('/', hasPermission('user:read'), getUsers)
  .put(
    '/:id/role',
    hasPermission('user:updateRole'),
    validateInput('param', paramSchema),
    validateInput('json', assignRoleSchema),
    assignRoleToUser,
  );

export default user;
