import { Document } from 'mongoose';

export interface ICitizenPortal extends Document {
  tenantId: string;
  userId: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCitizenPortalDto {
  userId: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface UpdateCitizenPortalDto {
  fullName?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive';
}

export interface CitizenPortalFilters {
  status?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
