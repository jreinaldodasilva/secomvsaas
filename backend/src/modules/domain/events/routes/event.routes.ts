import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createEventSchema, updateEventSchema, eventFiltersSchema } from '../validators/event.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['events:write' as any] }),
  validateSchema(createEventSchema),
  eventController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['events:read' as any] }),
  validateSchema(eventFiltersSchema, 'query'),
  eventController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['events:read' as any] }),
  eventController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['events:write' as any] }),
  validateSchema(updateEventSchema),
  eventController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['events:delete' as any] }),
  eventController.delete
);

export default router;
