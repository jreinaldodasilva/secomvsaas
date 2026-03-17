import { Request, Response, NextFunction } from 'express';
import { citizenAuthService, PORTAL_COOKIE, PORTAL_REFRESH_COOKIE } from '../services/auth/citizenAuthService';
import { AuthenticatedRequest } from '../middleware/auth/auth';
import { env } from '../config/env';

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production' || env.nodeEnv === 'staging',
  sameSite: 'strict' as const,
  maxAge,
});

const clearOpts = {
  httpOnly: true,
  secure: env.nodeEnv === 'production' || env.nodeEnv === 'staging',
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || req.body.tenantId;
    const result = await citizenAuthService.register({ ...req.body, tenantId });
    res.cookie(PORTAL_COOKIE, result.accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(PORTAL_REFRESH_COOKIE, result.refreshToken, cookieOpts(env.auth.portalRefreshTokenExpiresDays * 86400 * 1000));
    return res.status(201).json({ success: true, data: { user: result.user, expiresIn: result.expiresIn } });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || req.body.tenantId;
    const result = await citizenAuthService.login({ ...req.body, tenantId });
    res.cookie(PORTAL_COOKIE, result.accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(PORTAL_REFRESH_COOKIE, result.refreshToken, cookieOpts(env.auth.portalRefreshTokenExpiresDays * 86400 * 1000));
    return res.json({ success: true, data: { user: result.user, expiresIn: result.expiresIn } });
  } catch (error) { next(error); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[PORTAL_REFRESH_COOKIE] || req.body.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Token de atualização obrigatório' });
    const result = await citizenAuthService.refresh(token);
    res.cookie(PORTAL_COOKIE, result.accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(PORTAL_REFRESH_COOKIE, result.refreshToken, cookieOpts(env.auth.portalRefreshTokenExpiresDays * 86400 * 1000));
    return res.json({ success: true, data: { expiresIn: result.expiresIn } });
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[PORTAL_REFRESH_COOKIE] || req.body.refreshToken;
    if (token) await citizenAuthService.logout(token);
    res.clearCookie(PORTAL_COOKIE, clearOpts);
    res.clearCookie(PORTAL_REFRESH_COOKIE, clearOpts);
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) { next(error); }
};

export const me = [
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Não autenticado' });
      const user = await citizenAuthService.getMe(authReq.user.id);
      return res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },
];
