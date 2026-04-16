import { UserTable, SessionTable } from '../db/schema.ts';

type User = typeof UserTable.$inferSelect;
type Session = typeof SessionTable.$inferSelect;

export type UserWithRelations = User & {
  role: string;
  permissions: string[];
};

declare module 'hono' {
  interface ContextVariableMap {
    user: UserWithRelations;
    session: Session;
  }
}
