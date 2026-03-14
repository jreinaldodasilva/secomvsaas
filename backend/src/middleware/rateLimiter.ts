import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/database/redis';
import { RATE_LIMIT } from '../constants/validation';
import logger from '../config/logger';
import { Request } from 'express';
import { AuthenticatedRequest } from './auth/auth';

const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => {
      const cmd = args[0];
      if (!cmd) return Promise.resolve(0);
      return redisClient.call(cmd, ...args.slice(1)) as Promise<any>;
    },
    prefix: `rl:${prefix}:`,
  });

const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  prefix: string;
  keyGenerator?: (req: Request) => string;
}) =>
  rateLimit({
    store: createRedisStore(options.prefix),
    windowMs: options.windowMs,
    max: options.max,
    message: { success: false, message: options.message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator,
    handler: (req, res) => {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      logger.warn(`Rate limit exceeded for ${key}: ${req.method} ${req.path}`);
      res.status(429).json({ success: false, message: options.message });
    },
  });

export const apiLimiter = createRateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: process.env.NODE_ENV === 'production' ? RATE_LIMIT.API_MAX : 1000,
  message: 'Muitas requisições. Tente novamente em 15 minutos.',
  prefix: 'api',
  keyGenerator: (req) => {
    const tenantId = (req as AuthenticatedRequest).user?.tenantId;
    return tenantId ? `tenant_${tenantId}:${req.ip}` : `ip_${req.ip}`;
  },
});

export const authLimiter = createRateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: process.env.NODE_ENV === 'production' ? RATE_LIMIT.AUTH_MAX : 100,
  message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
  prefix: 'auth',
  keyGenerator: (req) => req.body?.email ? `auth_${req.body.email}` : `auth_ip_${req.ip}`,
});

export const refreshLimiter = createRateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.REFRESH_MAX,
  message: 'Muitas tentativas de renovação de token. Tente novamente em 15 minutos.',
  prefix: 'refresh',
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: RATE_LIMIT.PASSWORD_RESET_MAX,
  message: 'Muitas solicitações de redefinição de senha. Tente novamente em 1 hora.',
  prefix: 'password-reset',
  keyGenerator: (req) => (req as AuthenticatedRequest).user?.id || req.ip || 'unknown',
});

export const inviteLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Muitos convites enviados. Tente novamente em 1 hora.',
  prefix: 'invite',
  keyGenerator: (req) => `tenant_${req.params.id || (req as AuthenticatedRequest).user?.tenantId || req.ip}`,
});

export const contactLimiter = createRateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.CONTACT_MAX,
  message: 'Muitos formulários enviados. Tente novamente em 15 minutos.',
  prefix: 'contact',
});
