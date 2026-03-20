import { z } from 'zod';

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export const appointmentSchema = z.object({
  citizenName:  z.string().min(2),
  citizenCpf:   z.string(),
  citizenPhone: z.string(),
  service:      z.string().min(1),
  scheduledAt:  z.string().min(1),
  notes:        z.string(),
  status:       z.string().optional(),
});

export type AppointmentFormState = z.infer<typeof appointmentSchema>;

export const emptyAppointmentForm: AppointmentFormState = {
  citizenName: '', citizenCpf: '', citizenPhone: '', service: '', scheduledAt: '', notes: '', status: '',
};

export function validateAppointment(form: AppointmentFormState, t: (k: string) => string): Record<string, string> {
  const result = appointmentSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.appointments.fields.${field}`)} — ${issue.message}`;
  }
  return errors;
}
