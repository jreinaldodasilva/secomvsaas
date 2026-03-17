import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/admin/auditService';
import { AuthenticatedRequest } from './auth/auth';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const getActionFromMethod = (method: string): string =>
  ({ POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' }[method] || 'unknown');

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  const authReq = req as AuthenticatedRequest;

  res.on('finish', () => {
    if (!authReq.user || authReq.path.includes('/health')) return;
    setImmediate(() => {
      auditService.logFromRequest(
        authReq,
        getActionFromMethod(authReq.method),
        authReq.path.split('/')[1] || 'unknown',
        { statusCode: res.statusCode },
      ).catch(err => logger.error('Audit logging error:', err));
    });
  });

  next();
};
