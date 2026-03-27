import { Button, FormField, Grid, Stack } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type EventFormState } from '@/validation/domain';

export type { EventFormState };
export { emptyEventForm, validateEvent } from '@/validation/domain';

type Props = FormComponentProps<EventFormState>;

export function EventForm({ form, setForm, errors, isLoading, onSubmit, onBlur }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof EventFormState>(k: K, v: EventFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <Stack as="form" onSubmit={onSubmit} className="form-stack" noValidate>
      <FormField name="title" label={t('domain.events.fields.title')} error={errors.title} required>
        <input id="title" type="text" value={form.title} onChange={e => set('title', e.target.value)} onBlur={() => onBlur('title')} />
      </FormField>

      <FormField name="description" label={t('domain.events.fields.description')}>
        <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} onBlur={() => onBlur('description')} rows={3} />
      </FormField>

      <FormField name="location" label={t('domain.events.fields.location')}>
        <input id="location" type="text" value={form.location} onChange={e => set('location', e.target.value)} onBlur={() => onBlur('location')} />
      </FormField>

      <Grid className="form-grid">
        <FormField name="startsAt" label={t('domain.events.fields.startsAt')} error={errors.startsAt} required>
          <input id="startsAt" type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} onBlur={() => onBlur('startsAt')} />
        </FormField>
        <FormField name="endsAt" label={t('domain.events.fields.endsAt')} error={errors.endsAt}>
          <input id="endsAt" type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} onBlur={() => onBlur('endsAt')} />
        </FormField>
      </Grid>

      <FormField name="isPublic">
        <label className="form-check">
          <input
            id="isPublic"
            type="checkbox"
            checked={form.isPublic}
            disabled={form.eventType === 'community'}
            onChange={e => set('isPublic', e.target.checked)}
          />
          {t('domain.events.fields.isPublic')}
        </label>
      </FormField>

      <FormField name="eventType" label={t('domain.events.fields.eventType')}>
        <select
          id="eventType"
          value={form.eventType}
          onChange={(e) => {
            const value = e.target.value as EventFormState['eventType'];
            set('eventType', value);
            if (value === 'community') {
              set('isPublic', true);
              set('registrationEnabled', true);
            }
          }}
        >
          <option value="institutional">{t('domain.events.types.institutional')}</option>
          <option value="community">{t('domain.events.types.community')}</option>
        </select>
      </FormField>

      {form.eventType === 'community' && (
        <>
          <FormField name="registrationEnabled">
            <label className="form-check">
              <input
                id="registrationEnabled"
                type="checkbox"
                checked={form.registrationEnabled}
                onChange={e => set('registrationEnabled', e.target.checked)}
              />
              {t('domain.events.fields.registrationEnabled')}
            </label>
          </FormField>

          {form.registrationEnabled && (
            <>
              <Grid className="form-grid">
                <FormField name="registrationDeadline" label={t('domain.events.fields.registrationDeadline')} error={errors.registrationDeadline}>
                  <input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={form.registrationDeadline}
                    onChange={e => set('registrationDeadline', e.target.value)}
                    onBlur={() => onBlur('registrationDeadline')}
                  />
                </FormField>
                <FormField name="maxParticipants" label={t('domain.events.fields.maxParticipants')}>
                  <input
                    id="maxParticipants"
                    type="number"
                    min={1}
                    value={form.maxParticipants}
                    onChange={e => set('maxParticipants', e.target.value)}
                    onBlur={() => onBlur('maxParticipants')}
                  />
                </FormField>
              </Grid>
              <FormField name="registrationInstructions" label={t('domain.events.fields.registrationInstructions')}>
                <textarea
                  id="registrationInstructions"
                  value={form.registrationInstructions}
                  onChange={e => set('registrationInstructions', e.target.value)}
                  rows={2}
                />
              </FormField>
            </>
          )}
        </>
      )}

      <Stack className="form-actions" direction="row" align="center" justify="flex-end">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </Stack>
    </Stack>
  );
}
