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

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export function validateAppointment(form: AppointmentFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.citizenName.length < 2) e.citizenName = t('domain.appointments.fields.citizenName') + ' — mín. 2 caracteres';
  if (!form.service) e.service = t('domain.appointments.fields.service') + ' — obrigatório';
  if (!form.scheduledAt) e.scheduledAt = t('domain.appointments.fields.scheduledAt') + ' — obrigatório';
  return e;
}
