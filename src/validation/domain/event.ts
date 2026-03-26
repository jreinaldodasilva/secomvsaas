import { z } from 'zod';
import { zodMsg } from './zodMsg';

export const eventSchema = z.object({
  title:       z.string().min(3),
  description: z.string(),
  location:    z.string(),
  startsAt:    z.string().min(1),
  endsAt:      z.string(),
  isPublic:    z.boolean(),
}).superRefine((data, ctx) => {
  if (data.endsAt && data.startsAt && data.endsAt <= data.startsAt) {
    ctx.addIssue({ code: 'custom', message: 'validation.endsAfterStarts', path: ['endsAt'] });
  }
});

export type EventFormState = z.infer<typeof eventSchema>;

export const emptyEventForm: EventFormState = {
  title: '', description: '', location: '', startsAt: '', endsAt: '', isPublic: false,
};

export function validateEvent(form: EventFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = eventSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = zodMsg(issue, t);
  }
  return errors;
}
