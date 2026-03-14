import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IMediaContact } from '../types';

const MediaContactSchema = new Schema<IMediaContact>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'media-contacts',
});

MediaContactSchema.index({ tenantId: 1, status: 1 });
MediaContactSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(MediaContactSchema);

export const MediaContact = mongoose.model<IMediaContact>('MediaContact', MediaContactSchema);
