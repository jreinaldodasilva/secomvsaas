import { Document } from 'mongoose';

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type EventType = 'institutional' | 'community';

export interface EventRegistrationSettings {
  enabled: boolean;
  deadline?: Date;
  maxParticipants?: number;
  instructions?: string;
}

export interface EventParticipant {
  _id?: string;
  citizenId?: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  notes?: string;
  createdAt: Date;
}

export interface IEvent extends Document {
  tenantId: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt?: Date;
  isPublic: boolean;
  eventType: EventType;
  registration: EventRegistrationSettings;
  participants: EventParticipant[];
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
  eventType?: EventType;
  registration?: {
    enabled?: boolean;
    deadline?: string;
    maxParticipants?: number;
    instructions?: string;
  };
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  isPublic?: boolean;
  eventType?: EventType;
  registration?: {
    enabled?: boolean;
    deadline?: string;
    maxParticipants?: number;
    instructions?: string;
  };
  status?: EventStatus;
}

export interface EventFilters {
  status?: string;
  isPublic?: string;
  eventType?: EventType;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PublicEventFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegisterParticipationDto {
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  notes?: string;
}
