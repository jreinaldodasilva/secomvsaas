import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthenticatedRequest } from '../../../../middleware/auth/auth';

const service = new AppointmentService();

function getCaller(req: Request) {
  const user = (req as AuthenticatedRequest).user;
  return { userId: user?.id, role: user?.role };
}

export const appointmentController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.create(req.body, userId);
      res.status(201).json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.list(req.query as any, getCaller(req));
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await service.findById(req.params.id, getCaller(req));
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await service.update(req.params.id, req.body, getCaller(req));
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.params.id, getCaller(req));
      res.status(204).send();
    } catch (error) { next(error); }
  },
};
