import { z } from 'zod';
import { zodMsg } from './zodMsg';
import { isValidCpf } from '../shared/cpf';
import { isValidPhone } from '../shared/phone';

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export const appointmentSchema = z.object({
  citizenName:  z.string().min(2),
  citizenCpf:   z.string().refine(isValidCpf, 'validation.invalidCpf'),
  citizenPhone: z.string().refine(isValidPhone, 'validation.invalidPhone'),
  service:      z.string().min(1),
  scheduledAt:  z.string().min(1),
  notes:        z.string(),
  status:       z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
    ctx.addIssue({ code: 'custom', message: 'validation.scheduledInFuture', path: ['scheduledAt'] });
  }
});

export type AppointmentFormState = z.infer<typeof appointmentSchema>;

export const emptyAppointmentForm: AppointmentFormState = {
  citizenName: '', citizenCpf: '', citizenPhone: '', service: '', scheduledAt: '', notes: '', status: '',
};

export function validateAppointment(form: AppointmentFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = appointmentSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.appointments.fields.${field}`)} — ${zodMsg(issue, t)}`;
  }
  return errors;
}
