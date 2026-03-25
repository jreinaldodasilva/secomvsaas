import { z } from 'zod';
import { zodMsg } from './zodMsg';

export const CLIPPING_SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

export const clippingSchema = z.object({
  title:       z.string().min(3),
  source:      z.string().min(2),
  sourceUrl:   z.string().url().or(z.literal('')),
  publishedAt: z.string(),
  sentiment:   z.enum(CLIPPING_SENTIMENTS),
  summary:     z.string(),
  tags:        z.string(),
});

export type ClippingFormState = z.infer<typeof clippingSchema>;

export const emptyClippingForm: ClippingFormState = {
  title: '', source: '', sourceUrl: '', publishedAt: '', sentiment: 'neutral', summary: '', tags: '',
};

export function validateClipping(form: ClippingFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = clippingSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.clippings.fields.${field}`)} — ${zodMsg(issue, t)}`;
  }
  return errors;
}
