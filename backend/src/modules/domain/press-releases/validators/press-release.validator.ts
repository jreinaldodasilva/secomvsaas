import { z } from 'zod';

const categories = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;
const statuses = ['draft', 'review', 'approved', 'published', 'archived'] as const;

export const createPressReleaseSchema = z.object({
  title: z.string().min(5).max(300),
  subtitle: z.string().max(300).optional(),
  content: z.string().min(10),
  summary: z.string().max(500).optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updatePressReleaseSchema = z.object({
  title: z.string().min(5).max(300).optional(),
  subtitle: z.string().max(300).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().max(500).optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: z.enum(statuses).optional(),
});

export const pressReleaseFiltersSchema = z.object({
  status: z.enum(statuses).optional(),
  category: z.enum(categories).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
