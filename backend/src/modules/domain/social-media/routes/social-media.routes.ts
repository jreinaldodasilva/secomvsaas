import { Router } from 'express';
import { socialMediaController } from '../controllers/social-media.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createSocialMediaSchema, updateSocialMediaSchema, socialMediaFiltersSchema } from '../validators/social-media.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/social-media:
 *   post:
 *     tags: [Social Media]
 *     summary: Create a social media post
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [platform, content]
 *             properties:
 *               platform: { type: string, enum: [instagram, facebook, twitter, youtube, tiktok] }
 *               content: { type: string }
 *               mediaUrl: { type: string, format: uri }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Social media post created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.SOCIAL_MEDIA_WRITE] }),
  validateSchema(createSocialMediaSchema),
  socialMediaController.create
);

/**
 * @swagger
 * /api/v1/social-media:
 *   get:
 *     tags: [Social Media]
 *     summary: List social media posts
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [draft, scheduled, published, failed] } }
 *       - { in: query, name: platform, schema: { type: string, enum: [instagram, facebook, twitter, youtube, tiktok] } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of social media posts }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.SOCIAL_MEDIA_READ] }),
  validateSchema(socialMediaFiltersSchema, 'query'),
  socialMediaController.list
);

/**
 * @swagger
 * /api/v1/social-media/{id}:
 *   get:
 *     tags: [Social Media]
 *     summary: Get a social media post by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Social media post details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.SOCIAL_MEDIA_READ] }),
  socialMediaController.findById
);

/**
 * @swagger
 * /api/v1/social-media/{id}:
 *   patch:
 *     tags: [Social Media]
 *     summary: Update a social media post
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform: { type: string, enum: [instagram, facebook, twitter, youtube, tiktok] }
 *               content: { type: string }
 *               mediaUrl: { type: string, format: uri }
 *               scheduledAt: { type: string, format: date-time }
 *               status: { type: string, enum: [draft, scheduled, published, failed] }
 *     responses:
 *       200: { description: Social media post updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.SOCIAL_MEDIA_WRITE] }),
  validateSchema(updateSocialMediaSchema),
  socialMediaController.update
);

/**
 * @swagger
 * /api/v1/social-media/{id}:
 *   delete:
 *     tags: [Social Media]
 *     summary: Delete a social media post
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Social media post deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.SOCIAL_MEDIA_DELETE] }),
  socialMediaController.delete
);

export default router;
