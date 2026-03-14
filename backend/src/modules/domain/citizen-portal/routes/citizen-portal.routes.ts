import { Router } from 'express';
import { citizenPortalController } from '../controllers/citizen-portal.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createCitizenPortalSchema, updateCitizenPortalSchema, citizenPortalFiltersSchema } from '../validators/citizen-portal.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['citizen-portal:write' as any] }),
  validateSchema(createCitizenPortalSchema),
  citizenPortalController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['citizen-portal:read' as any] }),
  validateSchema(citizenPortalFiltersSchema, 'query'),
  citizenPortalController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['citizen-portal:read' as any] }),
  citizenPortalController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['citizen-portal:write' as any] }),
  validateSchema(updateCitizenPortalSchema),
  citizenPortalController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['citizen-portal:delete' as any] }),
  citizenPortalController.delete
);

export default router;
