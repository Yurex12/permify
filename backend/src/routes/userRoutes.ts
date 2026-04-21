import { Hono } from 'hono';
import {
  assignRoleToUser,
  banUser,
  getMe,
  getUserById,
  getUsers,
  restrictUser,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { hasPermission } from '../middlewares/hasPermission.js';
import { validateInput } from '../middlewares/validateInput.js';
import { paramSchema } from '../schemas/paramSchema.js';
import { updateUserRoleSchema } from '../schemas/userSchema.js';

const user = new Hono()
  .use('*', authMiddleware)
  .get('/me', getMe)
  .get('/:id', validateInput('param', paramSchema), getUserById)
  .get('/', hasPermission('user:read'), getUsers)
  .put(
    '/:id/role',
    hasPermission('user:updateRole'),
    validateInput('param', paramSchema),
    validateInput('json', updateUserRoleSchema),
    assignRoleToUser,
  )
  .post(
    '/:id/restrict',
    hasPermission('user:restrict'),
    validateInput('param', paramSchema),
    validateInput('json', updateUserRoleSchema),
    restrictUser,
  )
  .post(
    '/:id/ban',
    hasPermission('user:ban'),
    validateInput('param', paramSchema),
    validateInput('json', updateUserRoleSchema),
    banUser,
  );

export default user;
