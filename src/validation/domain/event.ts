export interface EventFormState {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  isPublic: boolean;
}

export const emptyEventForm: EventFormState = {
  title: '', description: '', location: '', startsAt: '', endsAt: '', isPublic: false,
};

export function validateEvent(form: EventFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.title.length < 3) e.title = t('domain.events.fields.title') + ' — mín. 3 caracteres';
  if (!form.startsAt) e.startsAt = t('domain.events.fields.startsAt') + ' — obrigatório';
  return e;
}
