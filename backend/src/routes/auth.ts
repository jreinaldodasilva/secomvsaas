import express from 'express';
import { validateSchema } from '../validation/middleware';
import {
  loginSchema,
  registerSchema,
  acceptInviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './validations/authValidation';
import * as auth from './auth/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new tenant and owner account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, companyName]
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               companyName: { type: string, minLength: 2 }
 *     responses:
 *       201: { description: Tenant and user created, sets auth cookies }
 *       409: { description: Email or slug already in use }
 */
router.post('/register', validateSchema(registerSchema), auth.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, sets auth cookies }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validateSchema(loginSchema), auth.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Not authenticated }
 */
router.get('/me', ...auth.me);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token cookie
 *     responses:
 *       200: { description: New tokens set in cookies }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', auth.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post('/logout', auth.logout);
router.post('/logout-all', ...auth.logoutAll);
router.patch('/change-password', validateSchema(changePasswordSchema), ...auth.changePassword);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Reset email sent if account exists }
 */
router.post('/forgot-password', validateSchema(forgotPasswordSchema), auth.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password reset successfully }
 *       401: { description: Invalid or expired token }
 */
router.post('/reset-password', validateSchema(resetPasswordSchema), auth.resetPassword);

/**
 * @swagger
 * /api/v1/auth/accept-invite:
 *   post:
 *     tags: [Auth]
 *     summary: Accept a team invitation and create account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, name, password]
 *             properties:
 *               token: { type: string }
 *               name: { type: string, minLength: 2 }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Account created, sets auth cookies }
 *       401: { description: Invalid or expired invite }
 */
router.post('/accept-invite', validateSchema(acceptInviteSchema), auth.acceptInvite);

export default router;
