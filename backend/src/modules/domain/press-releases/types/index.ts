import { Document } from 'mongoose';

export interface IPressRelease extends Document {
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

export interface CreatePressReleaseDto {
  name: string;
}

export interface UpdatePressReleaseDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface PressReleaseFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
