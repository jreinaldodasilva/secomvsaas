import logger from '../../config/logger';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/responseHelpers';

export abstract class BaseAuthMiddleware {
  protected extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (match && match[1]) return match[1];
    }
    return this.getCookieTokens(req.cookies) ?? null;
  }

  protected abstract getCookieTokens(cookies: any): string | null;
  protected abstract verifyToken(token: string): Promise<any>;
  protected abstract attachUserToRequest(req: Request, payload: any): Promise<void>;

  protected handleAuthError(res: Response, error: any): void {
    let message = 'Token inválido ou expirado';
    let code = 'INVALID_TOKEN';
    if (error instanceof Error) {
      if (error.message.includes('expired')) { message = 'Token expirado'; code = 'TOKEN_EXPIRED'; }
      else if (error.message.includes('invalid')) { message = 'Token inválido'; code = 'INVALID_TOKEN'; }
    }
    ApiResponse.error(res, message, 401, code);
  }

  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      if (!token) { ApiResponse.unauthorized(res, 'Token de acesso obrigatório'); return; }

      const payload = await this.verifyToken(token);
      if (!payload) { ApiResponse.invalidToken(res, 'Token inválido: formato incorreto'); return; }

      await this.attachUserToRequest(req, payload);
      next();
    } catch (error) {
      this.handleAuthError(res, error);
    }
  };

  public optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      if (token) {
        try {
          const payload = await this.verifyToken(token);
          if (payload) await this.attachUserToRequest(req, payload);
        } catch (error) {
          logger.warn({ error: error instanceof Error ? error.message : 'Unknown' }, 'Optional auth failed');
        }
      }
      next();
    } catch {
      next();
    }
  };
}
