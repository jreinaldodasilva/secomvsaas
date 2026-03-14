import { Document } from 'mongoose';

export interface IMediaContact extends Document {
  tenantId: string;
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaContactDto {
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
}

export interface UpdateMediaContactDto {
  name?: string;
  outlet?: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

export interface MediaContactFilters {
  status?: string;
  beat?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
