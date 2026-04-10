import 'dotenv/config';
import { Hono } from 'hono';

import { serve } from '@hono/node-server';

import authRoutes from './routes/authRoutes.js';

const PORT = (process.env.PORT as number | undefined) || 8080;

const app = new Hono();

app.get('/', async (c) => {
  return c.text('API is running');
});

app.route('api/auth', authRoutes);

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Not found',
    },
    404,
  );
});

app.onError((error, c) => {
  const isDev = process.env.NODE_ENV === 'development';
  return c.json(
    {
      success: false,
      message: isDev ? error.message : 'Internal Server Error',
      stack: isDev ? error.stack : null,
    },
    500,
  );
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => console.log(`Server running on PORT: ${info.port}`),
);
