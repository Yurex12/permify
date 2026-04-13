export const DB_ERRORS = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

type DbErrorCode = (typeof DB_ERRORS)[keyof typeof DB_ERRORS];

// export const isDbError = (
//   error: unknown,
//   code: DbErrorCode,
// ): error is DatabaseError => {
//   return error instanceof DatabaseError && error.code === code;
// };

export const isDbError = (error: unknown, code: DbErrorCode): boolean => {
  // 1. Check if it's an object
  if (typeof error === 'object' && error !== null) {
    // 2. Cast to record to access 'code' without TS complaining
    const err = error as Record<string, unknown>;

    // 3. Match the code
    return err.code === code;
  }
  return false;
};
