import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../../models/User';
import { authenticate, authorize, AuthenticatedRequest, ensureTenantAccess } from '../../middleware/auth/auth';
import { NotFoundError, ForbiddenError } from '../../utils/errors/errors';

const router = Router();

router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

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
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user!.tenantId;
    if (!tenantId && authReq.user!.role !== 'super_admin') {
      return res.status(400).json({ success: false, error: { message: 'Usuário não associado a um tenant' } });
    }

    const query: any = { isDeleted: false };
    if (tenantId) query.tenantId = tenantId;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.role) query.role = req.query.role;

    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    res.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
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
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Usuário');
    if (authReq.user!.role !== 'super_admin' && String((user as any).tenantId) !== authReq.user!.tenantId) {
      throw new ForbiddenError('Acesso negado');
    }
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
    const authReq = req as AuthenticatedRequest;
    const target = await User.findById(req.params.id);
    if (!target) throw new NotFoundError('Usuário');
    if (authReq.user!.role !== 'super_admin' && String((target as any).tenantId) !== authReq.user!.tenantId) {
      throw new ForbiddenError('Acesso negado');
    }
    if (req.params.id === authReq.user!.id) {
      throw new ForbiddenError('Não é possível alterar seu próprio perfil por esta rota');
    }

    const allowed = ['role', 'isActive', 'name'] as const;
    const updates: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
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
    const authReq = req as AuthenticatedRequest;
    const target = await User.findById(req.params.id);
    if (!target) throw new NotFoundError('Usuário');
    if (authReq.user!.role !== 'super_admin' && String((target as any).tenantId) !== authReq.user!.tenantId) {
      throw new ForbiddenError('Acesso negado');
    }
    if (req.params.id === authReq.user!.id) {
      throw new ForbiddenError('Não é possível desativar sua própria conta');
    }

    await User.findByIdAndUpdate(req.params.id, { isActive: false, isDeleted: true, deletedAt: new Date() });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
