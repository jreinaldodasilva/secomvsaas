export interface MediaContactFormState {
  name: string;
  outlet: string;
  email: string;
  phone: string;
  beat: string;
  notes: string;
}

export const emptyMediaContactForm: MediaContactFormState = {
  name: '', outlet: '', email: '', phone: '', beat: '', notes: '',
};

export function validateMediaContact(form: MediaContactFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.name.length < 2) e.name = t('domain.mediaContacts.fields.name') + ' — mín. 2 caracteres';
  if (form.outlet.length < 2) e.outlet = t('domain.mediaContacts.fields.outlet') + ' — mín. 2 caracteres';
  return e;
}
