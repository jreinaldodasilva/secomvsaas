import { z } from 'zod';

export const createPressReleaseSchema = z.object({
  name: z.string().min(2).max(200),
});

export const updatePressReleaseSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const pressReleaseFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
