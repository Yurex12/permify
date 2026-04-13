import { UserTable, SessionTable } from '../db/schema.ts';

type User = typeof UserTable.$inferSelect;
type Session = typeof SessionTable.$inferSelect;

export type UserWithRole = User & {
  role: string;
};

declare module 'hono' {
  interface ContextVariableMap {
    user: UserWithRole;
    session: Session;
  }
}
