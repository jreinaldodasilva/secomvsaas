import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { ICitizenPortal } from '../types';

const CitizenPortalSchema = new Schema<ICitizenPortal>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'citizen-portal',
});

CitizenPortalSchema.index({ tenantId: 1, status: 1 });
CitizenPortalSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(CitizenPortalSchema);

export const CitizenPortal = mongoose.model<ICitizenPortal>('CitizenPortal', CitizenPortalSchema);
