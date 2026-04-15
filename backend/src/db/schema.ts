import { relations } from 'drizzle-orm';
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

// RELATIONS

export const RoleRelations = relations(RoleTable, ({ many }) => ({
  users: many(UserTable),
  rolePermissions: many(RolePermissionTable),
}));

export const PermissionRelations = relations(PermissionTable, ({ many }) => ({
  rolePermissions: many(RolePermissionTable),
}));

export const RolePermissionRelations = relations(
  RolePermissionTable,
  ({ one }) => ({
    role: one(RoleTable, {
      fields: [RolePermissionTable.roleId],
      references: [RoleTable.id],
    }),
    permission: one(PermissionTable, {
      fields: [RolePermissionTable.permissionId],
      references: [PermissionTable.id],
    }),
  }),
);

export const UserRelations = relations(UserTable, ({ one, many }) => ({
  role: one(RoleTable, {
    fields: [UserTable.roleId],
    references: [RoleTable.id],
  }),
  sessions: many(SessionTable),
  verifications: many(VerificationTable),
  PasswordResets: many(PasswordResetTable),
}));

export const SessionRelations = relations(SessionTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [SessionTable.userId],
    references: [UserTable.id],
  }),
}));

export const VerificationRelations = relations(
  VerificationTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [VerificationTable.userId],
      references: [UserTable.id],
    }),
  }),
);

export const PasswordResetRelations = relations(
  PasswordResetTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [PasswordResetTable.userId],
      references: [UserTable.id],
    }),
  }),
);
