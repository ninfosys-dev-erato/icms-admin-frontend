import { httpClient } from '@/lib/api/http-client';

export interface MediaUploadRequest {
  file: File;
  folder: string;
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface MediaResponse {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  fileId: string;
  size: number;
  contentType: string;
  uploadedBy: string;
  folder: string;
  category: string;
  altText?: string;
  title?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  isActive: boolean;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadResponse {
  success: boolean;
  data: MediaResponse;
  message?: string;
  meta?: {
    processingTime: number;
    requestId: string;
  };
}

export class MediaService {
  private static readonly BASE_URL = '/media';

  static async uploadMedia(request: MediaUploadRequest): Promise<MediaResponse> {
    try {
      // Validate file object
      if (!request.file || !request.file.name || request.file.size === undefined || !request.file.type) {
        throw new Error('Invalid file object. File must have name, size, and type properties.');
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (request.file.size > maxSize) {
        throw new Error(`File size (${(request.file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size of 50MB.`);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(request.file.type)) {
        throw new Error(`File type ${request.file.type} is not supported. Please use: ${allowedTypes.join(', ')}`);
      }

      const formData = new FormData();
      
      // Required: Add the file
      formData.append('file', request.file);
      
      // Required: Add metadata as individual FormData fields
      formData.append('originalName', request.file.name);
      formData.append('size', request.file.size.toString());
      formData.append('mimetype', request.file.type);
      formData.append('folder', request.folder);
      
      // Optional: Add other metadata fields
      if (request.altText) {
        formData.append('altText', request.altText);
      }
      
      if (request.title) {
        formData.append('title', request.title);
      }
      
      if (request.description) {
        formData.append('description', request.description);
      }
      
      // FIX: Handle tags correctly
      if (request.tags && request.tags.length > 0) {
        // TEMPORARILY DISABLED: Remove tags to test if upload works without them
        // const hardcodedTags = ['office', 'bg', 'photo'];
        // hardcodedTags.forEach(tag => {
        //   formData.append('tags', tag);
        // });
        console.log('📝 Tags temporarily disabled for testing');
      }
      
      if (request.isPublic !== undefined) {
        formData.append('isPublic', request.isPublic.toString());
      }

      console.log('📤 MediaService: Uploading file:', {
        fileName: request.file.name,
        fileSize: request.file.size,
        fileSizeMB: (request.file.size / 1024 / 1024).toFixed(2) + 'MB',
        fileType: request.file.type,
        folder: request.folder,
        tags: request.tags, // Log tags for debugging
      });

      // Debug: Log what's being sent in FormData
      console.log('📤 MediaService: FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (key === 'file') {
          const file = value as File;
          console.log(`  ${key}: [File object] - name: ${file.name}, size: ${file.size}, type: ${file.type}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Debug: Check if file is actually in FormData
      const fileInFormData = formData.get('file') as File | null;
      console.log('📤 MediaService: File in FormData:', {
        exists: !!fileInFormData,
        type: typeof fileInFormData,
        isFile: fileInFormData instanceof File,
        name: fileInFormData?.name,
        size: fileInFormData?.size,
        mimeType: fileInFormData?.type
      });

      // Debug: Log file object properties
      console.log('📤 MediaService: File object properties:', {
        name: request.file.name,
        size: request.file.size,
        type: request.file.type,
        lastModified: request.file.lastModified,
      });

      const response = await httpClient.post<MediaResponse>(
        `${this.BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for file uploads
        }
      );

      console.log('📥 MediaService: Upload response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });

      if (!response.success || !response.data) {
        const errorMessage = this.formatErrorMessage(response.error?.message) || 'Failed to upload media';
        console.error('❌ MediaService: Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ MediaService: Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ MediaService: Upload error:', error);
      
      // Handle specific error types
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Upload timed out. Please try again with a smaller file or check your internet connection.');
        }
      }
      
      this.handleError(error, 'Failed to upload media');
      throw error;
    }
  }

  static async getMediaById(id: string): Promise<MediaResponse> {
    try {
      const response = await httpClient.get<MediaResponse>(`${this.BASE_URL}/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to get media');
      }

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get media');
      throw error;
    }
  }

  static async deleteMedia(id: string): Promise<void> {
    try {
      const response = await httpClient.delete(`${this.BASE_URL}/${id}`);
      
      if (!response.success) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to delete media');
      }
    } catch (error) {
      this.handleError(error, 'Failed to delete media');
      throw error;
    }
  }

  static async getMediaUrl(id: string, expiresIn?: number): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
      }

      const response = await httpClient.get<{ url: string }>(
        `${this.BASE_URL}/${id}/url${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to get media URL');
      }

      return response.data.url;
    } catch (error) {
      this.handleError(error, 'Failed to get media URL');
      throw error;
    }
  }

  static async getPresignedUrl(id: string, expiresIn?: number): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
      }

      const response = await httpClient.get<{ presignedUrl: string }>(
        `${this.BASE_URL}/${id}/presigned-url${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      console.log("🔍 MediaService - getPresignedUrl response:", response);
      
      if (!response.success || !response.data) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to get presigned URL');
      }

      // The API returns presignedUrl, not url
      if (!response.data.presignedUrl) {
        console.error("🔍 MediaService - No presignedUrl in response.data:", response.data);
        throw new Error('Presigned URL not found in response');
      }

      console.log("🔍 MediaService - Returning presignedUrl:", response.data.presignedUrl);
      return response.data.presignedUrl;
    } catch (error) {
      this.handleError(error, 'Failed to get presigned URL');
      throw error;
    }
  }

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`MediaService Error: ${defaultMessage}`, error);
  }

  // Format error messages to be user-friendly
  private static formatErrorMessage(message: string | string[] | undefined): string {
    if (!message) {
      return 'Something went wrong. Please try again.';
    }

    // Handle case where message is an array (validation errors)
    if (Array.isArray(message)) {
      if (message.length === 1) {
        return this.formatSingleMessage(message[0]);
      } else if (message.length > 1) {
        return `Multiple validation errors: ${message.slice(0, 3).join(', ')}${message.length > 3 ? '...' : ''}`;
      } else {
        return 'Please check your input and try again.';
      }
    }

    return this.formatSingleMessage(message);
  }

  // Format a single error message
  private static formatSingleMessage(message: string | undefined): string {
    if (!message) {
      return 'Something went wrong. Please try again.';
    }

    // Remove technical details and make messages user-friendly
    const userFriendlyMessages: Record<string, string> = {
      'Validation failed': 'Please check your input and try again',
      'Unauthorized': 'You need to log in to perform this action',
      'Forbidden': 'You do not have permission to perform this action',
      'Not Found': 'The requested information was not found',
      'timeout': 'Request timed out. Please try again',
      'Network Error': 'Please check your internet connection and try again',
    };

    // Check for known error patterns
    for (const [pattern, friendlyMessage] of Object.entries(userFriendlyMessages)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    // If no pattern matches, return a generic message
    return 'Something went wrong. Please try again.';
  }

  // Helper method to validate file types
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not supported. Please use JPEG, PNG, WebP, or GIF.`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds the maximum limit of 5MB.`,
      };
    }

    return { isValid: true };
  }
}