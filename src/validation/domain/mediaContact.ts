import { z } from 'zod';
import { zodMsg } from './zodMsg';
import { isValidPhone } from '../shared/phone';

export const mediaContactSchema = z.object({
  name:   z.string().min(2),
  outlet: z.string().min(2),
  email:  z.string().email().or(z.literal('')),
  phone:  z.string().refine(isValidPhone, 'validation.invalidPhone'),
  beat:   z.string(),
  notes:  z.string(),
});

export type MediaContactFormState = z.infer<typeof mediaContactSchema>;

export const emptyMediaContactForm: MediaContactFormState = {
  name: '', outlet: '', email: '', phone: '', beat: '', notes: '',
};

export function validateMediaContact(form: MediaContactFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = mediaContactSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = zodMsg(issue, t);
  }
  return errors;
}
