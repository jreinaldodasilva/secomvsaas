import mongoose, { Schema, Document } from 'mongoose';

export interface IInviteToken extends Document {
  tenantId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  token: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

const InviteTokenSchema = new Schema<IInviteToken>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  token: { type: String, required: true, unique: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  acceptedAt: Date,
}, { timestamps: true });

InviteTokenSchema.index({ tenantId: 1, email: 1 });
InviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InviteToken = mongoose.model<IInviteToken>('InviteToken', InviteTokenSchema);
