import { Router, Request, Response, NextFunction } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { resolveTenant, setTenantContext, requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import {
  createEventSchema,
  updateEventSchema,
  eventFiltersSchema,
  publicEventFiltersSchema,
  registerEventParticipationSchema,
} from '../validators/event.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';
import { tenantService } from '../../../../platform/tenants/services/tenant.service';

const router = Router();
const DEFAULT_TENANT_SLUG = 'secom';

const ensureTenantForPublicRoutes = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if ((req as any).tenant?.id) {
      next();
      return;
    }
    const tenant = await tenantService.findBySlug(DEFAULT_TENANT_SLUG);
    if (tenant?._id) {
      (req as any).tenant = {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        settings: tenant.settings,
      };
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/public',
  resolveTenant,
  ensureTenantForPublicRoutes,
  requireTenant,
  setTenantContext,
  validateSchema(publicEventFiltersSchema, 'query'),
  eventController.listPublic
);

router.get('/public/:id',
  resolveTenant,
  ensureTenantForPublicRoutes,
  requireTenant,
  setTenantContext,
  eventController.findPublicById
);

router.post('/public/:id/register',
  resolveTenant,
  ensureTenantForPublicRoutes,
  requireTenant,
  setTenantContext,
  validateSchema(registerEventParticipationSchema),
  eventController.registerPublicParticipation
);

router.use(authenticate);
router.use(requireTenant);
router.use(setTenantContext);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     tags: [Events]
 *     summary: Create an event
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startsAt]
 *             properties:
 *               title: { type: string, minLength: 3 }
 *               description: { type: string }
 *               location: { type: string }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *               isPublic: { type: boolean }
 *     responses:
 *       201: { description: Event created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.EVENTS_WRITE] }),
  validateSchema(createEventSchema),
  eventController.create
);

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     tags: [Events]
 *     summary: List events
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [scheduled, ongoing, completed, cancelled] } }
 *       - { in: query, name: isPublic, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of events }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.EVENTS_READ] }),
  validateSchema(eventFiltersSchema, 'query'),
  eventController.list
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get an event by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Event details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.EVENTS_READ] }),
  eventController.findById
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: Update an event
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *               isPublic: { type: boolean }
 *               status: { type: string, enum: [scheduled, ongoing, completed, cancelled] }
 *     responses:
 *       200: { description: Event updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.EVENTS_WRITE] }),
  validateSchema(updateEventSchema),
  eventController.update
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Event deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.EVENTS_DELETE] }),
  eventController.delete
);

export default router;
