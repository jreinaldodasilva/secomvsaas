import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeWithPermissions, AuthenticatedRequest } from '../../middleware/auth/auth';
import { UserService } from '../../services/admin/userService';

const router = Router();
const service = new UserService();

router.use(authenticate);
router.use(authorizeWithPermissions({ roles: ['super_admin', 'admin'] }));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List users in current tenant
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.list(req.query as any);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User data }
 *       404: { description: User not found }
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.findById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role or status
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [admin, manager, staff] }
 *               isActive: { type: boolean }
 *               name: { type: string }
 *     responses:
 *       200: { description: Updated user }
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = (req as AuthenticatedRequest).user!.id;
    const updated = await service.update(req.params.id, requesterId, req.body);
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate a user
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: User deactivated }
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = (req as AuthenticatedRequest).user!.id;
    await service.deactivate(req.params.id, requesterId);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
