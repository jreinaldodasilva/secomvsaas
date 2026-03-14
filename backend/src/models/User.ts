import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { authMixin } from './mixins/authMixin';
import { baseSchemaFields, baseSchemaOptions } from './base/baseSchema';

// TODO: Import UserRole from @vsaas/types
const USER_ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
    select: false,
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'staff',
  },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  ...authMixin.fields,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false },
  phone: { type: String, trim: true },
  passwordHistory: {
    type: [{ password: String, changedAt: Date }],
    select: false,
    default: [],
  },
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  forcePasswordChange: { type: Boolean, default: false },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    },
  },
} as any);

// Block super_admin role assignment on existing documents
UserSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('role') && (this as any).role === 'super_admin') {
    return next(new Error('super_admin role cannot be assigned via application code'));
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const plainText = (this as any).password;
  const maxHistory = 5;

  // Check password reuse
  if (!this.isNew && (this as any).passwordHistory?.length > 0) {
    for (const old of (this as any).passwordHistory.slice(0, maxHistory)) {
      if (await bcrypt.compare(plainText, old.password)) {
        return next(new Error('Senha não pode ser igual às últimas 5 senhas utilizadas'));
      }
    }
  }

  const salt = await bcrypt.genSalt(12);
  (this as any).password = await bcrypt.hash(plainText, salt);
  (this as any).passwordChangedAt = new Date();

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 90);
  (this as any).passwordExpiresAt = expiry;
  (this as any).forcePasswordChange = false;

  next();
});

Object.assign(UserSchema.methods, authMixin.methods);
Object.assign(UserSchema.statics, authMixin.statics);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, email: 1 });

export const User = mongoose.model('User', UserSchema);
