import {
  boolean,
  char,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const UserTable = pgTable('userTable', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 225 }).notNull(),
  email: varchar('email', { length: 225 }).notNull().unique(),
  password: varchar('password', { length: 225 }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const SessionTable = pgTable(
  'sessionTable',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }),
  },
  (table) => [index('session_user_Id_idx').on(table.userId)],
);

export const VerificationTable = pgTable(
  'verificationTable',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: char('token', { length: 6 }).notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [index('verification_user_id_idx').on(table.userId)],
);

export const PasswordResetTable = pgTable(
  'PasswordResetTable',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: char('token', { length: 6 }).notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [index('password_reset_user_id_idx').on(table.userId)],
);
