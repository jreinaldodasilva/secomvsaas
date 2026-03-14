import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createAppointmentSchema, updateAppointmentSchema, appointmentFiltersSchema } from '../validators/appointment.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['appointments:write' as any] }),
  validateSchema(createAppointmentSchema),
  appointmentController.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['appointments:read' as any] }),
  validateSchema(appointmentFiltersSchema, 'query'),
  appointmentController.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['appointments:read' as any] }),
  appointmentController.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['appointments:write' as any] }),
  validateSchema(updateAppointmentSchema),
  appointmentController.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['appointments:delete' as any] }),
  appointmentController.delete
);

export default router;
