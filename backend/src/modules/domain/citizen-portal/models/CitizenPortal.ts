import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { ICitizenPortal } from '../types';

const CitizenPortalSchema = new Schema<ICitizenPortal>({
  ...tenantAwareFields,
  userId: { type: String, required: true },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  cpf: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true, maxlength: 300 },
  neighborhood: { type: String, trim: true, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 100 },
  state: { type: String, trim: true, maxlength: 2 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'citizen-profiles',
});

CitizenPortalSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
CitizenPortalSchema.index({ tenantId: 1, cpf: 1 });
CitizenPortalSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(CitizenPortalSchema);

export const CitizenPortal = mongoose.model<ICitizenPortal>('CitizenPortal', CitizenPortalSchema);
