import { z } from 'zod';

export const createCitizenPortalSchema = z.object({
  name: z.string().min(2).max(200),
});

export const updateCitizenPortalSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const citizenPortalFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
