import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  message: {
    message:
      'Too many failed sign-in attempts. Please try again later.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      'Too many password reset attempts. Please try again later.'
  }
});

router.post(
  '/register',
  register
);

router.post(
  '/login',
  loginLimiter,
  login
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  passwordResetLimiter,
  resetPassword
);

router.get(
  '/me',
  protect,
  me
);

export default router;