import { ErrorCodes, ErrorCode } from './errorCodes';

export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public requestId?: string;

  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: ErrorCode,
    public details?: any,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      errors: this.details,
      meta: { timestamp: this.timestamp, requestId: this.requestId || 'unknown' },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any, code: ErrorCode = ErrorCodes.VAL_INVALID_INPUT) {
    super(message, 422, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, code: ErrorCode = ErrorCodes.RES_NOT_FOUND, details?: any) {
    super(`${resource} não encontrado`, 404, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado', code: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado', code: ErrorCode = ErrorCodes.PERM_FORBIDDEN) {
    super(message, 403, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCodes.RES_CONFLICT) {
    super(message, 409, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCodes.VAL_INVALID_INPUT) {
    super(message, 400, code);
  }
}
