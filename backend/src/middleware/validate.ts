import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';
import { ErrorCodes } from '../utils/errors/errorCodes';

const toDetails = (req: Request) =>
  validationResult(req).array().map(err => ({
    field: err.type === 'field' ? (err as any).path : undefined,
    message: err.msg,
  }));

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new ValidationError('Dados inválidos', toDetails(req), ErrorCodes.VAL_INVALID_INPUT));
};
