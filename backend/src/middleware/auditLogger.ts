import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/admin/auditService';
import { AuthenticatedRequest } from './auth/auth';

const getActionFromMethod = (method: string): string =>
  ({ GET: 'read', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' }[method] || 'unknown');

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const originalSend = res.send;

  res.send = function (data: any) {
    res.send = originalSend;
    if (authReq.user && !authReq.path.includes('/health')) {
      auditService.logFromRequest(authReq, getActionFromMethod(authReq.method), authReq.path.split('/')[1] || 'unknown', {
        statusCode: res.statusCode,
      }).catch(err => logger.error('Audit logging error:', err));
    }
    return res.send(data);
  };

  next();
};
