import { z } from 'zod';

export const eventSchema = z.object({
  title:       z.string().min(3),
  description: z.string(),
  location:    z.string(),
  startsAt:    z.string().min(1),
  endsAt:      z.string(),
  isPublic:    z.boolean(),
});

export type EventFormState = z.infer<typeof eventSchema>;

export const emptyEventForm: EventFormState = {
  title: '', description: '', location: '', startsAt: '', endsAt: '', isPublic: false,
};

export function validateEvent(form: EventFormState, t: (k: string) => string): Record<string, string> {
  const result = eventSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.events.fields.${field}`)} — ${issue.message}`;
  }
  return errors;
}
