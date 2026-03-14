import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function createSuccessResponse<T>(data: T, requestId?: string) {
  return {
    success: true as const,
    data,
    ...(requestId && { meta: { timestamp: new Date().toISOString(), requestId } }),
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  requestId?: string
) {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true as const,
    data: {
      items,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    },
    ...(requestId && { meta: { timestamp: new Date().toISOString(), requestId } }),
  };
}

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, requestId?: string) {
    return res.status(statusCode).json(createSuccessResponse(data, requestId));
  }

  static error(res: Response, message: string, statusCode = 500, code = 'ERROR', requestId?: string) {
    return res.status(statusCode).json({
      success: false,
      error: { code, message },
      meta: { timestamp: new Date().toISOString(), requestId: requestId || 'unknown' },
    });
  }

  static unauthorized(res: Response, message = 'Não autorizado', code?: string) {
    return this.error(res, message, 401, code || 'AUTH_UNAUTHORIZED');
  }

  static forbidden(res: Response, message = 'Acesso negado', code?: string) {
    return this.error(res, message, 403, code || 'PERM_FORBIDDEN');
  }

  static insufficientRole(res: Response, message = 'Permissões insuficientes') {
    return this.error(res, message, 403, 'PERM_INSUFFICIENT');
  }

  static invalidToken(res: Response, message = 'Token inválido') {
    return this.error(res, message, 401, 'AUTH_TOKEN_INVALID');
  }

  static badRequest(res: Response, message: string, errors?: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'VAL_INVALID_INPUT', message, details: errors },
      meta: { timestamp: new Date().toISOString(), requestId: 'unknown' },
    });
  }

  static paginated<T>(res: Response, items: T[], page: number, limit: number, total: number, statusCode = 200, requestId?: string) {
    return res.status(statusCode).json(createPaginatedResponse(items, page, limit, total, requestId));
  }
}
