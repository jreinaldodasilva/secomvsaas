import { validateEnv } from './config/env';
import { loadSecrets } from './config/secrets/secretsLoader';
import { connectToDatabase, closeDatabaseConnection } from './config/database/database';
import redisClient from './config/database/redis';
import { emailQueue, startEmailWorker } from './queues/emailQueue';
import { auditCleanupQueue, auditCleanupWorker, scheduleAuditCleanup } from './queues/auditCleanupQueue';
import { domainEventsQueue, domainEventsWorker } from './queues/domainEventsQueue';
import { webhookQueue, startWebhookWorker } from './queues/webhookQueue';
import { eventBus } from './platform/events';
import { registerAuthEventListeners } from './services/auth/authEventListeners';
import logger from './config/logger';

validateEnv();

const start = async () => {
  await loadSecrets();
  await connectToDatabase();
  registerAuthEventListeners();
  eventBus.startWorker();
  const emailWorker = startEmailWorker();
  const webhookWorker = startWebhookWorker();
  await scheduleAuditCleanup();

  logger.info('🔧 ===================================');
  logger.info('🔧 Secom Worker process started');
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('🔧 ===================================');

  // Publish a health signal so server.ts can detect the worker is running.
  // Key expires after 60 s; the worker refreshes it every 30 s.
  const WORKER_HEALTH_KEY = 'worker:health';
  await redisClient.set(WORKER_HEALTH_KEY, '1', 'EX', 60);
  setInterval(() => redisClient.set(WORKER_HEALTH_KEY, '1', 'EX', 60).catch(() => {}), 30_000);

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Worker shutting down gracefully...`);
    try {
      await emailWorker?.close();
      await emailQueue.close();
      await webhookWorker?.close();
      await webhookQueue.close();
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
