import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';
import { TenantContext, TenantContextData } from '../TenantContext';
import { AuthenticatedRequest } from '../../../middleware/auth/auth';
import logger from '../../../config/logger';

/**
 * Resolves the tenant from the request and attaches it to req.tenant.
 *
 * Resolution order:
 * 1. JWT claim (tenantId from authenticated user)
 * 2. X-Tenant-Id header
 * 3. Subdomain extraction
 */
export const resolveTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    // 1. From authenticated user's JWT
    const tenantIdFromToken = authReq.user?.tenantId;

    // 2. From header (used by super_admin or API clients)
    const tenantIdFromHeader = req.headers['x-tenant-id'] as string | undefined;

    // 3. From subdomain (skip IP addresses and localhost)
    const hostname = req.hostname;
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === '[::1]';
    const hostParts = hostname.split('.');
    const subdomain = !isIP && hostParts.length > 2 ? hostParts[0] : undefined;

    const identifier = tenantIdFromToken || tenantIdFromHeader || subdomain;

    if (!identifier) {
      // No tenant context — allow for super_admin or public routes
      if (authReq.user?.role === 'super_admin') {
        return next();
      }
      // For unauthenticated routes (login, register), skip tenant resolution
      return next();
    }

    const tenant = await tenantService.resolve(identifier);
    if (!tenant) {
      res.status(404).json({
        success: false,
        error: { code: 'TENANT_NOT_FOUND', message: 'Tenant não encontrado' },
      });
      return;
    }

    if (tenant.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: { code: 'TENANT_SUSPENDED', message: 'Tenant suspenso. Entre em contato com o suporte.' },
      });
      return;
    }

    if (tenant.status === 'deleted') {
      res.status(404).json({
        success: false,
        error: { code: 'TENANT_NOT_FOUND', message: 'Tenant não encontrado' },
      });
      return;
    }

    // Attach tenant to request
    (req as any).tenant = {
      id: tenant._id?.toString(),
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      settings: tenant.settings,
    };

    next();
  } catch (error) {
    logger.error({ error }, 'Tenant resolution failed');
    next(error);
  }
};

/**
 * Wraps the remaining request lifecycle inside AsyncLocalStorage
 * so that TenantContext.requireTenantId() works anywhere downstream.
 */
export const setTenantContext = (req: Request, _res: Response, next: NextFunction): void => {
  const tenant = (req as any).tenant;
  const user = (req as AuthenticatedRequest).user;

  if (!tenant?.id) {
    // No tenant context — super_admin or public route
    return next();
  }

  const ctx: TenantContextData = {
    tenantId: tenant.id,
    userId: user?.id,
    role: user?.role,
  };

  TenantContext.run(ctx, () => next());
};

/**
 * Requires that a tenant context is present. Use on routes that must be tenant-scoped.
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).tenant?.id) {
    res.status(400).json({
      success: false,
      error: { code: 'TENANT_REQUIRED', message: 'Contexto de tenant é obrigatório' },
    });
    return;
  }
  next();
};
