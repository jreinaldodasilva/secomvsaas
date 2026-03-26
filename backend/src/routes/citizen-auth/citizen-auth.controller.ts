import { Request, Response, NextFunction } from 'express';
import { citizenAuthService, PORTAL_COOKIE, PORTAL_REFRESH_COOKIE } from '../../services/auth/citizenAuthService';
import { AuthenticatedRequest } from '../../middleware/auth/auth';
import { env } from '../../config/env';
import { tenantService } from '../../platform/tenants/services/tenant.service';
import { AppointmentService } from '../../modules/domain/appointments/services/appointment.service';

const appointmentService = new AppointmentService();

const DEFAULT_TENANT_SLUG = 'secom';

async function resolveTenantId(req: Request): Promise<string | undefined> {
  const fromReq = (req as any).tenant?.id || req.body.tenantId;
  if (fromReq) return fromReq;
  const tenant = await tenantService.findBySlug(DEFAULT_TENANT_SLUG);
  return tenant?._id?.toString();
}

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
    const tenantId = await resolveTenantId(req);
    const result = await citizenAuthService.register({ ...req.body, tenantId });
    res.cookie(PORTAL_COOKIE, result.accessToken, cookieOpts(15 * 60 * 1000));
    res.cookie(PORTAL_REFRESH_COOKIE, result.refreshToken, cookieOpts(env.auth.portalRefreshTokenExpiresDays * 86400 * 1000));
    return res.status(201).json({ success: true, data: { user: result.user, expiresIn: result.expiresIn } });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = await resolveTenantId(req);
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
      return res.json({ success: true, data: {
        id: (user as any)._id.toString(),
        name: (user as any).name,
        email: (user as any).email,
        role: 'citizen' as const,
        tenantId: (user as any).tenantId?.toString(),
      } });
    } catch (error) { next(error); }
  },
];

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Não autenticado' });
    const updated = await citizenAuthService.updateProfile(authReq.user.id, req.body);
    return res.json({ success: true, data: {
      id: (updated as any)._id.toString(),
      name: (updated as any).name,
      email: (updated as any).email,
      role: 'citizen' as const,
      tenantId: (updated as any).tenantId?.toString(),
    } });
  } catch (error) { next(error); }
};

export const myAppointments = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  try {
    if (!authReq.user?.id) return res.status(401).json({ success: false, message: 'Não autenticado' });
    const result = await appointmentService.list(
      req.query as any,
      { userId: authReq.user.id, role: 'citizen' },
    );
    return res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
