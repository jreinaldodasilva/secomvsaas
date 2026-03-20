import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth/auth';
import { requireTenant } from '../../platform/tenants';
import { DashboardService } from '../../modules/domain/dashboard';

const router = Router();
const service = new DashboardService();

router.use(authenticate);
router.use(requireTenant);

router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
