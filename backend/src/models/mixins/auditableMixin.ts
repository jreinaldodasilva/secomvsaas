import { Schema, SchemaDefinition } from 'mongoose';

export const auditableFields: SchemaDefinition = {
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
};
