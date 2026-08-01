import crypto from 'node:crypto';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';
import { createToken } from '../utils/token.js';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

function normalizeUsername(value = '') {
  return value.trim().toLowerCase();
}

function normalizeEmail(value = '') {
  return value.trim().toLowerCase();
}

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error(
      'Name, username, email and password are required'
    );
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const cleanUsername = normalizeUsername(username);
  const cleanEmail = normalizeEmail(email);

  const existingUser = await User.findOne({
    $or: [
      { email: cleanEmail },
      { username: cleanUsername }
    ]
  });

  if (existingUser) {
    res.status(409);

    throw new Error(
      existingUser.email === cleanEmail
        ? 'Email already registered'
        : 'Username already taken'
    );
  }

  const user = await User.create({
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password
  });

  res.status(201).json({
    token: createToken(user._id),
    user: user.toSafeObject()
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: normalizeEmail(email)
  }).select('+password');

  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    token: createToken(user._id),
    user: user.toSafeObject()
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user.toSafeObject()
  });
});

export const forgotPassword = asyncHandler(
  async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const genericMessage =
      'If an account exists for that email, password reset instructions have been prepared.';

    const user = await User.findOne({ email });

    /*
     * Return the same message when no user is found.
     * This prevents people from checking which emails are registered.
     */
    if (!user) {
      return res.json({
        message: genericMessage
      });
    }

    const rawToken = crypto
      .randomBytes(32)
      .toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MS
    );

    await user.save({
      validateBeforeSave: false
    });

    const clientUrl = (
      process.env.CLIENT_URL ||
      'http://localhost:5173'
    ).replace(/\/$/, '');

    const resetUrl =
      `${clientUrl}/reset-password/${rawToken}`;

    try {
      const emailSent = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
      });

      if (!emailSent) {
        console.log(
          `Vynora password reset link for ${user.email}:`
        );

        console.log(resetUrl);
      }

      res.json({
        message: emailSent
          ? genericMessage
          : 'Development mode: open the reset link shown below.',

        /*
         * The reset URL is returned only during local development.
         */
        ...(emailSent ||
        process.env.NODE_ENV === 'production'
          ? {}
          : { resetUrl })
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;

      await user.save({
        validateBeforeSave: false
      });

      res.status(500);

      throw new Error(
        'Password reset email could not be sent. Please try again.'
      );
    }
  }
);

export const resetPassword = asyncHandler(
  async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      res.status(400);

      throw new Error(
        'Password and confirmation are required'
      );
    }

    if (password.length < 6) {
      res.status(400);

      throw new Error(
        'Password must be at least 6 characters'
      );
    }

    if (password !== confirmPassword) {
      res.status(400);

      throw new Error('Passwords do not match');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpiresAt: {
        $gt: new Date()
      }
    }).select(
      '+resetPasswordToken +resetPasswordExpiresAt'
    );

    if (!user) {
      res.status(400);

      throw new Error(
        'This reset link is invalid or has expired'
      );
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    res.json({
      message: 'Password reset successfully',
      token: createToken(user._id),
      user: user.toSafeObject()
    });
  }
);