import { Schema, SchemaDefinition } from 'mongoose';

/**
 * Fields that every tenant-scoped model must include.
 * Add these to your schema via spread: `{ ...tenantAwareFields, ...yourFields }`
 */
export const tenantAwareFields: SchemaDefinition = {
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'tenantId é obrigatório'],
    index: true,
  },
};

/**
 * Applies tenant-aware hooks and indexes to a schema.
 * Call after schema creation: `applyTenantAware(schema)`
 */
export function applyTenantAware(schema: Schema): void {
  // Prevent tenantId from being changed after creation
  schema.pre('save', function (next) {
    if (!this.isNew && this.isModified('tenantId')) {
      return next(new Error('tenantId não pode ser alterado após a criação'));
    }
    next();
  });

  // Ensure tenantId is present on creation
  schema.pre('save', function (next) {
    if (this.isNew && !(this as any).tenantId) {
      return next(new Error('tenantId é obrigatório'));
    }
    next();
  });
}
