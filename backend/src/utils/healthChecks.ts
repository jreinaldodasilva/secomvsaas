import redisClient from '../config/database/redis';
import logger from '../config/logger';

export async function checkRedisHealth() {
  try {
    const start = Date.now();
    await redisClient.ping();
    return { status: 'healthy' as const, latency: Date.now() - start, message: 'Redis connection successful' };
  } catch (error) {
    logger.error({ error }, 'Redis health check failed');
    return {
      status: 'unhealthy' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Redis connection failed',
    };
  }
}
