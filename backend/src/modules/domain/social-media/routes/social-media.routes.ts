import { Router } from 'express';
import { socialMediaController } from '../controllers/social-media.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createSocialMediaSchema, updateSocialMediaSchema, socialMediaFiltersSchema } from '../validators/social-media.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['social-media:write' as any] }),
  validateSchema(createSocialMediaSchema),
  socialMediaController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['social-media:read' as any] }),
  validateSchema(socialMediaFiltersSchema, 'query'),
  socialMediaController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['social-media:read' as any] }),
  socialMediaController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['social-media:write' as any] }),
  validateSchema(updateSocialMediaSchema),
  socialMediaController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['social-media:delete' as any] }),
  socialMediaController.delete
);

export default router;
