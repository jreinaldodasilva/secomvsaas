import logger from '../../config/logger';
import crypto from 'crypto';

/**
 * In-process EventBus — suitable for single-process deployments.
 *
 * ## Scaling to multi-process / multi-server
 *
 * This EventBus is an in-memory singleton. Events emitted in one process are
 * NOT visible to other processes. When you scale horizontally, swap this with
 * one of the following strategies:
 *
 * ### Option A: Redis Pub/Sub
 * Replace `emit()` with `redisClient.publish(channel, payload)` and subscribe
 * in each process via `redisClient.subscribe(channel)`. Handlers fire in every
 * subscriber. Good for fan-out notifications.
 *
 * ### Option B: BullMQ job queues
 * Replace `emit()` with `queue.add(eventType, payload)`. A single worker
 * processes each event exactly once. Good for background jobs (emails, billing).
 * Already available in this project via `backend/src/services/queue/`.
 *
 * ### Option C: Persistent event log (MongoDB)
 * Write every event to a `domain_events` collection before dispatching.
 * Enables audit trails, event replay, and crash recovery. Consumers track
 * their last-processed event ID (cursor-based).
 *
 * To migrate: create an adapter that implements the same `emit/on/off`
 * interface and swap the singleton export below.
 */

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

class EventBus {
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

    const handlers = [
      ...(this.handlers.get(type) || []),
      ...(this.handlers.get('*') || []),
    ];

    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error({ eventType: type, eventId: event.id, error }, 'Event handler failed');
        }
      })
    );
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

// Singleton
export const eventBus = new EventBus();
export { EventBus };
