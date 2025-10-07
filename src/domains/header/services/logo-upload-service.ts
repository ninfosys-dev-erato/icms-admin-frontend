import { httpClient } from '@/lib/api/http-client';
import { LogoItem } from '../types/header';

export interface LogoUploadData {
  logo: File;
  altText?: {
    en?: string;
    ne?: string;
  };
  width?: number;
  height?: number;
}

export interface LogoUploadResponse {
  success: boolean;
  data?: LogoItem;
  message?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  data?: {
    id: string;
    fileName: string;
    originalName: string;
    url: string;
    presignedUrl?: string;
    size: number;
    contentType: string;
  };
  message?: string;
}

export class LogoUploadService {
  /**
   * Upload a logo file to the media service and return the mediaId
   */
  static async uploadLogoToMedia(
    file: File,
    altText?: { en?: string; ne?: string }
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'logos'); // Store logos in logos folder
      
      if (altText?.en) {
        formData.append('altText', altText.en);
      }
      if (altText?.ne) {
        formData.append('altText', altText.ne);
      }

      const response = await httpClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return the mediaId from the response
      return response.data.id;
    } catch (error: any) {
      // console.error('Logo upload to media service failed:', error);
      throw new Error(error.response?.data?.message || 'Logo upload to media service failed');
    }
  }

  /**
   * Upload a logo file for a header configuration using the correct endpoint
   * This follows the proper flow: upload to media first, then reference by mediaId
   */
  static async uploadLogo(
    headerId: string,
    logoType: 'left' | 'right',
    uploadData: LogoUploadData
  ): Promise<LogoUploadResponse> {
    try {
      // Step 1: Upload the logo file to the media service first
      const mediaId = await this.uploadLogoToMedia(uploadData.logo, uploadData.altText);
      
      // Step 2: Now create the logo object with the mediaId reference
      const logoData = {
        mediaId: mediaId,
        altText: uploadData.altText || { en: '', ne: '' },
        width: uploadData.width || 150,
        height: uploadData.height || 50
      };

      // Step 3: Update the header with the logo reference using the correct endpoint
      const response = await httpClient.put(
        `/admin/header-configs/${headerId}/logo/${logoType}`,
        logoData
      );

      return {
        success: true,
        data: response.data as any,
        message: 'Logo uploaded successfully'
      };
    } catch (error: any) {
      // console.error('Logo upload failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Logo upload failed'
      };
    }
  }

  /**
   * Upload logo file directly to header using the correct upload endpoint
   */
  static async uploadLogoFile(
    headerId: string,
    logoType: 'left' | 'right',
    file: File,
    logoData: LogoUploadData
  ): Promise<LogoUploadResponse> {
    try {
      const formData = new FormData();
      
      // Add logo file
      formData.append('logo', file);
      
      // Add logo metadata
      if (logoData.altText?.en) formData.append('altText[en]', logoData.altText.en);
      if (logoData.altText?.ne) formData.append('altText[ne]', logoData.altText.ne);
      if (logoData.width) formData.append('width', logoData.width.toString());
      if (logoData.height) formData.append('height', logoData.height.toString());

      // Use the correct upload endpoint for files
      const response = await httpClient.post(
        `/admin/header-configs/${headerId}/logo/${logoType}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data as any,
        message: 'Logo file uploaded successfully'
      };
    } catch (error: any) {
      // console.error('Logo file upload failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Logo file upload failed'
      };
    }
  }

  /**
   * Update logo metadata without file upload using the correct endpoint
   */
  static async updateLogoMetadata(
    headerId: string,
    logoType: 'left' | 'right',
    logoData: LogoUploadData
  ): Promise<LogoUploadResponse> {
    try {
      const metadata = {
        altText: logoData.altText || { en: '', ne: '' },
        width: logoData.width || 150,
        height: logoData.height || 50
      };

      // Use the correct endpoint for metadata updates
      const response = await httpClient.put(
        `/admin/header-configs/${headerId}/logo/${logoType}`,
        metadata
      );

      return {
        success: true,
        data: response.data as any,
        message: 'Logo metadata updated successfully'
      };
    } catch (error: any) {
      // console.error('Logo metadata update failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Logo metadata update failed'
      };
    }
  }

  /**
   * Remove a logo from a header configuration
   */
  static async removeLogo(
    headerId: string,
    logoType: 'left' | 'right'
  ): Promise<LogoUploadResponse> {
    try {
      await httpClient.delete(`/admin/header-configs/${headerId}/logo/${logoType}`);

      return {
        success: true,
        message: 'Logo removed successfully'
      };
    } catch (error: any) {
      // console.error('Logo removal failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Logo removal failed'
      };
    }
  }
}
