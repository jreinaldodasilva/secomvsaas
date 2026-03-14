import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const checkDatabaseConnection = (_req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: { code: 'SYS_DATABASE_ERROR', message: 'Database unavailable' } });
  }
  next();
};
