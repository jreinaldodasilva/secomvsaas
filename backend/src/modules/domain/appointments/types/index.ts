import { Document } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface IAppointment extends Document {
  tenantId: string;
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: Date;
  notes?: string;
  status: AppointmentStatus;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  citizenName?: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service?: string;
  scheduledAt?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilters {
  status?: string;
  service?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
