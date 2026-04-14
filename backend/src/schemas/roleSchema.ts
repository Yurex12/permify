import * as z from 'zod';

export const roleSchema = z.object({
  permissionIds: z
    .array(z.uuid('Invalid Permission ID format'))
    .min(1, 'At least one permission is required'),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
