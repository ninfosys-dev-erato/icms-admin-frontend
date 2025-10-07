import { httpClient } from '@/lib/api/http-client';

export interface BackblazeConfig {
  applicationKeyId: string;
  applicationKey: string;
  bucketName: string;
  bucketId: string;
  endpoint: string;
  region: string;
  customDomain?: string;
  urlExpiration: number;
}

export interface PresignedUrlRequest {
  mediaId: string;
  expiresIn?: number;
  operation?: 'GET' | 'PUT' | 'DELETE';
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  expiresIn: number;
  operation: 'get' | 'put';
  mediaId: string;
  fileName: string;
  contentType: string;
}

export class BackblazeService {
  private static readonly BASE_URL = '/api/v1/media';

  /**
   * Get a presigned URL for media access
   * @param mediaId - The media ID
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Promise<PresignedUrlResponse>
   */
  static async getPresignedUrl(mediaId: string, expiresIn?: number): Promise<PresignedUrlResponse> {
    try {
      const params = new URLSearchParams();
      if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
      }

      const response = await httpClient.get<PresignedUrlResponse>(
        `${this.BASE_URL}/${mediaId}/presigned-url${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to get presigned URL');
      }

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get presigned URL');
      throw error;
    }
  }

  /**
   * Get a presigned URL for uploading files
   * @param fileName - The file name
   * @param contentType - The content type
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Promise<PresignedUrlResponse>
   */
  static async getUploadUrl(fileName: string, contentType: string, expiresIn?: number): Promise<PresignedUrlResponse> {
    try {
      const params = new URLSearchParams();
      params.append('fileName', fileName);
      params.append('contentType', contentType);
      if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
      }

      const response = await httpClient.get<PresignedUrlResponse>(
        `${this.BASE_URL}/upload-url?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to get upload URL');
      }

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get upload URL');
      throw error;
    }
  }

  /**
   * Upload a file directly to Backblaze using presigned URL
   * @param file - The file to upload
   * @param presignedUrl - The presigned URL for upload
   * @returns Promise<void>
   */
  static async uploadFileDirectly(file: File, presignedUrl: string): Promise<void> {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      this.handleError(error, 'Failed to upload file directly');
      throw error;
    }
  }

  /**
   * Check if a media file exists and is accessible
   * @param mediaId - The media ID
   * @returns Promise<boolean>
   */
  static async checkMediaAccess(mediaId: string): Promise<boolean> {
    try {
      const presignedUrl = await this.getPresignedUrl(mediaId, 300); // 5 minutes
      
      const response = await fetch(presignedUrl.presignedUrl, {
        method: 'HEAD',
      });

      return response.ok;
    } catch (error) {
      console.warn('Media access check failed:', error);
      return false;
    }
  }

  /**
   * Get media URL with fallback options
   * @param mediaId - The media ID
   * @param options - Options for URL generation
   * @returns Promise<string>
   */
  static async getMediaUrlWithFallback(
    mediaId: string, 
    options: { 
      preferPresigned?: boolean; 
      expiresIn?: number; 
      fallbackToDirect?: boolean;
    } = {}
  ): Promise<string> {
    const { preferPresigned = true, expiresIn = 3600, fallbackToDirect = true } = options;

    try {
      if (preferPresigned) {
        const presignedResponse = await this.getPresignedUrl(mediaId, expiresIn);
        return presignedResponse.presignedUrl;
      }
    } catch (error) {
      console.warn('Failed to get presigned URL:', error);
      
      if (fallbackToDirect) {
        try {
          // Fallback to direct URL from media service
          const response = await httpClient.get<{ url: string }>(`${this.BASE_URL}/${mediaId}`);
          if (response.success && response.data) {
            return response.data.url;
          }
        } catch (fallbackError) {
          console.warn('Failed to get direct URL:', fallbackError);
        }
      }
    }

    throw new Error('Failed to get media URL');
  }

  /**
   * Validate Backblaze configuration
   * @returns Promise<boolean>
   */
  static async validateConfiguration(): Promise<boolean> {
    try {
      const response = await httpClient.get<{ configured: boolean }>('/api/v1/media/backblaze/status');
      return response.success && response.data?.configured === true;
    } catch (error) {
      console.warn('Backblaze configuration validation failed:', error);
      return false;
    }
  }

  // Helper method to handle errors
  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`BackblazeService Error: ${defaultMessage}`, error);
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
      'Access Denied': 'You do not have permission to access this file',
      'NoSuchKey': 'The requested file was not found',
      'InvalidAccessKeyId': 'Invalid access credentials',
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
} 