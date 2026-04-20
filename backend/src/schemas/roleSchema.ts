import * as z from 'zod';

export const rolePermissionSchema = z.object({
  permissionIds: z
    .array(z.uuid('Invalid Permission ID format'))
    .min(1, 'At least one permission is required'),
});

// Reusable schema for operations that require a role name
export const roleSchema = z.object({
  name: z.string().nonempty('Name is required'),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export type RolePermissionFormValues = z.infer<typeof rolePermissionSchema>;
