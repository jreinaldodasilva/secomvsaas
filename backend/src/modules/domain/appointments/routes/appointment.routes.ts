import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { createAppointmentSchema, updateAppointmentSchema, appointmentFiltersSchema } from '../validators/appointment.validator';
import { PERMISSIONS } from '../../../../config/rbac/permissions';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create an appointment
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [citizenName, service, scheduledAt]
 *             properties:
 *               citizenName: { type: string, minLength: 2 }
 *               citizenCpf: { type: string, maxLength: 11 }
 *               citizenPhone: { type: string }
 *               service: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Appointment created }
 *       401: { description: Unauthorized }
 */
router.post('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.APPOINTMENTS_WRITE] }),
  validateSchema(createAppointmentSchema),
  appointmentController.create
);

/**
 * @swagger
 * /api/v1/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: List appointments
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [pending, confirmed, completed, cancelled, no_show] } }
 *       - { in: query, name: service, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Paginated list of appointments }
 */
router.get('/',
  authorizeWithPermissions({ permissions: [PERMISSIONS.APPOINTMENTS_READ] }),
  validateSchema(appointmentFiltersSchema, 'query'),
  appointmentController.list
);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get an appointment by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Appointment details }
 *       404: { description: Not found }
 */
router.get('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.APPOINTMENTS_READ] }),
  appointmentController.findById
);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update an appointment
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               citizenName: { type: string }
 *               citizenCpf: { type: string }
 *               citizenPhone: { type: string }
 *               service: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *               notes: { type: string }
 *               status: { type: string, enum: [pending, confirmed, completed, cancelled, no_show] }
 *     responses:
 *       200: { description: Appointment updated }
 *       404: { description: Not found }
 */
router.patch('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.APPOINTMENTS_WRITE] }),
  validateSchema(updateAppointmentSchema),
  appointmentController.update
);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete an appointment
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Appointment deleted }
 *       404: { description: Not found }
 */
router.delete('/:id',
  authorizeWithPermissions({ permissions: [PERMISSIONS.APPOINTMENTS_DELETE] }),
  appointmentController.delete
);

export default router;
