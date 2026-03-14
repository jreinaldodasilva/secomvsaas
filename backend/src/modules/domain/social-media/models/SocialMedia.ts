import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { ISocialMedia } from '../types';

const SocialMediaSchema = new Schema<ISocialMedia>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'social-media',
});

SocialMediaSchema.index({ tenantId: 1, status: 1 });
SocialMediaSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(SocialMediaSchema);

export const SocialMedia = mongoose.model<ISocialMedia>('SocialMedia', SocialMediaSchema);
