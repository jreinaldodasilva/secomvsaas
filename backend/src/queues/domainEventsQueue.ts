import { Queue, Worker } from 'bullmq';
import logger from '../config/logger';
import { env } from '../config/env';

const connection = { host: env.redis.host, port: env.redis.port };
const isTest = process.env.NODE_ENV === 'test';

export const domainEventsQueue = new Queue('domain-events', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

/**
 * The worker processor is injected at startup by BullMQEventBus.startWorker()
 * so the worker has access to the registered in-process handlers.
 * In test environments the worker is null — events are dispatched in-process.
 */
export let domainEventsWorker: Worker | null = null;

export const createDomainEventsWorker = (
  processor: (job: { name: string; data: any }) => Promise<void>,
): Worker => {
  if (isTest) return null as unknown as Worker;

  const worker = new Worker('domain-events', processor, {
    connection,
    concurrency: 10,
  });

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, eventType: job?.name, error: err }, 'Domain event processing failed'),
  );

  domainEventsWorker = worker;
  return worker;
};
