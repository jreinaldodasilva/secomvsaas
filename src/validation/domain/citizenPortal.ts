export interface CitizenFormState {
  userId: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const emptyCitizenForm: CitizenFormState = {
  userId: '', fullName: '', cpf: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '',
};

export function validateCitizen(form: CitizenFormState, editing: boolean, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!editing && !form.userId) e.userId = t('domain.citizenPortal.fields.userId') + ' — obrigatório';
  if (form.fullName.length < 2) e.fullName = t('domain.citizenPortal.fields.fullName') + ' — mín. 2 caracteres';
  return e;
}
