import { Router } from 'express';
import { clippingController } from '../controllers/clipping.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createClippingSchema, updateClippingSchema, clippingFiltersSchema } from '../validators/clipping.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['clippings:write' as any] }),
  validateSchema(createClippingSchema),
  clippingController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['clippings:read' as any] }),
  validateSchema(clippingFiltersSchema, 'query'),
  clippingController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['clippings:read' as any] }),
  clippingController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['clippings:write' as any] }),
  validateSchema(updateClippingSchema),
  clippingController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['clippings:delete' as any] }),
  clippingController.delete
);

export default router;
