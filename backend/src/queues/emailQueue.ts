import { Queue, Worker } from 'bullmq';
import logger from '../config/logger';
import { env } from '../config/env';

const connection = { host: env.redis.host, port: env.redis.port };

export const emailQueue = new Queue('email', { connection });

export const emailWorker = new Worker('email', async (job) => {
  const { to, subject, html } = job.data;
  const { emailService } = await import('../services/external/emailService');
  await emailService.sendEmail({ to, subject, html });
}, {
  connection,
  concurrency: 5,
  limiter: { max: 14, duration: 1000 },
});

emailWorker.on('completed', (job) => logger.info({ jobId: job.id, to: job.data.to }, 'Email sent'));
emailWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, error: err }, 'Email failed'));

export const addEmailToQueue = async (data: { to: string; subject: string; html: string; text?: string }) => {
  await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
};
