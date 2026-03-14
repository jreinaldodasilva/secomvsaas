import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth';
import { BaseAuthMiddleware } from '../shared/baseAuth';
import { ApiResponse } from '../../utils/responseHelpers';
import { env } from '../../config/env';
import redisClient from '../../config/database/redis';
import { auditService } from '../../services/admin/auditService';
import { hasAnyPermission, hasAllPermissions } from '../../config/rbac/registry';
import type { Permission } from '../../config/rbac/permissions';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export type AuthenticatedRequest = Request & { user?: AuthUser };

function logAuthzFailure(req: Request, reason: string): void {
  const authReq = req as AuthenticatedRequest;
  auditService.log({
    user: authReq.user?.id,
    action: 'authz_failure',
    resource: req.path,
    method: req.method,
    path: req.path,
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('user-agent'),
    tenantId: authReq.user?.tenantId,
    metadata: { role: authReq.user?.role, reason },
  }).catch(() => {});
}

class StaffAuthMiddleware extends BaseAuthMiddleware {
  protected getCookieTokens(cookies: any): string | null {
    // Rename cookie to match your app
    return cookies['vsaas_access_token'] || null;
  }

  protected async verifyToken(token: string): Promise<any> {
    return authService.verifyAccessToken(token);
  }

  protected async attachUserToRequest(req: Request, payload: any): Promise<void> {
    if (!payload?.userId) throw new Error('Invalid token format');

    (req as AuthenticatedRequest).user = {
      id: String(payload.userId),
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };

    if (env.security.verifyUserOnRequest) {
      const user = (req as AuthenticatedRequest).user!;
      const cacheKey = `user:active:${user.id}`;
      const cached = await redisClient.get(cacheKey).catch(() => null);
      if (cached === null) {
        const dbUser = await authService.getUserById(user.id) as any;
        if (!dbUser.isActive) throw new Error('User inactive');
        await redisClient.setex(cacheKey, 30, '1').catch(() => {});
      } else if (cached === '0') {
        throw new Error('User inactive');
      }
    }
  }
}

const staffAuth = new StaffAuthMiddleware();

export const authenticate = staffAuth.authenticate.bind(staffAuth);
export const optionalAuth = staffAuth.optionalAuth.bind(staffAuth);

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) { ApiResponse.unauthorized(res, 'Autenticação obrigatória', 'NOT_AUTHENTICATED'); return; }

    const { role } = authReq.user;
    if (!role) { ApiResponse.forbidden(res, 'Permissões de usuário não definidas', 'NO_ROLE'); return; }
    if (role === 'super_admin') { next(); return; }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      logAuthzFailure(req, `role '${role}' not in [${allowedRoles.join(', ')}]`);
      ApiResponse.insufficientRole(res);
      return;
    }
    next();
  };
};

export const authorizeWithPermissions = (options: { roles?: string[]; permissions?: Permission[]; requireAll?: boolean }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) { ApiResponse.unauthorized(res, 'Autenticação obrigatória', 'NOT_AUTHENTICATED'); return; }

    const { role } = authReq.user;
    if (!role) { ApiResponse.forbidden(res, 'Permissões de usuário não definidas', 'NO_ROLE'); return; }
    if (role === 'super_admin') { next(); return; }

    if (options.roles?.length && !options.roles.includes(role)) {
      logAuthzFailure(req, `role '${role}' not in [${options.roles.join(', ')}]`);
      ApiResponse.insufficientRole(res);
      return;
    }

    if (options.permissions?.length) {
      const ok = options.requireAll
        ? hasAllPermissions(role as any, options.permissions)
        : hasAnyPermission(role as any, options.permissions);
      if (!ok) {
        logAuthzFailure(req, `missing permissions [${options.permissions.join(', ')}]`);
        ApiResponse.forbidden(res, 'Permissões insuficientes', 'INSUFFICIENT_PERMISSIONS');
        return;
      }
    }
    next();
  };
};

export const ensureTenantAccess = (field: 'params' | 'body' | 'query' = 'params', key = 'tenantId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) { ApiResponse.unauthorized(res, 'Autenticação obrigatória', 'NOT_AUTHENTICATED'); return; }
    if (authReq.user.role === 'super_admin') { next(); return; }

    const userTenant = authReq.user.tenantId;
    if (!userTenant) { ApiResponse.forbidden(res, 'Usuário não está associado a um tenant', 'NO_TENANT'); return; }

    const requestedTenant = req[field]?.[key];
    if (requestedTenant && String(requestedTenant) !== String(userTenant)) {
      logAuthzFailure(req, `tenant mismatch: requested '${requestedTenant}' vs user '${userTenant}'`);
      ApiResponse.forbidden(res, 'Acesso negado: tenant não autorizado', 'TENANT_ACCESS_DENIED');
      return;
    }
    next();
  };
};

export const sensitiveOperation = (req: Request, _res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  (req as any).auditContext = {
    userId: authReq.user?.id,
    userEmail: authReq.user?.email,
    userRole: authReq.user?.role,
    tenantId: authReq.user?.tenantId,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  next();
};
