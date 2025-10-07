export interface TranslatableEntity {
  en: string;
  ne: string;
}

// ========================================
// DOCUMENT TYPES
// ========================================

export enum DocumentType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  XLS = 'XLS',
  XLSX = 'XLSX',
  PPT = 'PPT',
  PPTX = 'PPTX',
  TXT = 'TXT',
  RTF = 'RTF',
  CSV = 'CSV',
  ZIP = 'ZIP',
  RAR = 'RAR',
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED'
}

export enum DocumentCategory {
  OFFICIAL = 'OFFICIAL',
  REPORT = 'REPORT',
  FORM = 'FORM',
  POLICY = 'POLICY',
  PROCEDURE = 'PROCEDURE',
  GUIDELINE = 'GUIDELINE',
  NOTICE = 'NOTICE',
  CIRCULAR = 'CIRCULAR',
  OTHER = 'OTHER'
}

export interface Document {
  id: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
  downloadCount: number;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMedia {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  presignedUrl?: string;
  size: number;
  contentType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: TranslatableEntity;
  description?: TranslatableEntity;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic?: boolean;
  requiresAuth?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDocumentRequest {
  title?: TranslatableEntity;
  description?: TranslatableEntity;
  category?: DocumentCategory;
  status?: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic?: boolean;
  requiresAuth?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  documentType?: DocumentType;
  category?: DocumentCategory;
  status?: DocumentStatus;
  isPublic?: boolean;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

export interface DocumentFormData {
  title: TranslatableEntity;
  description?: TranslatableEntity;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
}

// ========================================
// DOCUMENT DOWNLOAD TYPES
// ========================================

export interface DocumentDownload {
  id: string;
  documentId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
}

export interface CreateDocumentDownloadDto {
  documentId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

// ========================================
// DOCUMENT VERSION TYPES
// ========================================

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  changeLog?: TranslatableEntity;
  createdAt: Date;
}

export interface CreateDocumentVersionDto {
  documentId: string;
  version: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  changeLog?: TranslatableEntity;
}

// ========================================
// DOCUMENT STATISTICS & ANALYTICS
// ========================================

export interface DocumentStatistics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  byType: Record<DocumentType, number>;
  byCategory: Record<DocumentCategory, number>;
  totalDownloads: number;
  averageDownloadsPerDocument: number;
  totalSize: number;
  averageSize: number;
}

export interface DocumentAnalytics {
  documentId: string;
  documentTitle: string;
  totalDownloads: number;
  downloadsByDate: Record<string, number>;
  downloadsByBrowser: Record<string, number>;
  downloadsByDevice: Record<string, number>;
  topDownloaders: Array<{ userId: string; count: number }>;
}

// ========================================
// PAGINATION & API RESPONSE
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DocumentListResponse {
  data: Document[];
  pagination: PaginationInfo;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface BulkOperationDto {
  ids: string[];
}

export interface BulkUpdateDto {
  ids: string[];
  updates: Partial<UpdateDocumentRequest>;
}

export interface BulkUpdateRequestDto {
  ids: string[];
  updates: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// STORE TYPES
// ========================================

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isUploading: boolean;
  pagination: PaginationInfo | null;
  statistics: DocumentStatistics | null;
  // UI state for panel
  panelOpen?: boolean;
  panelMode?: 'create' | 'edit';
  panelDocument?: Document | null;
  // Query state and request tracking
  currentQuery?: DocumentQuery;
  // Whether initial list has been loaded at least once in this session
  hasLoaded?: boolean;
  // Form state management
  createFormState: DocumentFormData;
  formStateById: Record<string, DocumentFormData>;
  activeFormId: string | null;
  isSubmitting: boolean;
  // File management
  selectedFile: File | null;
  selectedFileById: Record<string, File | null>;
}

export interface DocumentActions {
  // List operations
  loadDocuments: (query?: DocumentQuery) => Promise<void>;
  searchDocuments: (searchTerm: string, query?: DocumentQuery) => Promise<void>;
  loadPublicDocuments: () => Promise<void>;
  
  // CRUD operations
  getDocumentById: (id: string) => Promise<void>;
  createDocument: (data: CreateDocumentRequest) => Promise<void>;
  updateDocument: (id: string, data: UpdateDocumentRequest) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // File operations
  uploadDocument: (file: File, metadata?: Partial<CreateDocumentRequest>) => Promise<void>;
  createDocumentVersion: (documentId: string, file: File, version: string, changeLog?: any) => Promise<void>;
  
  // Bulk operations
  bulkUpdate: (ids: string[], data: Partial<UpdateDocumentRequest>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkPublish: (ids: string[]) => Promise<void>;
  bulkArchive: (ids: string[]) => Promise<void>;
  
  // Status operations
  publishDocument: (id: string) => Promise<void>;
  archiveDocument: (id: string) => Promise<void>;
  
  // Analytics
  loadStatistics: () => Promise<void>;
  getDocumentAnalytics: (id: string) => Promise<DocumentAnalytics>;
  
  // State management
  setCurrentDocument: (document: Document | null) => void;
  setEditing: (isEditing: boolean) => void;
  clearError: () => void;
  
  // Panel management
  openCreatePanel: () => void;
  openEditPanel: (document: Document) => void;
  closePanel: () => void;
  
  // Form management
  updateFormField: (formType: 'create' | 'edit', field: keyof DocumentFormData, value: unknown) => void;
  updateFormFieldById: (id: string, field: keyof DocumentFormData, value: unknown) => void;
  initializeEditForm: (document: Document) => void;
  resetCreateForm: () => void;
  resetFormState: (id: string) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // File management
  setSelectedFile: (formType: 'create' | 'edit', file: File | null) => void;
  setSelectedFileById: (id: string, file: File | null) => void;
  
  // internal control
  _requestSeq?: number;
}

export type DocumentStore = DocumentState & DocumentActions;

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
// FILE VALIDATION TYPES
// ========================================

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationConfig {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}
