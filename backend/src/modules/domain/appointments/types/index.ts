import { Document } from 'mongoose';

export interface IAppointment extends Document {
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

export interface CreateAppointmentDto {
  name: string;
}

export interface UpdateAppointmentDto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface AppointmentFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
