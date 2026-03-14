import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { IClipping } from '../types';

const ClippingSchema = new Schema<IClipping>({
  ...tenantAwareFields,
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 300 },
  source: { type: String, required: true, trim: true, maxlength: 200 },
  sourceUrl: { type: String, trim: true },
  publishedAt: { type: Date },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral', index: true },
  summary: { type: String, maxlength: 1000 },
  tags: [{ type: String, trim: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'clippings',
});

ClippingSchema.index({ tenantId: 1, sentiment: 1 });
ClippingSchema.index({ tenantId: 1, publishedAt: -1 });
ClippingSchema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(ClippingSchema);

export const Clipping = mongoose.model<IClipping>('Clipping', ClippingSchema);
