import { Document } from 'mongoose';

export interface IEvent extends Document {
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

export interface CreateEventDto {
  name: string;
}

export interface UpdateEventDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface EventFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
