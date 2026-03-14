import { z } from 'zod';

const platforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'] as const;
const statuses = ['draft', 'scheduled', 'published', 'failed'] as const;

export const createSocialMediaSchema = z.object({
  platform: z.enum(platforms),
  content: z.string().min(1).max(5000),
  mediaUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
});

export const updateSocialMediaSchema = z.object({
  platform: z.enum(platforms).optional(),
  content: z.string().min(1).max(5000).optional(),
  mediaUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  status: z.enum(statuses).optional(),
});

export const socialMediaFiltersSchema = z.object({
  status: z.enum(statuses).optional(),
  platform: z.enum(platforms).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
