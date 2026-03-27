import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { AuthenticatedRequest } from '../../../../middleware/auth/auth';

const service = new EventService();

function toPublicEventDto(entity: any) {
  return {
    id: entity.id ?? entity._id?.toString(),
    title: entity.title,
    description: entity.description,
    location: entity.location,
    startsAt: entity.startsAt,
    endsAt: entity.endsAt,
    isPublic: entity.isPublic,
    eventType: entity.eventType,
    status: entity.status,
    registration: entity.registration,
    participantsCount: Array.isArray(entity.participants) ? entity.participants.length : 0,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export const eventController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.create(req.body, userId);
      res.status(201).json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.list(req.query as any);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await service.findById(req.params.id);
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.update(req.params.id, req.body, userId);
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      await service.delete(req.params.id, userId);
      res.status(204).send();
    } catch (error) { next(error); }
  },

  listPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.listPublic(req.query as any);
      res.json({
        success: true,
        data: {
          ...result,
          items: (result.items || []).map(toPublicEventDto),
        },
      });
    } catch (error) { next(error); }
  },

  findPublicById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await service.findPublicById(req.params.id);
      res.json({ success: true, data: toPublicEventDto(entity) });
    } catch (error) { next(error); }
  },

  registerPublicParticipation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.registerPublicParticipation(req.params.id, req.body, userId);
      res.status(201).json({
        success: true,
        data: {
          eventId: entity.id ?? entity._id?.toString(),
          participantsCount: Array.isArray(entity.participants) ? entity.participants.length : 0,
        },
      });
    } catch (error) { next(error); }
  },
};
