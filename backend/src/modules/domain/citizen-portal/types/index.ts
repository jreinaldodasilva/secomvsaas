import { Document } from 'mongoose';

export interface ICitizenPortal extends Document {
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

export interface CreateCitizenPortalDto {
  name: string;
}

export interface UpdateCitizenPortalDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface CitizenPortalFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
