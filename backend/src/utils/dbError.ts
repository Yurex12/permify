export const DB_ERRORS = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

type DbErrorCode = (typeof DB_ERRORS)[keyof typeof DB_ERRORS];

export const isDbError = (error: unknown, code: DbErrorCode): boolean => {
  if (typeof error !== 'object' || error === null) return false;

  const cause = (error as any).cause;
  return cause?.name === 'PostgresError' && cause?.code === code;
};
