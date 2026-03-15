import { Router } from 'express';
import { citizenPortalController } from '../controllers/citizen-portal.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createCitizenPortalSchema, updateCitizenPortalSchema, citizenPortalFiltersSchema } from '../validators/citizen-portal.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/citizen-portal:
 *   post:
 *     tags: [Citizen Portal]
 *     summary: Create a citizen profile
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, fullName]
 *             properties:
 *               userId: { type: string }
 *               fullName: { type: string, minLength: 2 }
 *               cpf: { type: string, maxLength: 11 }
 *               phone: { type: string }
 *               email: { type: string, format: email }
 *               address: { type: string }
 *               neighborhood: { type: string }
 *               city: { type: string }
 *               state: { type: string, maxLength: 2 }
 *     responses:
 *       201: { description: Citizen profile created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CITIZEN_PORTAL_WRITE] }),
  validateSchema(createCitizenPortalSchema),
  citizenPortalController.create
);

/**
 * @swagger
 * /api/v1/citizen-portal:
 *   get:
 *     tags: [Citizen Portal]
 *     summary: List citizen profiles
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [active, inactive] } }
 *       - { in: query, name: city, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of citizen profiles }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CITIZEN_PORTAL_READ] }),
  validateSchema(citizenPortalFiltersSchema, 'query'),
  citizenPortalController.list
);

/**
 * @swagger
 * /api/v1/citizen-portal/{id}:
 *   get:
 *     tags: [Citizen Portal]
 *     summary: Get a citizen profile by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Citizen profile details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CITIZEN_PORTAL_READ] }),
  citizenPortalController.findById
);

/**
 * @swagger
 * /api/v1/citizen-portal/{id}:
 *   patch:
 *     tags: [Citizen Portal]
 *     summary: Update a citizen profile
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               cpf: { type: string }
 *               phone: { type: string }
 *               email: { type: string, format: email }
 *               address: { type: string }
 *               neighborhood: { type: string }
 *               city: { type: string }
 *               state: { type: string, maxLength: 2 }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200: { description: Citizen profile updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CITIZEN_PORTAL_WRITE] }),
  validateSchema(updateCitizenPortalSchema),
  citizenPortalController.update
);

/**
 * @swagger
 * /api/v1/citizen-portal/{id}:
 *   delete:
 *     tags: [Citizen Portal]
 *     summary: Delete a citizen profile
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Citizen profile deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.CITIZEN_PORTAL_DELETE] }),
  citizenPortalController.delete
);

export default router;
