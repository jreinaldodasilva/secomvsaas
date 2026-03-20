import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IPressRelease } from '../types';

const PressReleaseSchema = new Schema<IPressRelease>({
  ...tenantAwareFields,
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 300 },
  subtitle: { type: String, trim: true, maxlength: 300 },
  content: { type: String, required: true, minlength: 10 },
  summary: { type: String, trim: true, maxlength: 500 },
  category: { type: String, enum: ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'], default: 'comunicado' },
  tags: [{ type: String, trim: true }],
  status: { type: String, enum: ['draft', 'review', 'approved', 'published', 'archived'], default: 'draft', index: true },
  publishedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'press-releases',
});

PressReleaseSchema.index({ tenantId: 1, status: 1 });
PressReleaseSchema.index({ tenantId: 1, category: 1 });
PressReleaseSchema.index({ tenantId: 1, createdAt: -1 });
PressReleaseSchema.index({ title: 'text', content: 'text', summary: 'text' }, { name: 'pressreleases_text_search' });

applyTenantAware(PressReleaseSchema);

export const PressRelease = mongoose.model<IPressRelease>('PressRelease', PressReleaseSchema);
