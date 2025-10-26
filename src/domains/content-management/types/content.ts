import type { ContentAttachment } from "./attachment";

export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface TranslatableEntityOptional {
  en?: string;
  ne?: string;
}

// ========================================
// CONTENT TYPES
// ========================================

export interface Content {
  id: string;
  title: TranslatableEntity;
  slug: string;
  excerpt?: TranslatableEntity;
  content: TranslatableEntity;
  categoryId: string;
  category?: Category;
  tags?: string[];
  priority?: number;
  status: ContentStatus;
  visibility?: ContentVisibility;
  featured: boolean;
  order: number;
  featuredImageId?: string;
  featuredImage?: MediaFile;
  additionalMedia?: string[]; // Media IDs
  attachments?: ContentAttachment[]; // Changed from string[] to ContentAttachment[]
  authorId?: string;
  author?: User;
  createdBy?: User;
  updatedBy?: User;
  seoTitle?: TranslatableEntity;
  seoDescription?: TranslatableEntity;
  seoKeywords?: string[];
  publishedAt?: string | null; // Made nullable to match backend
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number; // Optional since backend doesn't send it
  likeCount?: number;
  shareCount?: number;
}

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ContentVisibility = "public" | "private" | "role-based";

export interface CreateContentRequest {
  title: TranslatableEntity;
  slug?: string;
  excerpt?: TranslatableEntity;
  content: TranslatableEntity;
  seoDescription?: TranslatableEntity;
  categoryId: string;
  status?: ContentStatus;
  featured?: boolean;
  order?: number;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  id: string;
}

export interface ContentFormData {
  title: TranslatableEntity;
  slug: string;
  excerpt: TranslatableEntity;
  content: TranslatableEntity;
  categoryId: string;
  tags: string[];
  priority: number;
  status: ContentStatus;
  visibility: ContentVisibility;
  featured: boolean;
  order: number;
  featuredImageId?: string;
  additionalMedia: string[];
  attachments: string[];
  authorId: string;
  seoTitle: TranslatableEntity;
  seoDescription: TranslatableEntity;
  seoKeywords: string[];
  publishedAt?: string;
  expiresAt?: string;
}

// ========================================
// CATEGORY TYPES
// ========================================

export interface Category {
  id: string;
  name: TranslatableEntity;
  slug: string;
  description?: TranslatableEntity;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
  level: number;
  order: number;
  isActive: boolean;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  contentCount: number;
}

export interface CreateCategoryRequest {
  name: TranslatableEntity;
  slug?: string;
  description?: TranslatableEntity;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryTree {
  id: string;
  name: TranslatableEntity;
  slug: string;
  level: number;
  order: number;
  isActive: boolean;
  children: CategoryTree[];
  contentCount: number;
}

// ========================================
// MEDIA TYPES
// ========================================

export interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  thumbnailUrl?: string;
  presignedUrl?: string;
  presignedUrlExpiry?: number;
  uploadStatus: UploadStatus;
  uploadProgress?: number;
  metadata: MediaMetadata;
  tags: string[];
  category?: string;
  isPublic: boolean;
  uploadedBy: string;
  uploadedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
}

export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled";

export interface MediaMetadata {
  title?: string;
  description?: string;
  altText?: string;
  copyright?: string;
  location?: string;
  dateTaken?: string;
  camera?: string;
  settings?: Record<string, any>;
}

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  presignedUrls?: string[];
  uploadId?: string;
  parts?: UploadPart[];
  error?: string;
  retryCount: number;
  startedAt: number;
  estimatedTimeRemaining?: number;
}

export interface UploadPart {
  partNumber: number;
  etag: string;
  size: number;
}

export interface PresignedUrlCache {
  url: string;
  expiresAt: number;
  operation: "get" | "put";
}

export interface UploadOptions {
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Partial<MediaMetadata>;
  onProgress?: (progress: number) => void;
  onComplete?: (mediaFile: MediaFile) => void;
  onError?: (error: string) => void;
}

// ========================================
// USER TYPES
// ========================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// FILTER TYPES
// ========================================

export interface ContentFilters {
  search?: string;
  categoryId?: string;
  status?: ContentStatus | "all";
  visibility?: ContentVisibility | "all";
  language?: "en" | "ne" | "all";
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  hasFeaturedImage?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  orderMin?: number;
  orderMax?: number;
}

export interface MediaFilters {
  search?: string;
  category?: string;
  mimeType?: string;
  fileSizeMin?: number;
  fileSizeMax?: number;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  isPublic?: boolean;
  uploadedBy?: string;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  level?: number;
}

// ========================================
// QUERY TYPES
// ========================================

export interface ContentQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ContentFilters;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: MediaFilters;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: CategoryFilters;
}

// ========================================
// PAGINATION TYPES
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContentListResponse {
  data: Content[];
  pagination: PaginationInfo;
}

export interface MediaListResponse {
  data: MediaFile[];
  pagination: PaginationInfo;
}

export interface CategoryListResponse {
  data: Category[];
  pagination: PaginationInfo;
}

// ========================================
// BULK OPERATION TYPES
// ========================================

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// STATISTICS TYPES
// ========================================

export interface ContentStatistics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  scheduled: number;
  byCategory: Record<string, number>;
  byStatus: Record<ContentStatus, number>;
  byVisibility: Record<ContentVisibility, number>;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  averageViewsPerContent: number;
  topViewedContent: Array<{ id: string; title: string; views: number }>;
  recentActivity: Array<{ id: string; action: string; timestamp: string }>;
}

export interface MediaStatistics {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  uploadsToday: number;
  uploadsThisWeek: number;
  uploadsThisMonth: number;
  storageUsed: number;
  storageLimit: number;
  topUploaders: Array<{ userId: string; count: number; size: number }>;
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========================================
// BACKBLAZE UPLOAD TYPES
// ========================================

export interface BackblazeUploadInitResponse {
  uploadUrl: string;
  authorizationToken: string;
  uploadId: string;
  minimumPartSize: number;
  maximumPartSize: number;
}

export interface BackblazeUploadPartResponse {
  partNumber: number;
  etag: string;
  size: number;
}

export interface BackblazeUploadCompleteRequest {
  uploadId: string;
  parts: Array<{ partNumber: number; etag: string }>;
}

export interface BackblazeUploadStatus {
  uploadId: string;
  status: "initiated" | "uploading" | "completed" | "failed" | "aborted";
  progress: number;
  parts: BackblazeUploadPartResponse[];
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// ========================================
// CONTENT ATTACHMENT TYPES
// ========================================

export interface CreateAttachmentRequest {
  contentId: string;
  file: File;
  order?: number;
}

export interface AttachmentUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}
