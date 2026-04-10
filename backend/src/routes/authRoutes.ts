import { Hono } from 'hono';

import {
  forgotPassword,
  loginUser,
  logoutUser,
  resendVerificationCode,
  resetPassword,
  signupUser,
  verifyEMail,
  verifyResetPasswordCode,
} from '../controllers/authController.js';
import { validateInput } from '../middlewares/validateInput.js';
import {
  emailSchema,
  loginSchema,
  signupSchema,
  userIdSchema,
  authCodeSchema,
  resetPasswordSchema,
} from '../schemas/authSchema.js';

const auth = new Hono();

auth.post('/signup', validateInput('json', signupSchema), signupUser);

auth.post('/login', validateInput('json', loginSchema), loginUser);

auth.post('/verify-email', validateInput('json', authCodeSchema), verifyEMail);

auth.post(
  '/resend-verification',
  validateInput('json', userIdSchema),
  resendVerificationCode,
);

auth.post(
  '/forgot-password',
  validateInput('json', emailSchema),
  forgotPassword,
);
auth.post(
  '/verify-reset-password-code',
  validateInput('json', authCodeSchema),
  verifyResetPasswordCode,
);
auth.post(
  '/reset-password',
  validateInput('json', resetPasswordSchema),
  resetPassword,
);

auth.post('/logout', logoutUser);

export default auth;
