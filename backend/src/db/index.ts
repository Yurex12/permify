import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL!;

const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle({ client: queryClient, schema, logger: true });
