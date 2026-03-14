import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../../middleware/auth/auth';
import { webhookService } from '../../services/webhooks/webhookService';

const router = Router();

router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

/**
 * @swagger
 * /api/v1/webhooks/subscriptions:
 *   get:
 *     tags: [Webhooks]
 *     summary: List webhook subscriptions for current tenant
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of subscriptions }
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, error: { message: 'No tenant' } });
    const subs = await webhookService.list(tenantId);
    res.json({ success: true, data: subs });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/webhooks/subscriptions:
 *   post:
 *     tags: [Webhooks]
 *     summary: Create a webhook subscription
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, events]
 *             properties:
 *               url: { type: string }
 *               events: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Subscription created }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user!.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, error: { message: 'No tenant' } });
    const { url, events } = req.body;
    if (!url || !events?.length) return res.status(422).json({ success: false, error: { message: 'url and events are required' } });
    const sub = await webhookService.create(tenantId, url, events, authReq.user!.id);
    res.status(201).json({ success: true, data: sub });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/webhooks/subscriptions/{id}:
 *   delete:
 *     tags: [Webhooks]
 *     summary: Deactivate a webhook subscription
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Subscription deactivated }
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, error: { message: 'No tenant' } });
    await webhookService.delete(tenantId, req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
