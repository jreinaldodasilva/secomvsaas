import { z } from 'zod';

export const createMediaContactSchema = z.object({
  name: z.string().min(2).max(200),
  outlet: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  beat: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMediaContactSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  outlet: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  beat: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const mediaContactFiltersSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  beat: z.string().max(100).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
