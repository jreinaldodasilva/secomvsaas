import { z } from 'zod';

const sentiments = ['positive', 'neutral', 'negative'] as const;

export const createClippingSchema = z.object({
  title: z.string().min(3).max(300),
  source: z.string().min(2).max(200),
  sourceUrl: z.string().url().optional(),
  publishedAt: z.string().datetime({ offset: true }).optional(),
  sentiment: z.enum(sentiments).optional(),
  summary: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateClippingSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  source: z.string().min(2).max(200).optional(),
  sourceUrl: z.string().url().optional(),
  publishedAt: z.string().datetime({ offset: true }).optional(),
  sentiment: z.enum(sentiments).optional(),
  summary: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const clippingFiltersSchema = z.object({
  sentiment: z.enum(sentiments).optional(),
  source: z.string().max(200).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
