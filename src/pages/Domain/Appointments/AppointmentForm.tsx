import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { APPOINTMENT_STATUSES, type AppointmentFormState } from '@/validation/domain';

export type { AppointmentFormState };
export { emptyAppointmentForm, validateAppointment } from '@/validation/domain';

export function AppointmentForm({ form, setForm, errors, editing, isLoading, onSubmit }: FormComponentProps<AppointmentFormState>) {
  const { t } = useTranslation();
  const set = <K extends keyof AppointmentFormState>(k: K, v: AppointmentFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <div className="form-section">
        <p className="form-section-title">Dados do Cidadão</p>
        <FormField name="citizenName" label={t('domain.appointments.fields.citizenName')} error={errors.citizenName} required>
          <input id="citizenName" type="text" value={form.citizenName} onChange={e => set('citizenName', e.target.value)} />
        </FormField>
        <div className="form-grid">
          <FormField name="citizenCpf" label={t('domain.appointments.fields.citizenCpf')}>
            <input id="citizenCpf" type="text" value={form.citizenCpf} onChange={e => set('citizenCpf', e.target.value)} maxLength={11} placeholder="00000000000" inputMode="numeric" />
          </FormField>
          <FormField name="citizenPhone" label={t('domain.appointments.fields.citizenPhone')}>
            <input id="citizenPhone" type="text" value={form.citizenPhone} onChange={e => set('citizenPhone', e.target.value)} inputMode="tel" />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Agendamento</p>
        <FormField name="service" label={t('domain.appointments.fields.service')} error={errors.service} required>
          <input id="service" type="text" value={form.service} onChange={e => set('service', e.target.value)} />
        </FormField>
        <div className="form-grid">
          <FormField name="scheduledAt" label={t('domain.appointments.fields.scheduledAt')} error={errors.scheduledAt} required>
            <input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
          </FormField>
          {editing && (
            <FormField name="status" label={t('domain.appointments.fields.status')}>
              <select id="status" value={form.status ?? 'pending'} onChange={e => set('status', e.target.value)}>
                {APPOINTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          )}
        </div>
        <FormField name="notes" label={t('domain.appointments.fields.notes')}>
          <textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
        </FormField>
      </div>

      <div className="form-actions">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </div>
    </form>
  );
}
