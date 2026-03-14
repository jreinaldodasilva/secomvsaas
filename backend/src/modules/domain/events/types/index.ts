import { Document } from 'mongoose';

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface IEvent extends Document {
  tenantId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt?: Date;
  isPublic: boolean;
  status: EventStatus;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  isPublic?: boolean;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  isPublic?: boolean;
  status?: EventStatus;
}

export interface EventFilters {
  status?: string;
  isPublic?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
