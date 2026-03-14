import { Document } from 'mongoose';

export interface IMediaContact extends Document {
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

export interface CreateMediaContactDto {
  name: string;
}

export interface UpdateMediaContactDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface MediaContactFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
