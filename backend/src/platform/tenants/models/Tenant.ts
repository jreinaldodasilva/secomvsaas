import mongoose, { Schema, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '../../../models/base/baseSchema';

export interface ITenant extends Document {
  name: string;
  slug: string;
  domain?: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled' | 'deleted';
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  settings: {
    timezone: string;
    locale: string;
    currency: string;
    features: Record<string, boolean>;
  };
  owner: mongoose.Types.ObjectId;
  trialEndsAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
  maxUsers: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: [true, 'Nome do tenant é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  slug: {
    type: String,
    required: [true, 'Slug é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'],
    maxlength: 63,
  },
  domain: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'cancelled', 'deleted'],
    default: 'trial',
    index: true,
  },
  plan: {
    type: String,
    enum: ['trial', 'starter', 'professional', 'enterprise'],
    default: 'trial',
  },
  settings: {
    timezone: { type: String, default: 'America/Sao_Paulo' },
    locale: { type: String, default: 'pt-BR' },
    currency: { type: String, default: 'BRL' },
    features: { type: Schema.Types.Mixed, default: {} },
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trialEndsAt: Date,
  suspendedAt: Date,
  suspensionReason: String,
  maxUsers: { type: Number, default: 5 },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: 'tenants',
});

TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ owner: 1 });
TenantSchema.index({ status: 1, createdAt: -1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
