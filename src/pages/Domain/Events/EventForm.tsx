import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';
import type { FormComponentProps } from '../../../components/UI';
import { type EventFormState } from '../../../validation/domain';

export type { EventFormState };
export { emptyEventForm, validateEvent } from '../../../validation/domain';

interface Props extends FormComponentProps<EventFormState> {}

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
