import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog {
  user?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  ipAddress: string;
  userAgent?: string;
  statusCode?: number;
  changes?: { before?: any; after?: any };
  metadata?: Record<string, any>;
  tenantId?: mongoose.Types.ObjectId;
}

const AuditLogSchema = new Schema<IAuditLog & Document>({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'read', 'update', 'delete', 'failed_login', 'authz_failure', 'password_change', 'mfa_setup', 'mfa_disable', 'export', 'import'],
    index: true,
  },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  method: { type: String, required: true, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  path: { type: String, required: true },
  ipAddress: { type: String, required: true, index: true },
  userAgent: String,
  statusCode: Number,
  changes: { before: Schema.Types.Mixed, after: Schema.Types.Mixed },
  metadata: Schema.Types.Mixed,
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    },
  },
});

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: parseInt(process.env.AUDIT_LOG_TTL_DAYS || '90', 10) * 86400 });
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog & Document>('AuditLog', AuditLogSchema);
