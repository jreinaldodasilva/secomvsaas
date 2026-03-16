import logger from '../../config/logger';
import crypto from 'crypto';
import { domainEventsQueue, createDomainEventsWorker } from '../../queues/domainEventsQueue';

export interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

type EventHandler = (event: DomainEvent) => Promise<void>;

const isTest = process.env.NODE_ENV === 'test';

/**
 * BullMQ-backed EventBus.
 *
 * In production/development:
 *   emit()  → adds a job to the 'domain-events' BullMQ queue (Redis-backed).
 *             The worker in this same process (or a dedicated worker process)
 *             dequeues the job and dispatches it to registered in-process handlers.
 *             Events are durable and survive process restarts.
 *
 * In test:
 *   emit()  → dispatches directly to in-process handlers (no Redis required).
 *             Behaviour is identical to the previous in-memory EventBus.
 *
 * The on/off/removeAll/listenerCount interface is unchanged — no call sites
 * need to be modified.
 *
 * To scale to multiple server instances: run a dedicated worker process that
 * imports and calls startWorker(). Each instance registers its own handlers
 * via on(); the BullMQ queue ensures each event is processed exactly once
 * across all instances.
 */
class BullMQEventBus {
  private handlers = new Map<string, EventHandler[]>();

  async emit(type: string, payload: Record<string, any>, metadata?: Record<string, any>): Promise<void> {
    const event: DomainEvent = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      tenantId: metadata?.tenantId,
      userId: metadata?.userId,
      payload,
      metadata,
    };

    logger.debug({ eventType: type, eventId: event.id }, 'Event emitted');

    if (isTest) {
      await this.dispatch(event);
      return;
    }

    await domainEventsQueue.add(type, event, { jobId: event.id });
  }

  /** Called by the BullMQ worker to dispatch a dequeued event to handlers. */
  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = [
      ...(this.handlers.get(event.type) || []),
      ...(this.handlers.get('*') || []),
    ];

    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error({ eventType: event.type, eventId: event.id, error }, 'Event handler failed');
        }
      }),
    );
  }

  /**
   * Start the BullMQ worker that processes domain events.
   * Call once at server startup (after registering all listeners via on()).
   * No-op in test environment.
   */
  startWorker(): void {
    if (isTest) return;
    createDomainEventsWorker(async (job) => {
      await this.dispatch(job.data as DomainEvent);
    });
    logger.info('Domain events worker started');
  }

  on(type: string, handler: EventHandler): void {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(type, [...existing, handler]);
  }

  off(type: string, handler: EventHandler): void {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(type, existing.filter((h) => h !== handler));
  }

  removeAll(type?: string): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  listenerCount(type: string): number {
    return (this.handlers.get(type) || []).length;
  }
}

// Singleton — same export name, same interface, drop-in replacement
export const eventBus = new BullMQEventBus();

// Keep EventBus exported for tests that instantiate it directly
export { BullMQEventBus as EventBus };
