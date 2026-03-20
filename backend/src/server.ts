import { initializeMonitoring } from './config/monitoring';
import { validateEnv } from './config/env';
import { loadSecrets } from './config/secrets/secretsLoader';
import { connectToDatabase, closeDatabaseConnection } from './config/database/database';
import redisClient from './config/database/redis';
import { ensureDefaultTenant } from './seeds/defaultTenant';
import logger from './config/logger';

initializeMonitoring();
validateEnv();

import app from './app';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await loadSecrets();
  await connectToDatabase();
  await ensureDefaultTenant();

  const server = app.listen(PORT, () => {
    logger.info('🚀 ===================================');
    logger.info(`🚀 Secom API running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    logger.info('🚀 ===================================');

    if (process.env.NODE_ENV === 'development') {
      redisClient.get('worker:health').then((val) => {
        if (!val) {
          logger.warn('⚠️  Worker process is not running. Email delivery, webhook dispatch, and domain event processing will fail silently.');
          logger.warn('⚠️  Run \'npm run dev:all\' from the project root to start the API, worker, and frontend together.');
        }
      }).catch(() => {});
    }
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await redisClient.quit();
        logger.info('Redis connection closed');
      } catch (err) {
        logger.error({ err }, 'Error closing Redis');
      }
      try {
        await closeDatabaseConnection();
      } catch (err) {
        logger.error({ err }, 'Error closing database connection');
      }
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
