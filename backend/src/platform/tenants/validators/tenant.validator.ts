import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(63).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  domain: z.string().max(255).optional(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2).max(100),
  ownerPassword: z.string().min(8).max(128),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  domain: z.string().max(255).optional(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
  settings: z.object({
    timezone: z.string().optional(),
    locale: z.string().optional(),
    currency: z.string().optional(),
    features: z.record(z.boolean()).optional(),
  }).optional(),
  maxUsers: z.number().int().min(1).max(10000).optional(),
});

export const tenantFiltersSchema = z.object({
  status: z.enum(['active', 'suspended', 'trial', 'cancelled', 'deleted']).optional(),
  plan: z.enum(['trial', 'starter', 'professional', 'enterprise']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
