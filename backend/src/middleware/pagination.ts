import { Request, Response, NextFunction } from 'express';
import { PAGINATION } from '../constants/validation';

export const validatePagination = (req: Request, _res: Response, next: NextFunction) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
  const page = Math.max(parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE, 1);
  req.pagination = { limit, skip: (page - 1) * limit, page };
  next();
};
