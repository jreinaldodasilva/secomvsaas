import logger from '../logger';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
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
