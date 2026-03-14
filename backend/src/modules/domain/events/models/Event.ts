import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IEvent } from '../types';

const EventSchema = new Schema<IEvent>({
  ...tenantAwareFields,
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 300 },
  description: { type: String, maxlength: 5000 },
  location: { type: String, trim: true, maxlength: 300 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  isPublic: { type: Boolean, default: false },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'events',
});

EventSchema.index({ tenantId: 1, status: 1 });
EventSchema.index({ tenantId: 1, startsAt: 1 });
EventSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(EventSchema);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
