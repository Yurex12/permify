import 'dotenv/config';

import { db } from './index.js';
import { RoleTable } from './schema.js';

const roles = [{ name: 'admin' }, { name: 'user' }, { name: 'manager' }];

async function main() {
  console.log('🌱 Seeding Roles...');

  await db.insert(RoleTable).values(roles).onConflictDoNothing();

  console.log('successful');
  process.exit(0);
}

main().catch((err) => {
  console.log('Seeding failed:', err);
  process.exit(1);
});
