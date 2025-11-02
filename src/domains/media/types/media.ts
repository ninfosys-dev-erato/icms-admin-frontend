export type MediaCategory = 'image' | 'document' | 'video' | 'audio' | 'other';

export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface Media {
  id: string;
  fileName: string;
  originalName: string;
  url?: string;
  presignedUrl?: string;
  fileId?: string;
  size: number;
  contentType: string;
  uploadedBy: string;
  folder: string;
  category: MediaCategory;
  altText?: string | TranslatableEntity;
  title?: string | TranslatableEntity;
  description?: string | TranslatableEntity;
  tags?: string[];
  isPublic: boolean;
  isActive: boolean;
  metadata?: Record<string, unknown> & {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: MediaCategory;
  folder?: string;
  uploadedBy?: string;
  tags?: string[];
  isPublic?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MediaListResponse {
  data: Media[];
  pagination: PaginationInfo;
}

export interface MediaStatistics {
  totalFiles: number;
  totalSize: number;
  categories: Record<MediaCategory, number>;
  folders: Record<string, number>;
  uploadsToday: number;
  uploadsThisWeek: number;
  uploadsThisMonth: number;
}

export interface MediaLibrarySummary {
  categories: Array<{ category: MediaCategory; count: number; totalSize: number }>;
  folders: Array<{ folder: string; count: number; totalSize: number }>;
  recent: Media[];
  popular: Media[];
}

export interface MediaFormData {
  title?: TranslatableEntity;
  description?: TranslatableEntity;
  altText?: TranslatableEntity;
  tags: string[];
  folder: string;
  isPublic: boolean;
  isActive: boolean;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  expiresIn: number;
  operation: 'get' | 'put';
  mediaId: string;
  fileName: string;
  contentType: string;
}


