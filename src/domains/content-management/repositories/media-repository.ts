import { httpClient } from '@/lib/api/http-client';
import { 
  MediaFile, 
  MediaListResponse, 
  MediaQuery,
  UploadOptions
} from '../types/content';

export class MediaRepository {
  private static readonly BASE_URL = '/media';

  /**
   * Get all media files with filtering and pagination
   */
  static async getMedia(query: MediaQuery = {}): Promise<MediaListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
      
      // Add filters if they exist
      if (query.filters) {
        if (query.filters.search) params.append('search', query.filters.search);
        if (query.filters.category) params.append('category', query.filters.category);
        if (query.filters.mimeType) params.append('mimeType', query.filters.mimeType);
        if (query.filters.fileSizeMin !== undefined) params.append('fileSizeMin', query.filters.fileSizeMin.toString());
        if (query.filters.fileSizeMax !== undefined) params.append('fileSizeMax', query.filters.fileSizeMax.toString());
        if (query.filters.dateFrom) params.append('dateFrom', query.filters.dateFrom);
        if (query.filters.dateTo) params.append('dateTo', query.filters.dateTo);
        if (query.filters.tags && query.filters.tags.length > 0) params.append('tags', query.filters.tags.join(','));
        if (query.filters.isPublic !== undefined) params.append('isPublic', query.filters.isPublic.toString());
        if (query.filters.uploadedBy) params.append('uploadedBy', query.filters.uploadedBy);
      }

      const response = await httpClient.get(`${this.BASE_URL}?${params.toString()}`);
      
      // If response.data is undefined or doesn't have the expected structure, return empty data
      if (!response.data || typeof response.data !== 'object' || !('data' in response.data) || !Array.isArray((response.data as any).data)) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        } as MediaListResponse;
      }
      
      return response.data as MediaListResponse;
    } catch (error) {
      console.error('Failed to fetch media:', error);
      throw error;
    }
  }

  /**
   * Get media file by ID
   */
  static async getMediaById(id: string): Promise<MediaFile> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/${id}`);
      return response.data as MediaFile;
    } catch (error) {
      console.error(`Failed to fetch media ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload media file
   */
  static async uploadMedia(file: File, options?: UploadOptions): Promise<MediaFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Backend requires these metadata fields alongside the file
      formData.append('originalName', file.name);
      formData.append('size', String(file.size));
      formData.append('mimetype', file.type || 'application/octet-stream');
      // Map category to folder for backend; default to content-attachments
      formData.append('folder', options?.category || 'content-attachments');

      if (options?.category) formData.append('category', options.category);
      if (options?.tags && options.tags.length > 0) formData.append('tags', options.tags.join(','));
      if (options?.isPublic !== undefined) formData.append('isPublic', options.isPublic.toString());
      if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata));

      const response = await httpClient.post(this.BASE_URL + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: options?.onProgress ? (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress!(progress);
          }
        } : undefined,
      });

      return response.data as MediaFile;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }

  /**
   * Delete media file
   */
  static async deleteMedia(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Failed to delete media ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get presigned URL for media file
   */
  static async getPresignedUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/${id}/presigned-url`);
      return response.data as { url: string; expiresAt: string };
    } catch (error) {
      console.error(`Failed to get presigned URL for media ${id}:`, error);
      throw error;
    }
  }
} 