import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/database/redis';
import { validate as isUUID } from 'uuid';

const IDEMPOTENCY_TTL = 86400;

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'POST') return next();
  const key = req.headers['idempotency-key'] as string;
  if (!key) return next();

  if (!isUUID(key)) {
    return res.status(422).json({
      success: false,
      data: null,
      error: { code: 'VAL_INVALID_INPUT', message: 'Idempotency-Key must be a valid UUID v4' },
      meta: { timestamp: new Date().toISOString(), requestId: (req as any).requestId || 'unknown', version: 'v1' },
    });
  }

  try {
    const cached = await redisClient.get(`idempotency:${key}`);
    if (cached) {
      const response = JSON.parse(cached);
      return res.status(response.statusCode || 200).json(response.body);
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      redisClient.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, JSON.stringify({ statusCode: res.statusCode, body })).catch(() => {});
      return originalJson(body);
    };
    next();
  } catch {
    next();
  }
};
