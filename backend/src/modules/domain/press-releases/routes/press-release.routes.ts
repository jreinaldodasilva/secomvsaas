import { Router } from 'express';
import { pressReleaseController } from '../controllers/press-release.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createPressReleaseSchema, updatePressReleaseSchema, pressReleaseFiltersSchema } from '../validators/press-release.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['press-releases:write' as any] }),
  validateSchema(createPressReleaseSchema),
  pressReleaseController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['press-releases:read' as any] }),
  validateSchema(pressReleaseFiltersSchema, 'query'),
  pressReleaseController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['press-releases:read' as any] }),
  pressReleaseController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['press-releases:write' as any] }),
  validateSchema(updatePressReleaseSchema),
  pressReleaseController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['press-releases:delete' as any] }),
  pressReleaseController.delete
);

export default router;
