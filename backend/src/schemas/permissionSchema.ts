import * as z from 'zod';

export const permissionSchema = z.object({
  action: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(100)

    .regex(
      /^[a-z]+:[a-z_]+$/,
      'Use format "resource:action" (e.g., post:edit)',
    ),

  description: z
    .string()
    .trim()
    .min(5, 'Description is too short')
    .max(150, 'Keep descriptions under 150 characters'),
});
export type PermissionFormValues = z.infer<typeof permissionSchema>;
