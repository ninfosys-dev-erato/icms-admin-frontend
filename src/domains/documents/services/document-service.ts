import { documentRepository } from '../repositories/document-repository';
import {
  Document,
  DocumentAnalytics,
  DocumentListResponse,
  DocumentQuery,
  DocumentStatistics,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  BulkOperationResult,
  ValidationResult,
  ValidationError,
  DocumentType,
  DocumentStatus,
  DocumentCategory,
  FileValidationResult,
} from '../types/document';

export class DocumentService {
  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<Document> {
    const response = await documentRepository.getById(id);
    return response.data;
  }

  /**
   * Get all documents with pagination and filtering
   */
  static async getDocuments(query?: DocumentQuery): Promise<DocumentListResponse> {
    const response = await documentRepository.getAdminDocuments(query);
    console.log('📚 DocumentService.getDocuments raw response:', response);
    console.log('📚 DocumentService.getDocuments response.data:', response.data);
    
    // The httpClient returns the API response: { success: true, data: [...], pagination: {...} }
    // We need to extract the data and pagination from the response
    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  /**
   * Get public documents
   */
  static async getPublicDocuments(query?: DocumentQuery): Promise<DocumentListResponse> {
    const response = await documentRepository.getPublicDocuments(query);
    return response.data;
  }

  /**
   * Search documents
   */
  static async searchDocuments(searchTerm: string, query?: DocumentQuery): Promise<DocumentListResponse> {
    const response = await documentRepository.searchAdminDocuments({ ...query, search: searchTerm });
    return response.data;
  }

  /**
   * Get documents by type
   */
  static async getDocumentsByType(type: DocumentType, query?: DocumentQuery): Promise<DocumentListResponse> {
    const response = await documentRepository.getDocumentsByType(type, query);
    return response.data;
  }

  /**
   * Get documents by category
   */
  static async getDocumentsByCategory(category: DocumentCategory, query?: DocumentQuery): Promise<DocumentListResponse> {
    const response = await documentRepository.getDocumentsByCategory(category, query);
    return response.data;
  }

  /**
   * Create new document
   */
  static async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const response = await documentRepository.create(data);
    return response.data;
  }

  /**
   * Update existing document
   */
  static async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await documentRepository.update(id, data);
    return response.data;
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: string): Promise<void> {
    await documentRepository.delete(id);
  }

  /**
   * Upload document with file
   */
  static async uploadDocument(file: File, metadata?: Partial<CreateDocumentRequest>): Promise<Document> {
    const response = await documentRepository.uploadDocument(file, metadata);
    return response.data;
  }

  /**
   * Create document version
   */
  static async createDocumentVersion(documentId: string, file: File, version: string, changeLog?: any): Promise<Document> {
    const response = await documentRepository.createDocumentVersion(documentId, file, version, changeLog);
    return response.data;
  }

  /**
   * Get document versions
   */
  static async getDocumentVersions(documentId: string): Promise<any[]> {
    const response = await documentRepository.getDocumentVersions(documentId);
    return response.data;
  }

  /**
   * Bulk update documents
   */
  static async bulkUpdate(ids: string[], updates: Partial<UpdateDocumentRequest>): Promise<BulkOperationResult> {
    const response = await documentRepository.bulkUpdate({ ids, updates });
    return response.data;
  }

  /**
   * Bulk delete documents
   */
  static async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const response = await documentRepository.bulkDelete(ids);
    return response.data;
  }

  /**
   * Get document statistics
   */
  static async getStatistics(): Promise<DocumentStatistics> {
    const response = await documentRepository.getStatistics();
    return response.data;
  }

  /**
   * Get document analytics
   */
  static async getDocumentAnalytics(id: string): Promise<DocumentAnalytics> {
    const response = await documentRepository.getDocumentAnalytics(id);
    return response.data;
  }

  /**
   * Get presigned download URL for document (admin)
   */
  static async getAdminDownloadUrl(id: string, expires?: number): Promise<{ downloadUrl: string }> {
    const response = await documentRepository.getAdminDownloadUrl(id, expires);
    return response.data || response; // Handle different response formats
  }

  /**
   * Get presigned download URL for document (public)
   */
  static async getPublicDownloadUrl(id: string, expires?: number): Promise<{ downloadUrl: string }> {
    const response = await documentRepository.getPublicDownloadUrl(id, expires);
    return response.data || response; // Handle different response formats
  }

  /**
   * Get presigned preview URL for document (admin)
   */
  static async getAdminPreviewUrl(id: string, expires?: number): Promise<{ previewUrl: string }> {
    const response = await documentRepository.getAdminPreviewUrl(id, expires);
    return response.data || response; // Handle different response formats
  }

  /**
   * Get presigned preview URL for document (public)
   */
  static async getPublicPreviewUrl(id: string, expires?: number): Promise<{ previewUrl: string }> {
    const response = await documentRepository.getPublicPreviewUrl(id, expires);
    return response.data || response; // Handle different response formats
  }

  /**
   * Export documents
   */
  static async exportDocuments(query: DocumentQuery, format: string): Promise<Blob> {
    const response = await documentRepository.exportDocuments(query, format);
    return response.data;
  }

  /**
   * Import documents
   */
  static async importDocuments(file: File): Promise<any> {
    const response = await documentRepository.importDocuments(file);
    return response.data;
  }

  /**
   * Validate document data
   */
  static validateDocument(data: CreateDocumentRequest | UpdateDocumentRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate title if provided
    if ('title' in data && data.title) {
      if (!data.title.en?.trim()) {
        errors.push({
          field: 'title',
          message: 'English title is required',
          code: 'REQUIRED_FIELD',
        });
      }
      if (!data.title.ne?.trim()) {
        errors.push({
          field: 'title',
          message: 'Nepali title is required',
          code: 'REQUIRED_FIELD',
        });
      }
    }

    // Validate category if provided
    if ('category' in data && data.category) {
      if (!Object.values(DocumentCategory).includes(data.category)) {
        errors.push({
          field: 'category',
          message: 'Invalid category',
          code: 'INVALID_VALUE',
        });
      }
    }

    // Validate status if provided
    if ('status' in data && data.status) {
      if (!Object.values(DocumentStatus).includes(data.status)) {
        errors.push({
          field: 'status',
          message: 'Invalid status',
          code: 'INVALID_VALUE',
        });
      }
    }

    // Validate order if provided
    if ('order' in data && data.order !== undefined) {
      if (data.order < 0) {
        errors.push({
          field: 'order',
          message: 'Order must be non-negative',
          code: 'INVALID_VALUE',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate file
   */
  static validateFile(file: File): FileValidationResult {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/rtf',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
    ];

    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed. Please upload a supported document format.',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds maximum limit of 100MB.',
      };
    }

    return { isValid: true };
  }

  /**
   * Get display title for notifications
   */
  static getDisplayTitle(document: Document): string {
    return document.title?.en || document.title?.ne || document.originalName || 'Document';
  }

  /**
   * Get file type icon
   */
  static getFileTypeIcon(documentType: DocumentType): string {
    switch (documentType) {
      case DocumentType.PDF:
        return '📄';
      case DocumentType.DOC:
      case DocumentType.DOCX:
        return '📝';
      case DocumentType.XLS:
      case DocumentType.XLSX:
        return '📊';
      case DocumentType.PPT:
      case DocumentType.PPTX:
        return '📽️';
      case DocumentType.TXT:
        return '📃';
      case DocumentType.CSV:
        return '📋';
      case DocumentType.ZIP:
      case DocumentType.RAR:
        return '📦';
      default:
        return '📎';
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get document status color
   */
  static getStatusColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.PUBLISHED:
        return 'green';
      case DocumentStatus.DRAFT:
        return 'blue';
      case DocumentStatus.ARCHIVED:
        return 'gray';
      case DocumentStatus.EXPIRED:
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get category color
   */
  static getCategoryColor(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.OFFICIAL:
        return 'purple';
      case DocumentCategory.REPORT:
        return 'blue';
      case DocumentCategory.FORM:
        return 'green';
      case DocumentCategory.POLICY:
        return 'orange';
      case DocumentCategory.PROCEDURE:
        return 'teal';
      case DocumentCategory.GUIDELINE:
        return 'cyan';
      case DocumentCategory.NOTICE:
        return 'yellow';
      case DocumentCategory.CIRCULAR:
        return 'magenta';
      default:
        return 'gray';
    }
  }
}

// Export the DocumentService class
export default DocumentService;
