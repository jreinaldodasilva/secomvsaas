import crypto from 'crypto';
import { WebhookSubscription } from '../../models/WebhookSubscription';
import logger from '../../config/logger';

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

class WebhookService {
  async create(tenantId: string, url: string, events: string[], createdBy: string) {
    const secret = crypto.randomBytes(32).toString('hex');
    return WebhookSubscription.create({ tenantId, url, events, secret, createdBy });
  }

  async list(tenantId: string) {
    return WebhookSubscription.find({ tenantId, isActive: true }).lean();
  }

  async delete(tenantId: string, id: string) {
    return WebhookSubscription.findOneAndUpdate({ _id: id, tenantId }, { isActive: false }, { new: true });
  }

  async dispatch(tenantId: string, event: string, payload: Record<string, any>) {
    const subs = await WebhookSubscription.find({ tenantId, isActive: true, events: event }).lean();
    for (const sub of subs) {
      this.deliver(sub.url, sub.secret, sub._id.toString(), event, payload).catch((err) =>
        logger.error({ err, webhookId: sub._id, event }, 'Webhook delivery failed'),
      );
    }
  }

  private async deliver(url: string, secret: string, webhookId: string, event: string, payload: Record<string, any>) {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = signPayload(body, secret);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature, 'X-Webhook-Event': event },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      logger.warn({ webhookId, status: res.status, event }, 'Webhook delivery non-2xx');
    }
  }
}

export const webhookService = new WebhookService();
