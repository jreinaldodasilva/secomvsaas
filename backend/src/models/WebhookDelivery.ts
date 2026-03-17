import mongoose, { Schema, Document } from 'mongoose';

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface IWebhookDelivery extends Document {
  webhookId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  event: string;
  payload: Record<string, any>;
  status: WebhookDeliveryStatus;
  attempts: number;
  lastAttemptAt?: Date;
  lastStatusCode?: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookDeliverySchema = new Schema<IWebhookDelivery>({
  webhookId: { type: Schema.Types.ObjectId, ref: 'WebhookSubscription', required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  event: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
    index: true,
  },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: Date,
  lastStatusCode: Number,
  lastError: String,
}, { timestamps: true });

WebhookDeliverySchema.index({ tenantId: 1, status: 1, createdAt: -1 });
WebhookDeliverySchema.index({ webhookId: 1, createdAt: -1 });

export const WebhookDelivery = mongoose.model<IWebhookDelivery>('WebhookDelivery', WebhookDeliverySchema);
