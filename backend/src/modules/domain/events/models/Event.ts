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
  eventType: { type: String, enum: ['institutional', 'community'], default: 'institutional', index: true },
  registration: {
    enabled: { type: Boolean, default: false },
    deadline: { type: Date },
    maxParticipants: { type: Number, min: 1 },
    instructions: { type: String, maxlength: 2000 },
  },
  participants: [{
    citizenId: { type: Schema.Types.ObjectId, ref: 'User' },
    participantName: { type: String, required: true, trim: true, maxlength: 120 },
    participantEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    participantPhone: { type: String, trim: true, maxlength: 30 },
    notes: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  }],
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
EventSchema.index({ tenantId: 1, eventType: 1 });
EventSchema.index({ tenantId: 1, isPublic: 1, 'registration.enabled': 1 });
EventSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(EventSchema);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
