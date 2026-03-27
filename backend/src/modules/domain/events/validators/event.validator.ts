import { z } from 'zod';

const statuses = ['scheduled', 'ongoing', 'completed', 'cancelled'] as const;
const eventTypes = ['institutional', 'community'] as const;
const emailSchema = z.string().trim().email().max(160).transform(v => v.toLowerCase());

const registrationSchema = z.object({
  enabled: z.boolean().optional(),
  deadline: z.string().datetime({ offset: true }).optional(),
  maxParticipants: z.number().int().min(1).optional(),
  instructions: z.string().max(2000).optional(),
}).optional();

export const createEventSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(5000).optional(),
  location: z.string().max(300).optional(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  isPublic: z.boolean().optional(),
  eventType: z.enum(eventTypes).optional(),
  registration: registrationSchema,
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(300).optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  isPublic: z.boolean().optional(),
  eventType: z.enum(eventTypes).optional(),
  registration: registrationSchema,
  status: z.enum(statuses).optional(),
});

export const eventFiltersSchema = z.object({
  status: z.enum(statuses).optional(),
  isPublic: z.coerce.boolean().optional(),
  eventType: z.enum(eventTypes).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});

export const publicEventFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const registerEventParticipationSchema = z.object({
  participantName: z.string().trim().min(2).max(120),
  participantEmail: emailSchema,
  participantPhone: z.string().trim().max(30).optional(),
  notes: z.string().max(1000).optional(),
});
