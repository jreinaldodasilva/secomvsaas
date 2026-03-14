import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IPressRelease } from '../types';

const PressReleaseSchema = new Schema<IPressRelease>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'press-releases',
});

PressReleaseSchema.index({ tenantId: 1, status: 1 });
PressReleaseSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(PressReleaseSchema);

export const PressRelease = mongoose.model<IPressRelease>('PressRelease', PressReleaseSchema);
