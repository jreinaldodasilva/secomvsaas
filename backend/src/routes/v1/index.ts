import { Router } from 'express';
import authRoutes from '../auth';
import healthRoutes from '../monitoring/health';
import { tenantRoutes } from '../../platform/tenants';
import stripeWebhookRoutes from '../webhooks/stripe';
import userRoutes from '../users/user.routes';
import uploadRoutes from '../uploads/upload.routes';
import webhookSubRoutes from '../webhooks/subscriptions';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/tenants', tenantRoutes);
router.use('/webhooks/stripe', stripeWebhookRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/webhooks/subscriptions', webhookSubRoutes);

// Register generated domain modules here:
//   import { exampleRoutes } from '../../modules/domain/example';
//   router.use('/example', exampleRoutes);

export default router;
