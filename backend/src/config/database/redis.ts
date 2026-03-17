import logger from '../logger';
import Redis from 'ioredis';
import { env } from '../env';

const isTest = process.env.NODE_ENV === 'test';

function createRedisClient(): Redis {
  const sentinelHosts = env.redis.sentinelHosts;

  if (sentinelHosts) {
    // Sentinel mode — parse comma-separated "host:port" list
    const sentinels = sentinelHosts.split(',').map((entry) => {
      const [host, port] = entry.trim().split(':');
      return { host, port: parseInt(port ?? '26379', 10) };
    });

    return new Redis({
      sentinels,
      name: env.redis.sentinelName,
      lazyConnect: true,
      maxRetriesPerRequest: isTest ? 1 : 3,
    });
  }

  // Standalone mode
  return new Redis(env.redis.url, {
    lazyConnect: true,
    maxRetriesPerRequest: isTest ? 1 : 3,
  });
}

const redisClient = createRedisClient();

redisClient.on('connect', () => {
  if (!isTest) logger.info({ sentinel: !!env.redis.sentinelHosts }, 'Connected to Redis');
});

redisClient.on('error', (err) => {
  if (!isTest) logger.error({ err }, 'Redis connection error');
});

export default redisClient;
