import express from 'express';
import { z } from 'zod';
import { validateSchema } from '../validation/middleware';
import { authenticateCitizen } from '../middleware/auth/citizenAuth';
import * as citizenAuth from './citizen-auth/citizen-auth.controller';
import { appointmentFiltersSchema } from '../modules/domain/appointments/validators/appointment.validator';
import { resolveTenant, setTenantContext } from '../platform/tenants';

const router = express.Router();

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name:         z.string().trim().min(2).max(100).optional(),
  email:        z.string().email().toLowerCase().optional(),
  phone:        z.string().max(20).optional(),
  cpf:          z.string().max(14).optional(),
  birthDate:    z.string().optional(),
  address:      z.string().max(200).optional(),
  neighborhood: z.string().max(100).optional(),
  city:         z.string().max(100).optional(),
  state:        z.string().max(2).optional(),
}).refine(d => Object.values(d).some(v => v !== undefined), {
  message: 'Informe ao menos um campo para atualizar',
});

/**
 * @swagger
 * /api/v1/citizen-auth/register:
 *   post:
 *     tags: [Citizen Auth]
 *     summary: Register a citizen account on the portal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Citizen registered, sets portal auth cookies }
 *       409: { description: Email already in use }
 */
router.post('/register', validateSchema(registerSchema), citizenAuth.register);

/**
 * @swagger
 * /api/v1/citizen-auth/login:
 *   post:
 *     tags: [Citizen Auth]
 *     summary: Login as a citizen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, sets portal auth cookies }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validateSchema(loginSchema), citizenAuth.login);

/**
 * @swagger
 * /api/v1/citizen-auth/refresh:
 *   post:
 *     tags: [Citizen Auth]
 *     summary: Refresh citizen access token
 *     responses:
 *       200: { description: New tokens set in cookies }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', citizenAuth.refresh);

/**
 * @swagger
 * /api/v1/citizen-auth/logout:
 *   post:
 *     tags: [Citizen Auth]
 *     summary: Logout citizen session
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post('/logout', citizenAuth.logout);

/**
 * @swagger
 * /api/v1/citizen-auth/me:
 *   get:
 *     tags: [Citizen Auth]
 *     summary: Get current citizen profile
 *     security: [{ portalCookieAuth: [] }]
 *     responses:
 *       200: { description: Citizen user data }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticateCitizen, ...citizenAuth.me);

/**
 * @swagger
 * /api/v1/citizen-auth/profile:
 *   patch:
 *     tags: [Citizen Auth]
 *     summary: Update citizen profile (name and/or email)
 *     security: [{ portalCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2 }
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Profile updated }
 *       401: { description: Not authenticated }
 *       409: { description: Email already in use }
 */
router.patch('/profile', authenticateCitizen, resolveTenant, setTenantContext, validateSchema(updateProfileSchema), citizenAuth.updateProfile);

/**
 * @swagger
 * /api/v1/citizen-auth/appointments:
 *   get:
 *     tags: [Citizen Auth]
 *     summary: List appointments for the authenticated citizen
 *     security: [{ portalCookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated list of citizen appointments }
 *       401: { description: Not authenticated }
 */
router.get('/appointments', authenticateCitizen, resolveTenant, setTenantContext, validateSchema(appointmentFiltersSchema, 'query'), citizenAuth.myAppointments);

export default router;
