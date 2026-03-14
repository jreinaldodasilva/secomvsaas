import { z } from 'zod';

const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export const createAppointmentSchema = z.object({
  citizenName: z.string().min(2).max(200),
  citizenCpf: z.string().regex(/^\d{11}$/).optional(),
  citizenPhone: z.string().max(30).optional(),
  service: z.string().min(2).max(200),
  scheduledAt: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
});

export const updateAppointmentSchema = z.object({
  citizenName: z.string().min(2).max(200).optional(),
  citizenCpf: z.string().regex(/^\d{11}$/).optional(),
  citizenPhone: z.string().max(30).optional(),
  service: z.string().min(2).max(200).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(statuses).optional(),
});

export const appointmentFiltersSchema = z.object({
  status: z.enum(statuses).optional(),
  service: z.string().max(200).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
