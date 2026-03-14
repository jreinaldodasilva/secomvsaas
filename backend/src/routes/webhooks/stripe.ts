import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { eventBus, BILLING_EVENTS } from '../../platform/events';
import logger from '../../config/logger';

const router = Router();

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!env.stripe.secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');
    _stripe = new Stripe(env.stripe.secretKey);
  }
  return _stripe;
}

const EVENT_MAP: Record<string, string> = {
  'checkout.session.completed': BILLING_EVENTS.SUBSCRIPTION_CREATED,
  'invoice.payment_succeeded': BILLING_EVENTS.PAYMENT_SUCCEEDED,
  'invoice.payment_failed': BILLING_EVENTS.PAYMENT_FAILED,
  'customer.subscription.updated': BILLING_EVENTS.SUBSCRIPTION_ACTIVATED,
  'customer.subscription.deleted': BILLING_EVENTS.SUBSCRIPTION_CANCELLED,
};

router.post('/', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Stripe webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const busEvent = EVENT_MAP[event.type];
  if (busEvent) {
    await eventBus.emit(busEvent, {
      stripeEventId: event.id,
      stripeEventType: event.type,
      data: event.data.object,
    });
    logger.info({ stripeEventId: event.id, type: event.type }, 'Stripe webhook processed');
  } else {
    logger.debug({ type: event.type }, 'Unhandled Stripe event type');
  }

  return res.json({ received: true });
});

export default router;
