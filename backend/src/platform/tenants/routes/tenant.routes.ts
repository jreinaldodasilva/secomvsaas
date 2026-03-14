import { Router, Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';
import { authService } from '../../../services/auth';
import { authenticate, authorize, AuthenticatedRequest } from '../../../middleware/auth/auth';
import { validateSchema } from '../../../validation/middleware';
import { createTenantSchema, updateTenantSchema, tenantFiltersSchema } from '../validators/tenant.validator';
import { inviteMemberValidation } from '../../../routes/validations/authValidation';
import { validateRequest } from '../../../middleware/validate';
import { inviteLimiter } from '../../../middleware/rateLimiter';

const router = Router();

// Create tenant (super_admin only)
router.post('/',
  authenticate,
  authorize('super_admin'),
  validateSchema(createTenantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenant, owner } = await tenantService.create(req.body);
      res.status(201).json({
        success: true,
        data: {
          tenant,
          owner: { id: (owner as any)._id?.toString(), name: owner.name, email: owner.email },
        },
      });
    } catch (error) { next(error); }
  }
);

// List tenants (super_admin only)
router.get('/',
  authenticate,
  authorize('super_admin'),
  validateSchema(tenantFiltersSchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await tenantService.list(req.query as any);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

// Get current tenant (any authenticated user)
router.get('/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.tenantId) {
        return res.status(400).json({ success: false, error: { message: 'Usuário não associado a um tenant' } });
      }
      const tenant = await tenantService.findById(authReq.user.tenantId);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
);

// @deprecated — use /me instead
router.get('/current',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.tenantId) {
        return res.status(400).json({ success: false, error: { message: 'Usuário não associado a um tenant' } });
      }
      const tenant = await tenantService.findById(authReq.user.tenantId);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
);

// Get tenant by ID (super_admin only)
router.get('/:id',
  authenticate,
  authorize('super_admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = await tenantService.findById(req.params.id);
      const memberCount = await tenantService.getMemberCount(req.params.id);
      res.json({ success: true, data: { ...tenant.toJSON(), memberCount } });
    } catch (error) { next(error); }
  }
);

// Update tenant (super_admin or tenant admin)
router.patch('/:id',
  authenticate,
  authorize('super_admin', 'admin'),
  validateSchema(updateTenantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Non-super_admin can only update their own tenant
      if (authReq.user?.role !== 'super_admin' && authReq.user?.tenantId !== req.params.id) {
        return res.status(403).json({ success: false, error: { message: 'Acesso negado' } });
      }
      const tenant = await tenantService.update(req.params.id, req.body);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
);

// Invite member (admin+)
router.post('/:id/invite',
  authenticate,
  authorize('super_admin', 'admin'),
  inviteLimiter,
  inviteMemberValidation,
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (authReq.user?.role !== 'super_admin' && authReq.user?.tenantId !== req.params.id) {
        return res.status(403).json({ success: false, error: { message: 'Acesso negado' } });
      }
      const result = await authService.inviteMember(req.params.id, req.body.email, req.body.role, authReq.user!.id);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

// Suspend tenant (super_admin only)
router.post('/:id/suspend',
  authenticate,
  authorize('super_admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = await tenantService.suspend(req.params.id, req.body.reason || 'Suspended by admin');
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
);

// Reactivate tenant (super_admin only)
router.post('/:id/reactivate',
  authenticate,
  authorize('super_admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = await tenantService.reactivate(req.params.id);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  }
);

// Delete tenant (super_admin only)
router.delete('/:id',
  authenticate,
  authorize('super_admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await tenantService.softDelete(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
);

export default router;
