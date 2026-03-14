import { Document } from 'mongoose';

export type ClippingSentiment = 'positive' | 'neutral' | 'negative';

export interface IClipping extends Document {
  tenantId: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: Date;
  sentiment: ClippingSentiment;
  summary?: string;
  tags: string[];
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClippingDto {
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: string;
  sentiment?: ClippingSentiment;
  summary?: string;
  tags?: string[];
}

export interface UpdateClippingDto {
  title?: string;
  source?: string;
  sourceUrl?: string;
  publishedAt?: string;
  sentiment?: ClippingSentiment;
  summary?: string;
  tags?: string[];
}

export interface ClippingFilters {
  sentiment?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
