import { Document } from 'mongoose';

export interface IClipping extends Document {
  tenantId: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClippingDto {
  name: string;
}

export interface UpdateClippingDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface ClippingFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
