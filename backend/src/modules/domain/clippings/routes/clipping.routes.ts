import { Router } from 'express';
import { clippingController } from '../controllers/clipping.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createClippingSchema, updateClippingSchema, clippingFiltersSchema } from '../validators/clipping.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/clippings:
 *   post:
 *     tags: [Clippings]
 *     summary: Create a clipping
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, source]
 *             properties:
 *               title: { type: string, minLength: 3 }
 *               source: { type: string, minLength: 2 }
 *               sourceUrl: { type: string, format: uri }
 *               publishedAt: { type: string, format: date-time }
 *               sentiment: { type: string, enum: [positive, neutral, negative] }
 *               summary: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Clipping created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CLIPPINGS_WRITE] }),
  validateSchema(createClippingSchema),
  clippingController.create
);

/**
 * @swagger
 * /api/v1/clippings:
 *   get:
 *     tags: [Clippings]
 *     summary: List clippings
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: sentiment, schema: { type: string, enum: [positive, neutral, negative] } }
 *       - { in: query, name: source, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of clippings }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CLIPPINGS_READ] }),
  validateSchema(clippingFiltersSchema, 'query'),
  clippingController.list
);

/**
 * @swagger
 * /api/v1/clippings/{id}:
 *   get:
 *     tags: [Clippings]
 *     summary: Get a clipping by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Clipping details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CLIPPINGS_READ] }),
  clippingController.findById
);

/**
 * @swagger
 * /api/v1/clippings/{id}:
 *   patch:
 *     tags: [Clippings]
 *     summary: Update a clipping
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
 *               source: { type: string }
 *               sourceUrl: { type: string, format: uri }
 *               publishedAt: { type: string, format: date-time }
 *               sentiment: { type: string, enum: [positive, neutral, negative] }
 *               summary: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Clipping updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CLIPPINGS_WRITE] }),
  validateSchema(updateClippingSchema),
  clippingController.update
);

/**
 * @swagger
 * /api/v1/clippings/{id}:
 *   delete:
 *     tags: [Clippings]
 *     summary: Delete a clipping
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Clipping deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CLIPPINGS_DELETE] }),
  clippingController.delete
);

export default router;
