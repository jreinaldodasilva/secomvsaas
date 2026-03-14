import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IEvent } from '../types';

const EventSchema = new Schema<IEvent>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'events',
});

EventSchema.index({ tenantId: 1, status: 1 });
EventSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(EventSchema);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
