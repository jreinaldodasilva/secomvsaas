import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { ISocialMedia } from '../types';

const SocialMediaSchema = new Schema<ISocialMedia>({
  ...tenantAwareFields,
  platform: { type: String, enum: ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'], required: true, index: true },
  content: { type: String, required: true, maxlength: 5000 },
  mediaUrl: { type: String, trim: true },
  scheduledAt: { type: Date },
  publishedAt: { type: Date },
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'failed'], default: 'draft', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'social-media',
});

SocialMediaSchema.index({ tenantId: 1, platform: 1, status: 1 });
SocialMediaSchema.index({ tenantId: 1, scheduledAt: 1 });
SocialMediaSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(SocialMediaSchema);

export const SocialMedia = mongoose.model<ISocialMedia>('SocialMedia', SocialMediaSchema);
