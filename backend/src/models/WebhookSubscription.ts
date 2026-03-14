import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookSubscription extends Document {
  tenantId: mongoose.Types.ObjectId;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSubscriptionSchema = new Schema<IWebhookSubscription>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  url: { type: String, required: true },
  events: [{ type: String, required: true }],
  secret: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

WebhookSubscriptionSchema.index({ tenantId: 1, isActive: 1 });

export const WebhookSubscription = mongoose.model<IWebhookSubscription>('WebhookSubscription', WebhookSubscriptionSchema);
