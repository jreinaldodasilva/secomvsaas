import crypto from 'crypto';
import { WebhookSubscription } from '../../models/WebhookSubscription';
import { WebhookDelivery } from '../../models/WebhookDelivery';
import { addWebhookToQueue } from '../../queues/webhookQueue';
import logger from '../../config/logger';

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
      // Create a delivery record first so status is trackable from the moment of dispatch
      const delivery = await WebhookDelivery.create({
        webhookId: sub._id,
        tenantId,
        event,
        payload,
        status: 'pending',
      });

      await addWebhookToQueue({
        deliveryId: delivery._id.toString(),
        webhookId: sub._id.toString(),
        tenantId,
        url: sub.url,
        secret: sub.secret,
        event,
        payload,
      });

      logger.debug({ webhookId: sub._id, deliveryId: delivery._id, event }, 'Webhook delivery enqueued');
    }
  }

  async listDeliveries(tenantId: string, webhookId?: string, status?: string) {
    const filter: Record<string, any> = { tenantId };
    if (webhookId) filter.webhookId = webhookId;
    if (status) filter.status = status;
    return WebhookDelivery.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  }
}

export const webhookService = new WebhookService();
