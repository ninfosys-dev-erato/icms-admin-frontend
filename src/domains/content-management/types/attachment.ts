export interface ContentAttachment {
  id: string;
  contentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  order: number;
  originalName?: string;
  altText?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Download URL for frontend use
  downloadUrl?: string;
  // Presigned URL for direct access
  presignedUrl?: string;
}

export interface CreateAttachmentDto {
  contentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  order?: number;
  originalName?: string;
  altText?: string;
  description?: string;
}

export interface UpdateAttachmentDto {
  fileName?: string;
  altText?: string;
  description?: string;
  order?: number;
}

export interface ReorderItemDto {
  id: string;
  order: number;
}

export interface AttachmentStatistics {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
}

export interface AttachmentQuery {
  page?: number;
  limit?: number;
  contentId?: string;
  search?: string;
  mimeType?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface AttachmentListResponse {
  data: ContentAttachment[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

// File validation types
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AttachmentFormData {
  altText: string;
  description: string;
  order: number;
}

export interface AttachmentUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'success' | 'error';
  error?: string;
}

// Presigned URL types
export interface PresignedUrlResponse {
  success: boolean;
  data: {
    presignedUrl: string;
    expiresIn: number;
    operation: 'get' | 'put';
    attachmentId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
  };
}

export interface AttachmentWithPresignedUrl extends ContentAttachment {
  presignedUrl: string;
}

export interface AttachmentsWithPresignedUrlsResponse {
  success: boolean;
  data: AttachmentWithPresignedUrl[];
}

// Store types
export interface AttachmentUIStore {
  // UI state
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelAttachment: ContentAttachment | null;
  selectedContentId: string | null;
  isSubmitting: boolean;

  // Form state
  formData: AttachmentFormData;
  selectedFiles: File[];
  isUploading: boolean;

  // Actions
  openCreatePanel: (contentId: string) => void;
  openEditPanel: (attachment: ContentAttachment) => void;
  closePanel: () => void;
  setSelectedContentId: (contentId: string | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setUploading: (isUploading: boolean) => void;
  updateFormField: (field: keyof AttachmentFormData, value: unknown) => void;
  setSelectedFiles: (files: File[]) => void;
  resetForm: () => void;
}
