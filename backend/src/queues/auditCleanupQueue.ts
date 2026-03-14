import { Queue, Worker } from 'bullmq';
import { AuditLog } from '../models/AuditLog';
import logger from '../config/logger';
import { env } from '../config/env';

const connection = { host: env.redis.host, port: env.redis.port };
const RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_TTL_DAYS || '90', 10);

export const auditCleanupQueue = new Queue('audit-cleanup', { connection });

export const auditCleanupWorker = new Worker('audit-cleanup', async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
  if (result.deletedCount > 0) {
    logger.info({ deletedCount: result.deletedCount, retentionDays: RETENTION_DAYS }, 'Audit log cleanup completed');
  }
}, { connection });

auditCleanupWorker.on('failed', (job, err) =>
  logger.error({ jobId: job?.id, error: err }, 'Audit cleanup job failed'),
);

// Schedule daily at 3 AM
export const scheduleAuditCleanup = async () => {
  await auditCleanupQueue.add('cleanup', {}, {
    repeat: { pattern: '0 3 * * *' },
    removeOnComplete: 5,
    removeOnFail: 10,
  });
};
