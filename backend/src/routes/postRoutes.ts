import { Hono } from 'hono';
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  getPostsByUser,
  updatePost,
} from '../controllers/postController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { hasPermission } from '../middlewares/hasPermission.js';
import { validateInput } from '../middlewares/validateInput.js';
import { paramSchema } from '../schemas/paramSchema.js';
import { postSchema } from '../schemas/postSchema.js';

const post = new Hono()
  .use('*', authMiddleware)
  .post(
    '/',
    hasPermission('post:create'),
    validateInput('json', postSchema),
    createPost,
  )
  .get('/', hasPermission('post:read'), getPosts)
  .get(
    '/:id',
    hasPermission('post:read'),
    validateInput('param', paramSchema),
    getPostById,
  )
  .get('/user/:userId', hasPermission('post:read'), getPostsByUser)
  .put(
    '/:id',
    hasPermission('post:update'),
    validateInput('param', paramSchema),
    validateInput('json', postSchema),
    updatePost,
  )
  .delete(
    '/:id',
    hasPermission('post:delete'),
    validateInput('param', paramSchema),
    deletePost,
  );

export default post;
