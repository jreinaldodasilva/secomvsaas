import { Router } from 'express';
import { mediaContactController } from '../controllers/media-contact.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createMediaContactSchema, updateMediaContactSchema, mediaContactFiltersSchema } from '../validators/media-contact.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['media-contacts:write' as any] }),
  validateSchema(createMediaContactSchema),
  mediaContactController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['media-contacts:read' as any] }),
  validateSchema(mediaContactFiltersSchema, 'query'),
  mediaContactController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['media-contacts:read' as any] }),
  mediaContactController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['media-contacts:write' as any] }),
  validateSchema(updateMediaContactSchema),
  mediaContactController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['media-contacts:delete' as any] }),
  mediaContactController.delete
);

export default router;
