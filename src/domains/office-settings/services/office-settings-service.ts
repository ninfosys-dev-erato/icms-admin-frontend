import { httpClient } from '@/lib/api/http-client';
import {
  OfficeSettings,
  CreateOfficeSettingsRequest,
  UpdateOfficeSettingsRequest,
  OfficeSettingsSeo,
} from '../types/office-settings';

export class OfficeSettingsService {
  private static readonly BASE_URL = '/office-settings';

  // Get office settings (public)
  static async getSettings(lang?: string): Promise<OfficeSettings | null> {
    try {
      const url = lang ? `${this.BASE_URL}?lang=${lang}` : this.BASE_URL;
      const response = await httpClient.get<OfficeSettings>(url);
      
      // Check if this is a "not found" error (which is expected when no settings exist)
      if (response.error?.code === 'NOT_FOUND_ERROR' || 
          (typeof response.error?.message === 'string' && response.error.message.includes('not found')) ||
          (!response.success && typeof response.error?.message === 'string' && response.error.message.includes('404'))) {
        return null; // Return null instead of throwing error
      }
      
      if (!response.success || !response.data) {
        // Check if there's a specific error message from the backend
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to load office settings');
      }
      
      // Resolve background photo URL if backgroundPhotoId exists
      const enhancedData = await this.enhanceWithMediaUrl(response.data);
      
      return enhancedData;
    } catch (error) {
      // Check if this is specifically a 404 error from the catch block
      const errorObj = error as { 
        response?: { 
          status?: number;
          data?: { error?: { message: string } }; 
        }; 
        message?: string 
      };
      
      // If it's a 404, return null instead of throwing
      if (errorObj.response?.status === 404) {
        return null;
      }
      
      this.handleError(error, 'Failed to load office settings');
      throw error;
    }
  }

  // Get office settings by ID (admin only)
  static async getSettingsById(id: string): Promise<OfficeSettings> {
    try {
      const response = await httpClient.get<OfficeSettings>(`${this.BASE_URL}/${id}`);
      
      if (!response.success || !response.data) {
        // Check if there's a specific error message from the backend
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Office settings not found');
      }
      
      // Resolve background photo URL if backgroundPhotoId exists
      const enhancedData = await this.enhanceWithMediaUrl(response.data);
      
      return enhancedData;
    } catch (error) {
      this.handleError(error, 'Failed to load office settings');
      throw error;
    }
  }

  // Get office settings for SEO (public)
  static async getSettingsSeo(): Promise<OfficeSettingsSeo> {
    try {
      const response = await httpClient.get<OfficeSettingsSeo>(`${this.BASE_URL}/seo`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to load SEO settings');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to load SEO settings');
      throw error;
    }
  }

  // Create office settings (admin only)
  static async createSettings(data: CreateOfficeSettingsRequest): Promise<OfficeSettings> {
    try {
      const response = await httpClient.post<OfficeSettings>(this.BASE_URL, data);
      
      if (!response.success || !response.data) {
        // Check if there's a specific error message from the backend
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to create office settings');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create office settings');
      throw error;
    }
  }

  // Update office settings (admin only)
  static async updateSettings(id: string, data: UpdateOfficeSettingsRequest): Promise<OfficeSettings> {
    try {
      const response = await httpClient.put<OfficeSettings>(`${this.BASE_URL}/${id}`, data);
      
      if (!response.success || !response.data) {
        // Check if there's a specific error message from the backend
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to update office settings');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to update office settings');
      throw error;
    }
  }

  // Upsert office settings (admin only)
  static async upsertSettings(data: CreateOfficeSettingsRequest): Promise<OfficeSettings> {
    try {
      const response = await httpClient.put<OfficeSettings>(`${this.BASE_URL}/upsert`, data);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to save office settings');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to save office settings');
      throw error;
    }
  }

  // Delete office settings (admin only)
  static async deleteSettings(id: string): Promise<void> {
    try {
      const response = await httpClient.delete(`${this.BASE_URL}/${id}`);
      
      if (!response.success) {
        // Check if there's a specific error message from the backend
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to delete office settings');
      }
    } catch (error) {
      this.handleError(error, 'Failed to delete office settings');
      throw error;
    }
  }

  // Upload background photo (admin only)
  static async uploadBackgroundPhoto(id: string, file: File): Promise<OfficeSettings> {
    try {
      // Use the dedicated backend endpoint that handles both media upload and office settings update
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await httpClient.post<OfficeSettings>(
        `${this.BASE_URL}/${id}/background-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for file uploads
        }
      );

      if (!response.success || !response.data) {
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to upload background photo');
      }

      // The backend handles both media upload and office settings update
      // Returns updated office settings with fresh presigned URL
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to upload background photo');
      throw error;
    }
  }

  // Remove background photo (admin only)
  static async removeBackgroundPhoto(id: string): Promise<OfficeSettings> {
    try {
      // Use the dedicated endpoint for removing background photo
      const response = await httpClient.delete<OfficeSettings>(
        `${this.BASE_URL}/${id}/background-photo`
      );

      if (!response.success || !response.data) {
        if (response.error?.message) {
          throw new Error(this.formatErrorMessage(response.error.message));
        }
        throw new Error('Failed to remove background photo');
      }

      // The backend handles both clearing backgroundPhotoId and deleting the media file
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to remove background photo');
      throw error;
    }
  }

  // Helper method to enhance office settings with media URL
  private static async enhanceWithMediaUrl(settings: OfficeSettings): Promise<OfficeSettings> {
    // The backend now automatically returns presigned URLs in backgroundPhoto field
    // No need for complex URL extraction or enhancement logic
    
    return settings;
  }

  // Helper method to handle errors with decent messages
  private static handleError(error: unknown, defaultMessage: string): void {
    const errorObj = error as { 
      response?: { 
        data?: { error?: { message: string | string[] } }; 
        status?: number 
      }; 
      message?: string 
    };
    
    // Check if this is an API response error (from our service)
    if (errorObj.response?.data?.error?.message) {
      // Use backend error message if available
      (error as Error).message = this.formatErrorMessage(errorObj.response.data.error.message);
    } else if (errorObj.response?.status) {
      // Handle HTTP status codes
      (error as Error).message = this.getStatusErrorMessage(errorObj.response.status, defaultMessage);
    } else if (errorObj.message && errorObj.message !== defaultMessage) {
      // Use existing error message if it's not the default
      (error as Error).message = this.formatErrorMessage(errorObj.message);
    } else {
      // Use default message
      (error as Error).message = this.formatErrorMessage(defaultMessage);
    }
  }

  // Format error messages to be user-friendly
  private static formatErrorMessage(message: string | string[] | undefined): string {
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

  // Get user-friendly messages for HTTP status codes
  private static getStatusErrorMessage(status: number, defaultMessage: string): string {
    const statusMessages: Record<number, string> = {
      400: 'Please check your input and try again',
      401: 'You need to log in to perform this action',
      403: 'You do not have permission to perform this action',
      404: 'The requested information was not found',
      409: 'This information already exists',
      422: 'Please check your input and try again',
      500: 'Server error. Please try again later',
      502: 'Service temporarily unavailable',
      503: 'Service temporarily unavailable',
      504: 'Request timed out. Please try again',
    };

    return statusMessages[status] || defaultMessage;
  }
} 