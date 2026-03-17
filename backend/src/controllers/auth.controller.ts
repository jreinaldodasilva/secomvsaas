import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { authenticate, AuthenticatedRequest } from '../middleware/auth/auth';
import { maskEmail } from '../utils/masking';
import { auditService } from '../services/admin/auditService';
import { UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';

export const ACCESS_COOKIE = 'secom_access_token';
export const REFRESH_COOKIE = 'refreshToken';

export const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge,
});

const clearCookieOpts = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
};

function deviceInfo(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    deviceId: req.headers['x-device-id'] as string,
  };
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body, deviceInfo(req));
    const { accessToken, refreshToken, expiresIn, user, tenant } = result.data;
    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));
    return res.status(201).json({ success: true, data: { user, tenant, expiresIn } });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body, deviceInfo(req));
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
};

export const me = [
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      const user = await authService.getUserById(authReq.user.id);
      return res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },
];

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Token de atualização obrigatório' });
    const { accessToken, refreshToken: newRefresh, expiresIn } = await authService.refreshAccessToken(token);
    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, newRefresh, cookieOpts(7 * 24 * 60 * 60 * 1000));
    return res.json({ success: true, data: { expiresIn } });
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] || req.body.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie(ACCESS_COOKIE, clearCookieOpts);
    res.clearCookie(REFRESH_COOKIE, clearCookieOpts);
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) { next(error); }
};

export const logoutAll = [
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      await authService.logoutAllDevices(authReq.user.id);
      return res.json({ success: true, message: 'Logout realizado em todos os dispositivos' });
    } catch (error) { next(error); }
  },
];

export const changePassword = [
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      await authService.changePassword(authReq.user.id, req.body.currentPassword, req.body.newPassword);
      return res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) { next(error); }
  },
];

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPassword(req.body.email);
    return res.json({ success: true, message: 'Se o e-mail estiver registrado, um link de redefinição de senha foi enviado.' });
  } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPasswordWithToken(req.body.token, req.body.newPassword);
    return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
  } catch (error) { next(error); }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.acceptInvite(req.body.token, req.body.name, req.body.password, deviceInfo(req));
    const { accessToken, refreshToken, expiresIn, user } = result.data;
    res.cookie(ACCESS_COOKIE, accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000));
    return res.status(201).json({ success: true, data: { user, expiresIn } });
  } catch (error) { next(error); }
};
