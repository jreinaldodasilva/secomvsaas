import { Request } from 'express';
import { BaseAuthMiddleware } from '../shared/baseAuth';
import { citizenAuthService, CitizenTokenPayload, PORTAL_COOKIE } from '../../services/auth/citizenAuthService';
import type { AuthenticatedRequest } from './auth';

class CitizenAuthMiddleware extends BaseAuthMiddleware {
  protected getCookieTokens(cookies: any): string | null {
    return cookies[PORTAL_COOKIE] || null;
  }

  protected async verifyToken(token: string): Promise<CitizenTokenPayload> {
    return citizenAuthService.verify(token);
  }

  protected async attachUserToRequest(req: Request, payload: CitizenTokenPayload): Promise<void> {
    (req as AuthenticatedRequest).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}

const citizenAuth = new CitizenAuthMiddleware();

export const authenticateCitizen = citizenAuth.authenticate.bind(citizenAuth);
