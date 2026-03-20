import { z } from 'zod';

export const citizenSchema = z.object({
  userId:       z.string(),
  fullName:     z.string().min(2),
  cpf:          z.string(),
  phone:        z.string(),
  email:        z.string(),
  address:      z.string(),
  neighborhood: z.string(),
  city:         z.string(),
  state:        z.string(),
});

export type CitizenFormState = z.infer<typeof citizenSchema>;

export const emptyCitizenForm: CitizenFormState = {
  userId: '', fullName: '', cpf: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '',
};

export function validateCitizen(form: CitizenFormState, editing: boolean, t: (k: string) => string): Record<string, string> {
  const result = citizenSchema.safeParse(form);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = `${t(`domain.citizenPortal.fields.${field}`)} — ${issue.message}`;
    }
  }
  if (!editing && !form.userId) {
    errors.userId = `${t('domain.citizenPortal.fields.userId')} — obrigatório`;
  }
  return errors;
}
