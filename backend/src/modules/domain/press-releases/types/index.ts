import { Document } from 'mongoose';

export type PressReleaseStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type PressReleaseCategory = 'nota_oficial' | 'comunicado' | 'convite' | 'esclarecimento' | 'outro';

export interface IPressRelease extends Document {
  tenantId: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  category: PressReleaseCategory;
  tags: string[];
  status: PressReleaseStatus;
  publishedAt?: Date;
  approvedBy?: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePressReleaseDto {
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  category?: PressReleaseCategory;
  tags?: string[];
}

export interface UpdatePressReleaseDto {
  title?: string;
  subtitle?: string;
  content?: string;
  summary?: string;
  category?: PressReleaseCategory;
  tags?: string[];
  status?: PressReleaseStatus;
}

export interface PressReleaseFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
