import crypto from 'crypto';
import { Queue, Worker } from 'bullmq';
import logger from '../config/logger';
import { env } from '../config/env';

const connection = { host: env.redis.host, port: env.redis.port };
const isTest = process.env.NODE_ENV === 'test';

export interface WebhookJobData {
  deliveryId: string;
  webhookId: string;
  tenantId: string;
  url: string;
  secret: string;
  event: string;
  payload: Record<string, any>;
}

export const webhookQueue = new Queue<WebhookJobData>('webhook-delivery', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    // Keep failed jobs for observability — delivery status is also persisted in MongoDB
    removeOnFail: false,
  },
});

function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

export const startWebhookWorker = (): Worker<WebhookJobData> | null => {
  if (isTest) return null;

  const worker = new Worker<WebhookJobData>(
    'webhook-delivery',
    async (job) => {
      const { deliveryId, webhookId, url, secret, event, payload } = job.data;

      // Lazy import to avoid circular dependency at module load time
      const { WebhookDelivery } = await import('../models/WebhookDelivery');

      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = signPayload(body, secret);

      let statusCode: number | undefined;
      let errorMessage: string | undefined;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        statusCode = res.status;

        if (!res.ok) {
          errorMessage = `HTTP ${res.status}`;
          throw new Error(errorMessage);
        }

        await WebhookDelivery.findByIdAndUpdate(deliveryId, {
          status: 'delivered',
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
          lastStatusCode: statusCode,
        });
      } catch (err: any) {
        const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 3);

        await WebhookDelivery.findByIdAndUpdate(deliveryId, {
          status: isLastAttempt ? 'failed' : 'pending',
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
          lastStatusCode: statusCode,
          lastError: err?.message ?? String(err),
        });

        // Re-throw so BullMQ applies backoff and retry
        throw err;
      }
    },
    { connection, concurrency: 10 },
  );

  worker.on('completed', (job) =>
    logger.info({ jobId: job.id, webhookId: job.data.webhookId, event: job.data.event }, 'Webhook delivered'),
  );

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, webhookId: job?.data.webhookId, event: job?.data.event, error: err.message }, 'Webhook delivery failed'),
  );

  return worker;
};

export const addWebhookToQueue = async (data: WebhookJobData): Promise<void> => {
  await webhookQueue.add('deliver', data);
};
