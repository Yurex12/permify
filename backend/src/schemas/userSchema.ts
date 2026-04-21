import * as z from 'zod';

export const updateUserRoleSchema = z.object({
  roleId: z.uuid('Invalid Role ID format'),
});
export const restrictUserSchema = z.object({
  reason: z
    .string()
    .nonempty('Please state reason for restriction')
    .max(500, 'Reason should be less than 500 characters'),
  expiresAt: z.date(),
});
export const banUserSchema = z.object({
  reason: z
    .string()
    .nonempty('Please state reason for ban')
    .max(500, 'Reason should be less than 500 characters'),
});

export type UpdateUserRoleFormValues = z.infer<typeof updateUserRoleSchema>;
export type RestrictUserFormValues = z.infer<typeof restrictUserSchema>;
export type BanUserFormValues = z.infer<typeof banUserSchema>;
