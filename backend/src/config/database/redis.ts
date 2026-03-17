import logger from '../logger';
import Redis from 'ioredis';
import { env } from '../env';

const redisClient = new Redis(env.redis.url, {
  lazyConnect: true,
  maxRetriesPerRequest: process.env.NODE_ENV === 'test' ? 1 : 3,
});

redisClient.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') logger.error({ err }, 'Redis connection error');
});

export default redisClient;
