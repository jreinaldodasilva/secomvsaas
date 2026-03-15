import { Router } from 'express';
import authRoutes from '../auth';
import healthRoutes from '../monitoring/health';
import { tenantRoutes } from '../../platform/tenants';
import userRoutes from '../users/user.routes';
import uploadRoutes from '../uploads/upload.routes';
import webhookSubRoutes from '../webhooks/subscriptions';
import dashboardRoutes from '../dashboard/dashboard.routes';

// Domain modules
import { pressReleaseRoutes } from '../../modules/domain/press-releases';
import { mediaContactRoutes } from '../../modules/domain/media-contacts';
import { clippingRoutes } from '../../modules/domain/clippings';
import { eventRoutes } from '../../modules/domain/events';
import { appointmentRoutes } from '../../modules/domain/appointments';
import { citizenPortalRoutes } from '../../modules/domain/citizen-portal';
import { socialMediaRoutes } from '../../modules/domain/social-media';

const router: Router = Router();

// Platform
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/tenants', tenantRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/webhooks/subscriptions', webhookSubRoutes);
router.use('/dashboard', dashboardRoutes);

// Domain
router.use('/press-releases', pressReleaseRoutes);
router.use('/media-contacts', mediaContactRoutes);
router.use('/clippings', clippingRoutes);
router.use('/events', eventRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/citizen-portal', citizenPortalRoutes);
router.use('/social-media', socialMediaRoutes);

export default router;
