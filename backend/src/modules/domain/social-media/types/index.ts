import { Document } from 'mongoose';

export interface ISocialMedia extends Document {
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

export interface CreateSocialMediaDto {
  name: string;
}

export interface UpdateSocialMediaDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface SocialMediaFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
