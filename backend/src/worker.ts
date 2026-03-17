import { validateEnv } from './config/env';
import { connectToDatabase, closeDatabaseConnection } from './config/database/database';
import redisClient from './config/database/redis';
import { emailQueue, startEmailWorker } from './queues/emailQueue';
import { auditCleanupQueue, auditCleanupWorker, scheduleAuditCleanup } from './queues/auditCleanupQueue';
import { domainEventsQueue, domainEventsWorker } from './queues/domainEventsQueue';
import { eventBus } from './platform/events';
import { registerAuthEventListeners } from './services/auth/authEventListeners';
import logger from './config/logger';

validateEnv();

const start = async () => {
  await connectToDatabase();
  registerAuthEventListeners();
  eventBus.startWorker();
  const emailWorker = startEmailWorker();
  await scheduleAuditCleanup();

  logger.info('🔧 ===================================');
  logger.info('🔧 Secom Worker process started');
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('🔧 ===================================');

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Worker shutting down gracefully...`);
    try {
      await emailWorker?.close();
      await emailQueue.close();
      await auditCleanupWorker?.close();
      await auditCleanupQueue.close();
      if (domainEventsWorker) await domainEventsWorker.close();
      await domainEventsQueue.close();
      logger.info('BullMQ workers and queues closed');
    } catch (err) {
      logger.error({ err }, 'Error closing BullMQ');
    }
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
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start worker process');
  process.exit(1);
});
