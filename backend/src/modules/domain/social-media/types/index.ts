import { Document } from 'mongoose';

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok';
export type SocialMediaStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ISocialMedia extends Document {
  tenantId: string;
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: SocialMediaStatus;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocialMediaDto {
  platform: SocialPlatform;
  content: string;
  mediaUrl?: string;
  scheduledAt?: string;
}

export interface UpdateSocialMediaDto {
  platform?: SocialPlatform;
  content?: string;
  mediaUrl?: string;
  scheduledAt?: string;
  status?: SocialMediaStatus;
}

export interface SocialMediaFilters {
  status?: string;
  platform?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
