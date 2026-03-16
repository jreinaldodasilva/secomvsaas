import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';

export const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export interface AppointmentFormState {
  citizenName: string;
  citizenCpf: string;
  citizenPhone: string;
  service: string;
  scheduledAt: string;
  notes: string;
}

export const emptyAppointmentForm: AppointmentFormState = {
  citizenName: '', citizenCpf: '', citizenPhone: '', service: '', scheduledAt: '', notes: '',
};

export function validateAppointment(form: AppointmentFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.citizenName.length < 2) e.citizenName = t('domain.appointments.fields.citizenName') + ' — mín. 2 caracteres';
  if (!form.service) e.service = t('domain.appointments.fields.service') + ' — obrigatório';
  if (!form.scheduledAt) e.scheduledAt = t('domain.appointments.fields.scheduledAt') + ' — obrigatório';
  return e;
}

interface Props {
  form: AppointmentFormState;
  setForm: React.Dispatch<React.SetStateAction<AppointmentFormState>>;
  errors: Record<string, string>;
  editing: boolean;
  editStatus: string;
  setEditStatus: (s: string) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AppointmentForm({ form, setForm, errors, editing, editStatus, setEditStatus, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof AppointmentFormState>(k: K, v: AppointmentFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label className={errors.citizenName ? 'form-field-error' : ''}>
        {t('domain.appointments.fields.citizenName')}
        <input type="text" value={form.citizenName} onChange={e => set('citizenName', e.target.value)} />
        {errors.citizenName && <span className="form-error">{errors.citizenName}</span>}
      </label>
      <label>
        {t('domain.appointments.fields.citizenCpf')}
        <input type="text" value={form.citizenCpf} onChange={e => set('citizenCpf', e.target.value)} maxLength={11} placeholder="00000000000" />
      </label>
      <label>
        {t('domain.appointments.fields.citizenPhone')}
        <input type="text" value={form.citizenPhone} onChange={e => set('citizenPhone', e.target.value)} />
      </label>
      <label className={errors.service ? 'form-field-error' : ''}>
        {t('domain.appointments.fields.service')}
        <input type="text" value={form.service} onChange={e => set('service', e.target.value)} />
        {errors.service && <span className="form-error">{errors.service}</span>}
      </label>
      <label className={errors.scheduledAt ? 'form-field-error' : ''}>
        {t('domain.appointments.fields.scheduledAt')}
        <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
        {errors.scheduledAt && <span className="form-error">{errors.scheduledAt}</span>}
      </label>
      <label>
        {t('domain.appointments.fields.notes')}
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
      </label>
      {editing && (
        <label>
          {t('domain.appointments.fields.status')}
          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
