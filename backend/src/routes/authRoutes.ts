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
  authCodeSchema,
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  userIdSchema,
} from '../schemas/authSchema.js';

const router = new Hono()
  .post('/signup', validateInput('json', signupSchema), signupUser)
  .post('/login', validateInput('json', loginSchema), loginUser)
  .post('/verify-email', validateInput('json', authCodeSchema), verifyEMail)
  .post(
    '/resend-verification',
    validateInput('json', userIdSchema),
    resendVerificationCode,
  )
  .post('/forgot-password', validateInput('json', emailSchema), forgotPassword)
  .post(
    '/verify-reset',
    validateInput('json', authCodeSchema),
    verifyResetPasswordCode,
  )
  .post(
    '/reset-password',
    validateInput('json', resetPasswordSchema),
    resetPassword,
  )
  .post('/logout', logoutUser);

export default router;
