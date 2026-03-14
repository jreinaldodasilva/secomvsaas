import logger from '../../config/logger';
import { AppError } from './errors';
import { maskSensitiveData } from '../masking';

export class ErrorLogger {
  static log(error: Error | AppError, context?: string) {
    const isOperational = error instanceof AppError ? error.isOperational : false;
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      isOperational,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        code: error.code,
        details: error.details ? maskSensitiveData(error.details) : undefined,
      }),
    };
    if (isOperational) {
      logger.warn(errorLog, 'Operational Error');
    } else {
      logger.error(errorLog, 'Programming Error');
    }
  }
}
