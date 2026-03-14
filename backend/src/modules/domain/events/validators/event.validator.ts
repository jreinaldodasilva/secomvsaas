import { z } from 'zod';

const statuses = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;

export const createEventSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(5000).optional(),
  location: z.string().max(300).optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  isPublic: z.boolean().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(300).optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(statuses).optional(),
});

export const eventFiltersSchema = z.object({
  status: z.enum(statuses).optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
