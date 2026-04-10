import { zValidator } from '@hono/zod-validator';
import type { ZodType } from 'zod';

type ValidationTarget = 'json' | 'query' | 'param' | 'form' | 'header';

export function validateInput(target: ValidationTarget, schema: ZodType) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success)
      return c.json(
        {
          success: false,
          message: 'Invalid input',
          errors: result.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        400,
      );
  });
}
