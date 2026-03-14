import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IMediaContact } from '../types';

const MediaContactSchema = new Schema<IMediaContact>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  outlet: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  beat: { type: String, trim: true, maxlength: 100 },
  notes: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'media-contacts',
});

MediaContactSchema.index({ tenantId: 1, status: 1 });
MediaContactSchema.index({ tenantId: 1, outlet: 1 });
MediaContactSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(MediaContactSchema);

export const MediaContact = mongoose.model<IMediaContact>('MediaContact', MediaContactSchema);
