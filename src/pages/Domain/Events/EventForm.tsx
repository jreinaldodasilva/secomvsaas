import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';

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

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
  errors: Record<string, string>;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EventForm({ form, setForm, errors, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof EventFormState>(k: K, v: EventFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label className={errors.title ? 'form-field-error' : ''}>
        {t('domain.events.fields.title')}
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </label>
      <label>
        {t('domain.events.fields.description')}
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      </label>
      <label>
        {t('domain.events.fields.location')}
        <input type="text" value={form.location} onChange={e => set('location', e.target.value)} />
      </label>
      <label className={errors.startsAt ? 'form-field-error' : ''}>
        {t('domain.events.fields.startsAt')}
        <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} />
        {errors.startsAt && <span className="form-error">{errors.startsAt}</span>}
      </label>
      <label>
        {t('domain.events.fields.endsAt')}
        <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} />
      </label>
      <label className="form-check">
        <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)} />
        {t('domain.events.fields.isPublic')}
      </label>
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
