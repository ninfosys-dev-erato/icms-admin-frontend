import { attachmentRepository } from '../repositories/attachment-repository';
import {
  ContentAttachment,
  CreateAttachmentDto,
  UpdateAttachmentDto,
  ReorderItemDto,
  AttachmentStatistics,
  AttachmentQuery,
  AttachmentListResponse,
  FileValidationResult,
} from '../types/attachment';

export class AttachmentService {
  // ========================================
  // LIST OPERATIONS
  // ========================================

  static async getAttachmentsByContent(contentId: string): Promise<ContentAttachment[]> {
    try {
      return await attachmentRepository.getAttachmentsByContent(contentId);
    } catch (error) {
      this.handleError(error, 'Failed to fetch attachments for content');
      throw error;
    }
  }

  static async getAttachments(query: AttachmentQuery = {}): Promise<AttachmentListResponse> {
    try {
      return await attachmentRepository.getAttachments(query);
    } catch (error) {
      this.handleError(error, 'Failed to fetch attachments');
      throw error;
    }
  }

  static async searchAttachments(searchTerm: string, query: AttachmentQuery = {}): Promise<AttachmentListResponse> {
    try {
      const searchQuery = { ...query, search: searchTerm };
      return await attachmentRepository.getAttachments(searchQuery);
    } catch (error) {
      this.handleError(error, 'Failed to search attachments');
      throw error;
    }
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  static async getAttachmentById(id: string): Promise<ContentAttachment> {
    try {
      return await attachmentRepository.getAttachmentById(id);
    } catch (error) {
      this.handleError(error, 'Failed to fetch attachment');
      throw error;
    }
  }

  static async createAttachment(data: CreateAttachmentDto, file: File): Promise<ContentAttachment> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      return await attachmentRepository.createAttachment(data, file);
    } catch (error) {
      this.handleError(error, 'Failed to create attachment');
      throw error;
    }
  }

  static async updateAttachment(id: string, data: UpdateAttachmentDto): Promise<ContentAttachment> {
    try {
      return await attachmentRepository.updateAttachment(id, data);
    } catch (error) {
      this.handleError(error, 'Failed to update attachment');
      throw error;
    }
  }

  static async deleteAttachment(id: string): Promise<void> {
    try {
      await attachmentRepository.deleteAttachment(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete attachment');
      throw error;
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async reorderAttachments(contentId: string, orders: ReorderItemDto[]): Promise<void> {
    try {
      await attachmentRepository.reorderAttachments(contentId, orders);
    } catch (error) {
      this.handleError(error, 'Failed to reorder attachments');
      throw error;
    }
  }

  static async bulkDeleteAttachments(ids: string[]): Promise<void> {
    try {
      await attachmentRepository.bulkDeleteAttachments(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete attachments');
      throw error;
    }
  }

  // ========================================
  // STATISTICS
  // ========================================

  static async getAttachmentStatistics(): Promise<AttachmentStatistics> {
    try {
      return await attachmentRepository.getAttachmentStatistics();
    } catch (error) {
      this.handleError(error, 'Failed to fetch attachment statistics');
      throw error;
    }
  }

  // ========================================
  // DOWNLOAD
  // ========================================

  static async downloadAttachment(id: string): Promise<Blob> {
    try {
      return await attachmentRepository.downloadAttachment(id);
    } catch (error) {
      this.handleError(error, 'Failed to download attachment');
      throw error;
    }
  }

  // ========================================
  // PRESIGNED URL OPERATIONS
  // ========================================

  static async getPresignedUrl(id: string, expiresIn?: number, operation?: 'get' | 'put'): Promise<string> {
    try {
      const response = await attachmentRepository.getPresignedUrl(id, expiresIn, operation);
      return response.data.presignedUrl;
    } catch (error) {
      this.handleError(error, 'Failed to get presigned URL');
      throw error;
    }
  }

  static async getAttachmentsWithPresignedUrls(contentId: string, expiresIn?: number): Promise<ContentAttachment[]> {
    try {
      console.log('AttachmentService: getAttachmentsWithPresignedUrls called for contentId:', contentId);
      const response = await attachmentRepository.getAttachmentsWithPresignedUrls(contentId, expiresIn);
      console.log('AttachmentService: getAttachmentsWithPresignedUrls response:', response);
      return response.data as ContentAttachment[];
    } catch (error) {
      console.error('AttachmentService: getAttachmentsWithPresignedUrls error:', error);
      this.handleError(error, 'Failed to fetch attachments with presigned URLs');
      throw error;
    }
  }

  // ========================================
  // FILE VALIDATION
  // ========================================

  static validateFile(file: File): FileValidationResult {
    // File size validation (20MB limit)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 20MB limit.',
      };
    }

    // File type validation - allow documents, images, audio, and archives (no videos)
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      'application/rtf',
      'text/plain',
      'text/csv',
      'text/xml',
      'application/json',
      // Images (all common formats)
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/ico',
      'image/heic',
      'image/heif',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/aac',
      'audio/flac',
      'audio/webm',
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload documents (PDF, Word, Excel, PowerPoint), images, audio files, or compressed archives. Videos are not allowed.',
      };
    }

    return { isValid: true };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category for grouping
   */
  static getFileTypeCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf')) return 'document';
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'other';
  }

  /**
   * Get file icon based on MIME type (returns emoji for better UX)
   */
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('application/pdf')) return '📄';
    if (mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return '📝';
    if (mimeType.startsWith('application/vnd.ms-excel') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return '📊';
    if (mimeType.startsWith('application/vnd.ms-powerpoint') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.presentationml.presentation')) return '📽️';
    if (mimeType.startsWith('text/')) return '📃';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
    if (mimeType.startsWith('application/')) return '📎';
    return '📎';
  }

  /**
   * Get file type label for display
   */
  static getFileTypeLabel(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Image File';
    if (mimeType.startsWith('video/')) return 'Video File';
    if (mimeType.startsWith('audio/')) return 'Audio File';
    if (mimeType.startsWith('application/pdf')) return 'PDF Document';
    if (mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'Word Document';
    if (mimeType.startsWith('application/vnd.ms-excel') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return 'Excel Spreadsheet';
    if (mimeType.startsWith('application/vnd.ms-powerpoint') || mimeType.startsWith('application/vnd.openxmlformats-officedocument.presentationml.presentation')) return 'PowerPoint Presentation';
    if (mimeType.startsWith('text/')) return 'Text Document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'Compressed Archive';
    if (mimeType.startsWith('application/')) return 'Document';
    return 'File';
  }

  /**
   * Get file status color for UI
   */
  static getFileStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
        return 'green';
      case 'draft':
        return 'blue';
      case 'archived':
        return 'gray';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`AttachmentService Error: ${defaultMessage}`, error);
    
    if (error instanceof Error) {
      throw new Error(`${defaultMessage}: ${error.message}`);
    }
    
    throw new Error(defaultMessage);
  }
}
