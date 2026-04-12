import {
  boolean,
  char,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const RoleTable = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).unique().notNull(),
});

export const PermissionTable = pgTable('permission', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: varchar('action', { length: 100 }).unique().notNull(),
  description: text('description'),
});

export const RolePermissionTable = pgTable(
  'role_permission',
  {
    roleId: uuid('role_id').references(() => RoleTable.id, {
      onDelete: 'cascade',
    }),
    permissionId: uuid('permission_id').references(() => PermissionTable.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const UserTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 225 }).notNull(),
  email: varchar('email', { length: 225 }).notNull().unique(),
  password: varchar('password', { length: 225 }).notNull(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => RoleTable.id),
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
  'session',
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
  'verification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: char('token', { length: 6 }).notNull(),
    userId: uuid('user_Id')
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
  'PasswordReset',
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
