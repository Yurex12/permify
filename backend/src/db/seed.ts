import 'dotenv/config';
import { db } from './index.js';
import { PermissionTable, RolePermissionTable, RoleTable } from './schema.js';

// ============ ROLES ============
const roles = [
  { name: 'admin' },
  { name: 'moderator' },
  { name: 'editor' },
  { name: 'author' },
  { name: 'user' },
];

// ============ PERMISSIONS ============
const permissions = [
  // user management
  { action: 'user:read', description: 'View users' },
  {
    action: 'user:updateRole',
    description: 'Update a user role',
  },
  { action: 'user:restrict', description: 'Restrict user access temporarily' },
  { action: 'user:ban', description: 'Ban user permanently' },

  // post management
  { action: 'post:read', description: 'View posts' },
  { action: 'post:create', description: 'Create a post' },
  { action: 'post:update', description: 'Update a post' },
  { action: 'post:delete', description: 'Delete a post' },
  { action: 'post:publish', description: 'Publish a post' },

  // comment management
  { action: 'comment:read', description: 'View comments' },
  { action: 'comment:create', description: 'Create a comment' },
  { action: 'comment:delete', description: 'Delete a comment' },
  { action: 'comment:moderate', description: 'Flag or hide a comment' },

  // role management
  { action: 'role:read', description: 'View roles' },
  { action: 'role:create', description: 'Create a role' },
  { action: 'role:update', description: 'Update a role' },
  { action: 'role:delete', description: 'Delete a role' },
  {
    action: 'role:updatePermissions',
    description: 'Assign permissions to a role',
  },

  // permission management
  { action: 'permission:read', description: 'View permissions' },
];

// ============ ROLE → PERMISSIONS MAP ============
// admin is intentionally not here — handled dynamically below
const rolePermissionsMap: Record<string, string[]> = {
  moderator: [
    'user:read',
    'user:updateRole',
    'post:read',
    'comment:read',
    'comment:delete',
    'comment:moderate',
    'role:read',
    'role:create',
    'role:update',
    'role:updatePermissions',
    'permission:read',
  ],
  editor: [
    'post:read',
    'post:create',
    'post:update',
    'post:publish',
    'comment:read',
    'role:read',
    'permission:read',
  ],
  author: [
    'post:read',
    'post:create',
    'post:update',
    'comment:read',
    'comment:create',
  ],
  user: ['post:read', 'comment:read'],
};

async function main() {
  console.log('🌱 Seeding roles and permissions...');

  // 1. seed roles and permissions independently
  await db.insert(RoleTable).values(roles).onConflictDoNothing();
  await db.insert(PermissionTable).values(permissions).onConflictDoNothing();

  // 2. fetch everything from DB
  const seededRoles = await db.query.RoleTable.findMany();
  const seededPermissions = await db.query.PermissionTable.findMany();

  const roleMap = Object.fromEntries(seededRoles.map((r) => [r.name, r.id]));
  const permMap = Object.fromEntries(
    seededPermissions.map((p) => [p.action, p.id]),
  );

  // 3. admin gets every permission that exists in DB — no manual list
  const adminRows = seededPermissions.map((p) => ({
    roleId: roleMap['admin'],
    permissionId: p.id,
  }));

  // 4. other roles get their specific permissions from the map
  const otherRows = Object.entries(rolePermissionsMap).flatMap(
    ([roleName, actions]) =>
      actions.map((action) => ({
        roleId: roleMap[roleName],
        permissionId: permMap[action],
      })),
  );

  // 5. insert all rows — onConflictDoNothing handles re-runs safely
  await db
    .insert(RolePermissionTable)
    .values([...adminRows, ...otherRows])
    .onConflictDoNothing();

  console.log('✅ Seeding complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
