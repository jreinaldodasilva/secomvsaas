import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type EventFormState } from '@/validation/domain';

export type { EventFormState };
export { emptyEventForm, validateEvent } from '@/validation/domain';

type Props = FormComponentProps<EventFormState>;

export function EventForm({ form, setForm, errors, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof EventFormState>(k: K, v: EventFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <FormField name="title" label={t('domain.events.fields.title')} error={errors.title} required>
        <input id="title" type="text" value={form.title} onChange={e => set('title', e.target.value)} />
      </FormField>
      <FormField name="description" label={t('domain.events.fields.description')}>
        <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      </FormField>
      <FormField name="location" label={t('domain.events.fields.location')}>
        <input id="location" type="text" value={form.location} onChange={e => set('location', e.target.value)} />
      </FormField>
      <FormField name="startsAt" label={t('domain.events.fields.startsAt')} error={errors.startsAt} required>
        <input id="startsAt" type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} />
      </FormField>
      <FormField name="endsAt" label={t('domain.events.fields.endsAt')}>
        <input id="endsAt" type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} />
      </FormField>
      <label className="form-check">
        <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)} />
        {t('domain.events.fields.isPublic')}
      </label>
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
