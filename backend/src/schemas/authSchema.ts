import { z } from 'zod';

export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password should be at least 8 character')
    .max(25, 'Password should not be more than 25 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});

export const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const emailSchema = z.object({
  email: z.email('Invalid email address'),
});

export const tokenSchema = z.object({
  token: z.string().length(6, 'Token must be exactly 6 characters'),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
  })
  .extend(passwordSchema.shape);

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const authCodeSchema = userIdSchema.extend(tokenSchema.shape);

export const resetPasswordSchema = authCodeSchema.extend(passwordSchema.shape);

export type UserIdSchema = z.infer<typeof userIdSchema>;
export type EmailSchema = z.infer<typeof emailSchema>;

export type SignupFormValues = z.infer<typeof signupSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type AuthCodeFormValues = z.infer<typeof authCodeSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
