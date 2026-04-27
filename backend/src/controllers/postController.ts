import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { db } from '../db/index.js';
import { PostTable, UserTable } from '../db/schema.js';
import type { PostFormValues } from '../schemas/postSchema.js';

// Create a new post
export const createPost = async (c: Context) => {
  const userId = c.get('user').id;
  const { content } = await c.req.json<PostFormValues>();

  try {
    const [newPost] = await db
      .insert(PostTable)
      .values({
        content,
        userId,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: 'Post created successfully',
        post: newPost,
      },
      201,
    );
  } catch (error) {
    throw error;
  }
};

// Get all posts with pagination
export const getPosts = async (c: Context) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  if (page < 1 || limit < 1) {
    return c.json(
      { success: false, message: 'Invalid pagination parameters' },
      400,
    );
  }

  const offset = (page - 1) * limit;

  try {
    const posts = await db.query.PostTable.findMany({
      limit,
      offset,
      orderBy: (post, { desc }) => [desc(post.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalPosts = await db.query.PostTable.findMany();

    return c.json({
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts.length,
          totalPages: Math.ceil(totalPosts.length / limit),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

// Get post by ID
export const getPostById = async (c: Context) => {
  const postId = c.req.param('id');

  const post = await db.query.PostTable.findFirst({
    where: eq(PostTable.id, postId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    return c.json({ success: false, message: 'Post not found' }, 404);
  }

  return c.json({
    success: true,
    message: 'Post retrieved successfully',
    post,
  });
};

// Get all posts by a specific user
export const getPostsByUser = async (c: Context) => {
  const userId = c.req.param('userId');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  if (page < 1 || limit < 1) {
    return c.json(
      { success: false, message: 'Invalid pagination parameters' },
      400,
    );
  }

  const offset = (page - 1) * limit;

  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
    });

    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    const posts = await db.query.PostTable.findMany({
      where: eq(PostTable.userId, userId),
      limit,
      offset,
      orderBy: (post, { desc }) => [desc(post.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalPosts = await db.query.PostTable.findMany({
      where: eq(PostTable.userId, userId),
    });

    return c.json({
      success: true,
      message: 'User posts retrieved successfully',
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts.length,
          totalPages: Math.ceil(totalPosts.length / limit),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

// Update post (only by post owner)
export const updatePost = async (c: Context) => {
  const userId = c.get('user').id;
  const postId = c.req.param('id');
  const { content } = await c.req.json<PostFormValues>();

  const post = await db.query.PostTable.findFirst({
    where: eq(PostTable.id, postId),
  });

  if (!post) {
    return c.json({ success: false, message: 'Post not found' }, 404);
  }

  if (post.userId !== userId) {
    return c.json(
      { success: false, message: 'You can only edit your own posts' },
      403,
    );
  }

  const [updatedPost] = await db
    .update(PostTable)
    .set({ content })
    .where(eq(PostTable.id, postId))
    .returning();

  return c.json({
    success: true,
    message: 'Post updated successfully',
    post: updatedPost,
  });
};

// Delete post (only by post owner)
export const deletePost = async (c: Context) => {
  const userId = c.get('user').id;
  const postId = c.req.param('id');

  const post = await db.query.PostTable.findFirst({
    where: eq(PostTable.id, postId),
  });

  if (!post) {
    return c.json({ success: false, message: 'Post not found' }, 404);
  }

  if (post.userId !== userId) {
    return c.json(
      { success: false, message: 'You can only delete your own posts' },
      403,
    );
  }

  await db.delete(PostTable).where(eq(PostTable.id, postId));

  return c.json({ success: true, message: 'Post deleted successfully' });
};
