import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IAppointment } from '../types';

const AppointmentSchema = new Schema<IAppointment>({
  ...tenantAwareFields,
  citizenName: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  citizenCpf: { type: String, trim: true },
  citizenPhone: { type: String, trim: true },
  service: { type: String, required: true, trim: true, maxlength: 200 },
  scheduledAt: { type: Date, required: true },
  notes: { type: String, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'], default: 'pending', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'appointments',
});

AppointmentSchema.index({ tenantId: 1, status: 1 });
AppointmentSchema.index({ tenantId: 1, scheduledAt: 1 });
AppointmentSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(AppointmentSchema);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
