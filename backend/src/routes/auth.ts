import express, { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { authenticate, AuthenticatedRequest } from '../middleware/auth/auth';
import { maskEmail } from '../utils/masking';
import { auditService } from '../services/admin/auditService';
import { UnauthorizedError } from '../utils/errors';
import {
  loginValidation,
  registerValidation,
  acceptInviteValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from './validations/authValidation';
import { validateRequest } from '../middleware/validate';

const router = express.Router();

// Rename cookie constants to match your app
const ACCESS_COOKIE = 'vsaas_access_token';
const REFRESH_COOKIE = 'refreshToken';

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge,
});

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
router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      deviceId: req.headers['x-device-id'] as string,
    };
    const result = await authService.register(req.body, deviceInfo);
    const { accessToken, refreshToken, expiresIn, user, tenant } = result.data;

    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

    return res.status(201).json({ success: true, data: { user, tenant, expiresIn } });
  } catch (error) {
    next(error);
  }
});

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
router.post('/login', loginValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      deviceId: req.headers['x-device-id'] as string,
    };
    const result = await authService.login(req.body, deviceInfo);
    const { accessToken, refreshToken, expiresIn, user } = result.data;

    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

    auditService.log({
      user: user.id,
      action: 'login',
      resource: 'auth',
      method: 'POST',
      path: req.path,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    return res.json({ success: true, data: { user, expiresIn } });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      auditService.log({
        action: 'failed_login',
        resource: 'auth',
        method: 'POST',
        path: req.path,
        ipAddress: req.ip || 'unknown',
        metadata: { email: maskEmail(req.body?.email) },
      }).catch(() => {});
    }
    next(error);
  }
});

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
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    const user = await authService.getUserById(authReq.user.id);
    return res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

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
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Token de atualização obrigatório' });

    const { accessToken, refreshToken: newRefresh, expiresIn } = await authService.refreshAccessToken(refreshToken);
    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, newRefresh, cookieOpts(7 * 24 * 60 * 60 * 1000));
    return res.json({ success: true, data: { expiresIn } });
  } catch (error) { next(error); }
});

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
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    if (refreshToken) await authService.logout(refreshToken);
    res.clearCookie(ACCESS_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) { next(error); }
});

router.post('/logout-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    await authService.logoutAllDevices(authReq.user.id);
    return res.json({ success: true, message: 'Logout realizado em todos os dispositivos' });
  } catch (error) { next(error); }
});

router.patch('/change-password', authenticate, changePasswordValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    await authService.changePassword(authReq.user.id, req.body.currentPassword, req.body.newPassword);
    return res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) { next(error); }
});

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
router.post('/forgot-password', forgotPasswordValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPassword(req.body.email);
    return res.json({ success: true, message: 'Se o e-mail estiver registrado, um link de redefinição de senha foi enviado.' });
  } catch (error) { next(error); }
});

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
router.post('/reset-password', resetPasswordValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPasswordWithToken(req.body.token, req.body.newPassword);
    return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
  } catch (error) { next(error); }
});

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
router.post('/accept-invite', acceptInviteValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      deviceId: req.headers['x-device-id'] as string,
    };
    const result = await authService.acceptInvite(req.body.token, req.body.name, req.body.password, deviceInfo);
    const { accessToken, refreshToken, expiresIn, user } = result.data;

    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));

    return res.status(201).json({ success: true, data: { user, expiresIn } });
  } catch (error) { next(error); }
});

export default router;
