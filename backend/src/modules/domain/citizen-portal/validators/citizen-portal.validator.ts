import { z } from 'zod';

export const createCitizenPortalSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(2).max(200),
  cpf: z.string().regex(/^\d{11}$/).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
});

export const updateCitizenPortalSchema = z.object({
  fullName: z.string().min(2).max(200).optional(),
  cpf: z.string().regex(/^\d{11}$/).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
  neighborhood: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const citizenPortalFiltersSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  city: z.string().max(100).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
