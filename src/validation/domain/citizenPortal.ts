import { z } from 'zod';
import { zodMsg } from './zodMsg';
import { isValidCpf } from '../shared/cpf';
import { isValidPhone } from '../shared/phone';

export const UF_CODES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const UF_LABELS: Record<typeof UF_CODES[number], string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export const citizenSchema = z.object({
  userId:       z.string(),
  fullName:     z.string().min(2),
  cpf:          z.string().refine(isValidCpf, 'validation.invalidCpf'),
  phone:        z.string().refine(isValidPhone, 'validation.invalidPhone'),
  email:        z.string().email().or(z.literal('')),
  address:      z.string(),
  neighborhood: z.string(),
  city:         z.string(),
  state:        z.string().refine(v => !v || (UF_CODES as readonly string[]).includes(v), 'validation.invalidState'),
});

export type CitizenFormState = z.infer<typeof citizenSchema>;

export const emptyCitizenForm: CitizenFormState = {
  userId: '', fullName: '', cpf: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '',
};

export function validateCitizen(form: CitizenFormState, editing: boolean, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = citizenSchema.safeParse(form);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = `${t(`domain.citizenPortal.fields.${field}`)} — ${zodMsg(issue, t)}`;
    }
  }
  if (!editing && !form.userId) {
    errors.userId = `${t('domain.citizenPortal.fields.userId')} — ${t('validation.required')}`;
  }
  return errors;
}
