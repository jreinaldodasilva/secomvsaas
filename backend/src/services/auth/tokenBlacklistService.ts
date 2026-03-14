import logger from '../../config/logger';
import redisClient from '../../config/database/redis';
import { env } from '../../config/env';

class TokenBlacklistService {
  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    if (ttl <= 0) return;
    try {
      await redisClient.setex(`blacklist:${token}`, ttl, '1');
    } catch (err) {
      if (env.nodeEnv === 'production') throw new Error('Redis unavailable — cannot blacklist token in production');
      logger.warn({ err }, 'Token blacklist write failed (non-production)');
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    try {
      return (await redisClient.get(`blacklist:${token}`)) === '1';
    } catch {
      if (env.nodeEnv === 'production') return true;
      return false;
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
