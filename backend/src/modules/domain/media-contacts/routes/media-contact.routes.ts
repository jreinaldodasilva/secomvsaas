import { Router } from 'express';
import { mediaContactController } from '../controllers/media-contact.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createMediaContactSchema, updateMediaContactSchema, mediaContactFiltersSchema } from '../validators/media-contact.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/media-contacts:
 *   post:
 *     tags: [Media Contacts]
 *     summary: Create a media contact
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, outlet]
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               outlet: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               beat: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Media contact created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.MEDIA_CONTACTS_WRITE] }),
  validateSchema(createMediaContactSchema),
  mediaContactController.create
);

/**
 * @swagger
 * /api/v1/media-contacts:
 *   get:
 *     tags: [Media Contacts]
 *     summary: List media contacts
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [active, inactive] } }
 *       - { in: query, name: beat, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of media contacts }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.MEDIA_CONTACTS_READ] }),
  validateSchema(mediaContactFiltersSchema, 'query'),
  mediaContactController.list
);

/**
 * @swagger
 * /api/v1/media-contacts/{id}:
 *   get:
 *     tags: [Media Contacts]
 *     summary: Get a media contact by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Media contact details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.MEDIA_CONTACTS_READ] }),
  mediaContactController.findById
);

/**
 * @swagger
 * /api/v1/media-contacts/{id}:
 *   patch:
 *     tags: [Media Contacts]
 *     summary: Update a media contact
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               outlet: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               beat: { type: string }
 *               notes: { type: string }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200: { description: Media contact updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.MEDIA_CONTACTS_WRITE] }),
  validateSchema(updateMediaContactSchema),
  mediaContactController.update
);

/**
 * @swagger
 * /api/v1/media-contacts/{id}:
 *   delete:
 *     tags: [Media Contacts]
 *     summary: Delete a media contact
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Media contact deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.MEDIA_CONTACTS_DELETE] }),
  mediaContactController.delete
);

export default router;
