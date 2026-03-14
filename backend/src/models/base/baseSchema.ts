import { SchemaDefinition, SchemaOptions } from 'mongoose';

export const baseSchemaFields: SchemaDefinition = {
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
};

export const baseSchemaOptions: SchemaOptions<any> = {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.isDeleted !== undefined) delete ret.isDeleted;
      return ret;
    },
  },
};
