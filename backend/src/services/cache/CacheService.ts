import redisClient from '../../config/database/redis';
import logger from '../../config/logger';

export class CacheService {
  constructor(private readonly prefix: string) {}

  private key(k: string) {
    return `${this.prefix}:${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await redisClient.get(this.key(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn({ err, key }, 'Cache get failed');
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      await redisClient.setex(this.key(key), ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.warn({ err, key }, 'Cache set failed');
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(this.key(key));
    } catch (err) {
      logger.warn({ err, key }, 'Cache del failed');
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [next, keys] = await redisClient.scan(cursor, 'MATCH', `${this.prefix}:${pattern}`, 'COUNT', 100);
        cursor = next;
        if (keys.length > 0) await redisClient.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      logger.warn({ err, pattern }, 'Cache invalidatePattern failed');
    }
  }
}
