import { z } from 'zod';

export const mediaContactSchema = z.object({
  name:   z.string().min(2),
  outlet: z.string().min(2),
  email:  z.string(),
  phone:  z.string(),
  beat:   z.string(),
  notes:  z.string(),
});

export type MediaContactFormState = z.infer<typeof mediaContactSchema>;

export const emptyMediaContactForm: MediaContactFormState = {
  name: '', outlet: '', email: '', phone: '', beat: '', notes: '',
};

export function validateMediaContact(form: MediaContactFormState, t: (k: string) => string): Record<string, string> {
  const result = mediaContactSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.mediaContacts.fields.${field}`)} — ${issue.message}`;
  }
  return errors;
}
