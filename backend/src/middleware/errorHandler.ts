import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorLogger } from '../utils/errors/errorLogger';
import { ErrorCodes } from '../utils/errors/errorCodes';

export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction): Response => {
  ErrorLogger.log(error, `${req.method} ${req.path}`);

  const requestId = (req as any).requestId || 'unknown';
  const timestamp = new Date().toISOString();
  const meta = { timestamp, requestId };

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code || ErrorCodes.SYS_INTERNAL_ERROR, message: error.message, details: error.details },
      meta,
    });
  }

  if (error.name === 'ValidationError') {
    const e = error as any;
    return res.status(422).json({
      success: false,
      error: { code: ErrorCodes.VAL_INVALID_INPUT, message: 'Erro de validação', details: Object.values(e.errors || {}).map((v: any) => v.message) },
      meta,
    });
  }

  if (error.name === 'CastError') {
    return res.status(422).json({ success: false, error: { code: ErrorCodes.VAL_INVALID_ID, message: 'ID inválido' }, meta });
  }

  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0] || 'campo';
    return res.status(409).json({ success: false, error: { code: ErrorCodes.RES_ALREADY_EXISTS, message: `Registro duplicado: ${field} já existe`, details: { field } }, meta });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: { code: ErrorCodes.AUTH_TOKEN_INVALID, message: 'Token inválido' }, meta });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: { code: ErrorCodes.AUTH_TOKEN_EXPIRED, message: 'Token expirado' }, meta });
  }

  if (error.message === 'invalid csrf token' || (error as any).code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, error: { code: ErrorCodes.PERM_FORBIDDEN, message: 'Token CSRF inválido' }, meta });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.SYS_INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : error.message,
      details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
    },
    meta,
  });
};
