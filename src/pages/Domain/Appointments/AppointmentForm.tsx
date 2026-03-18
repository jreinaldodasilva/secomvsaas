import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { APPOINTMENT_STATUSES, type AppointmentFormState } from '@/validation/domain';

export type { AppointmentFormState };
export { emptyAppointmentForm, validateAppointment } from '@/validation/domain';

interface Props extends FormComponentProps<AppointmentFormState> {
  editStatus?: string;
  setEditStatus?: (s: string) => void;
}

export function AppointmentForm({ form, setForm, errors, editing, editStatus = 'pending', setEditStatus = () => {}, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof AppointmentFormState>(k: K, v: AppointmentFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <FormField name="citizenName" label={t('domain.appointments.fields.citizenName')} error={errors.citizenName} required>
        <input id="citizenName" type="text" value={form.citizenName} onChange={e => set('citizenName', e.target.value)} />
      </FormField>
      <FormField name="citizenCpf" label={t('domain.appointments.fields.citizenCpf')}>
        <input id="citizenCpf" type="text" value={form.citizenCpf} onChange={e => set('citizenCpf', e.target.value)} maxLength={11} placeholder="00000000000" />
      </FormField>
      <FormField name="citizenPhone" label={t('domain.appointments.fields.citizenPhone')}>
        <input id="citizenPhone" type="text" value={form.citizenPhone} onChange={e => set('citizenPhone', e.target.value)} />
      </FormField>
      <FormField name="service" label={t('domain.appointments.fields.service')} error={errors.service} required>
        <input id="service" type="text" value={form.service} onChange={e => set('service', e.target.value)} />
      </FormField>
      <FormField name="scheduledAt" label={t('domain.appointments.fields.scheduledAt')} error={errors.scheduledAt} required>
        <input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
      </FormField>
      <FormField name="notes" label={t('domain.appointments.fields.notes')}>
        <textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
      </FormField>
      {editing && (
        <FormField name="editStatus" label={t('domain.appointments.fields.status')}>
          <select id="editStatus" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            {APPOINTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
