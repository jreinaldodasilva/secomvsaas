import { Router } from 'express';
import { pressReleaseController } from '../controllers/press-release.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createPressReleaseSchema, updatePressReleaseSchema, pressReleaseFiltersSchema } from '../validators/press-release.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/press-releases:
 *   post:
 *     tags: [Press Releases]
 *     summary: Create a press release
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string, minLength: 5, maxLength: 300 }
 *               subtitle: { type: string, maxLength: 300 }
 *               content: { type: string, minLength: 10 }
 *               summary: { type: string, maxLength: 500 }
 *               category: { type: string, enum: [nota_oficial, comunicado, convite, esclarecimento, outro] }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Press release created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.PRESS_RELEASES_WRITE] }),
  validateSchema(createPressReleaseSchema),
  pressReleaseController.create
);

/**
 * @swagger
 * /api/v1/press-releases:
 *   get:
 *     tags: [Press Releases]
 *     summary: List press releases
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [draft, review, approved, published, archived] } }
 *       - { in: query, name: category, schema: { type: string, enum: [nota_oficial, comunicado, convite, esclarecimento, outro] } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of press releases }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.PRESS_RELEASES_READ] }),
  validateSchema(pressReleaseFiltersSchema, 'query'),
  pressReleaseController.list
);

/**
 * @swagger
 * /api/v1/press-releases/{id}:
 *   get:
 *     tags: [Press Releases]
 *     summary: Get a press release by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Press release details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.PRESS_RELEASES_READ] }),
  pressReleaseController.findById
);

/**
 * @swagger
 * /api/v1/press-releases/{id}:
 *   patch:
 *     tags: [Press Releases]
 *     summary: Update a press release
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
 *               subtitle: { type: string }
 *               content: { type: string }
 *               summary: { type: string }
 *               category: { type: string, enum: [nota_oficial, comunicado, convite, esclarecimento, outro] }
 *               tags: { type: array, items: { type: string } }
 *               status: { type: string, enum: [draft, review, approved, published, archived] }
 *     responses:
 *       200: { description: Press release updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.PRESS_RELEASES_WRITE] }),
  validateSchema(updatePressReleaseSchema),
  pressReleaseController.update
);

/**
 * @swagger
 * /api/v1/press-releases/{id}:
 *   delete:
 *     tags: [Press Releases]
 *     summary: Delete a press release
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Press release deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.PRESS_RELEASES_DELETE] }),
  pressReleaseController.delete
);

export default router;
