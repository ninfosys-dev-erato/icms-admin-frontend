import { HeaderRepository } from '../repositories/header-repository';
import { 
  HeaderConfig, 
  CreateHeaderRequest, 
  UpdateHeaderRequest, 
  HeaderQuery, 
  HeaderSearchQuery,
  HeaderStatistics,
  LogoUploadData,
  HeaderFormData
} from '../types/header';

export class HeaderService {
  // Temporary development helper - remove this in production
  private static setupDevAuth() {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Check if we already have a token
      const existingToken = localStorage.getItem('auth-token');
      if (!existingToken) {
        // Set a temporary test token for development
        // console.log('🔧 HeaderService: Setting up temporary development authentication');
        localStorage.setItem('auth-token', 'dev-test-token-12345');
        // console.log('🔧 HeaderService: Temporary token set for development');
      }
    }
  }

  // Get all headers with pagination and filters
  static async getHeaders(query?: HeaderQuery): Promise<{
    data: HeaderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.getAll(query);
    } catch (error) {
      // console.error('Failed to fetch headers:', error);
      throw error;
    }
  }

  // Search headers
  static async searchHeaders(query: HeaderSearchQuery): Promise<{
    data: HeaderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.search(query);
    } catch (error) {
      // console.error('Failed to search headers:', error);
      throw error;
    }
  }

  // Get header by ID
  static async getHeaderById(id: string): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.getById(id);
    } catch (error) {
      // console.error(`Failed to fetch header ${id}:`, error);
      throw error;
    }
  }

  // Get header by ID with logo media details (including presigned URLs)
  static async getHeaderByIdWithLogoMedia(id: string): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.getByIdWithLogoMedia(id);
    } catch (error) {
      // console.error(`Failed to fetch header ${id} with logo media:`, error);
      throw error;
    }
  }

  // Create new header
  static async createHeader(data: CreateHeaderRequest): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      console.log('HeaderService.createHeader - incoming data:', data);
      const created = await HeaderRepository.create(data);
      console.log('HeaderService.createHeader - created header:', created);
      return created;
    } catch (error) {
      // console.error('Failed to create header:', error);
      throw error;
    }
  }

  /**
   * Create a header configuration with logo files
   * This follows the correct flow: create header first, then upload logos separately
   */
  static async createHeaderWithLogos(
    headerData: HeaderFormData,
    leftLogoFile?: File,
    rightLogoFile?: File
  ): Promise<HeaderConfig> {
    try {
      console.log('HeaderService.createHeaderWithLogos - starting with headerData:', headerData, { leftLogoFile, rightLogoFile });
      
      // Step 1: Create the header first (without logo files)
      const headerWithoutLogos = { ...headerData };
      
      // Remove logo files from the header data - we'll upload them separately
      if (headerWithoutLogos.logo.leftLogo) {
        headerWithoutLogos.logo.leftLogo = {
          mediaId: '', // Will be set after upload
          altText: headerWithoutLogos.logo.leftLogo.altText,
          width: headerWithoutLogos.logo.leftLogo.width,
          height: headerWithoutLogos.logo.leftLogo.height
        };
      }
      
      if (headerWithoutLogos.logo.rightLogo) {
        headerWithoutLogos.logo.rightLogo = {
          mediaId: '', // Will be set after upload
          altText: headerWithoutLogos.logo.rightLogo.altText,
          width: headerWithoutLogos.logo.rightLogo.width,
          height: headerWithoutLogos.logo.rightLogo.height
        };
      }

      // console.log('🔧 HeaderService: Creating header without logos:', headerWithoutLogos);
      
      // Create the header
  const createdHeader = await HeaderRepository.create(headerWithoutLogos);
  console.log('HeaderService.createHeaderWithLogos - header created (without logos):', createdHeader);

      // Step 2: Upload logos using the correct endpoints (only if files are provided)
      if (leftLogoFile && headerData.logo.leftLogo) {
        try {
          // console.log('🔧 HeaderService: Uploading left logo...');
          
          // Create FormData with the correct structure
          const leftLogoFormData = new FormData();
          leftLogoFormData.append('image', leftLogoFile); // Use 'image' as preferred field
          leftLogoFormData.append('altText[en]', headerData.logo.leftLogo.altText?.en || '');
          leftLogoFormData.append('altText[ne]', headerData.logo.leftLogo.altText?.ne || '');
          leftLogoFormData.append('width', headerData.logo.leftLogo.width?.toString() || '150');
          leftLogoFormData.append('height', headerData.logo.leftLogo.height?.toString() || '50');
          
          // Upload left logo using the correct endpoint
          const leftLogoResult = await HeaderRepository.uploadLeftLogo(createdHeader.id, leftLogoFormData);
          console.log('HeaderService.createHeaderWithLogos - left logo upload result:', leftLogoResult);
        } catch (error) {
          console.error('Left logo upload failed:', error);
          // Continue with right logo even if left fails
        }
      }

      if (rightLogoFile && headerData.logo.rightLogo) {
        try {
          // console.log('🔧 HeaderService: Uploading right logo...');
          
          // Create FormData with the correct structure
          const rightLogoFormData = new FormData();
          rightLogoFormData.append('image', rightLogoFile); // Use 'image' as preferred field
          rightLogoFormData.append('altText[en]', headerData.logo.rightLogo.altText?.en || '');
          rightLogoFormData.append('altText[ne]', headerData.logo.rightLogo.altText?.ne || '');
          rightLogoFormData.append('width', headerData.logo.rightLogo.width?.toString() || '150');
          rightLogoFormData.append('height', headerData.logo.rightLogo.height?.toString() || '50');
          
          // Upload right logo using the correct endpoint
          const rightLogoResult = await HeaderRepository.uploadRightLogo(createdHeader.id, rightLogoFormData);
          console.log('HeaderService.createHeaderWithLogos - right logo upload result:', rightLogoResult);
        } catch (error) {
          // console.error('Right logo upload failed:', error);
          // Continue even if right logo fails
        }
      }

      // Step 3: Return the updated header with logos
      console.log('HeaderService.createHeaderWithLogos - fetching final header with logos...');
      const finalHeader = await HeaderRepository.getById(createdHeader.id);
      console.log('HeaderService.createHeaderWithLogos - final header retrieved:', finalHeader);
      return finalHeader;
    } catch (error) {
      console.error('HeaderService.createHeaderWithLogos - failed:', error);
      throw error;
    }
  }

  // Update header
  static async updateHeader(id: string, data: UpdateHeaderRequest): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      console.log(`HeaderService.updateHeader - updating id: ${id} with data:`, data);
      const updated = await HeaderRepository.update(id, data);
      console.log(`HeaderService.updateHeader - updated header:`, updated);
      return updated;
    } catch (error) {
      // console.error(`Failed to update header ${id}:`, error);
      throw error;
    }
  }

  // Delete header
  static async deleteHeader(id: string): Promise<void> {
    try {
      this.setupDevAuth(); // Temporary development helper
      await HeaderRepository.delete(id);
    } catch (error) {
      // console.error(`Failed to delete header ${id}:`, error);
      throw error;
    }
  }

  // Publish header
  static async publishHeader(id: string): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.publish(id);
    } catch (error) {
      // console.error(`Failed to publish header ${id}:`, error);
      throw error;
    }
  }

  // Unpublish header
  static async unpublishHeader(id: string): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.unpublish(id);
    } catch (error) {
      // console.error(`Failed to unpublish header ${id}:`, error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkPublish(ids: string[]): Promise<{ message: string; results: string[] }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.bulkPublish(ids);
    } catch (error) {
      // console.error('Failed to bulk publish headers:', error);
      throw error;
    }
  }

  static async bulkUnpublish(ids: string[]): Promise<{ message: string; results: string[] }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.bulkUnpublish(ids);
    } catch (error) {
      // console.error('Failed to bulk unpublish headers:', error);
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<{ message: string; results: string[] }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.bulkDelete(ids);
    } catch (error) {
      // console.error('Failed to bulk delete headers:', error);
      throw error;
    }
  }

  // Logo operations
  static async updateLogoMetadata(id: string, logoType: 'left' | 'right', logoData: LogoUploadData): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      if (logoType === 'left') {
        return await HeaderRepository.updateLeftLogo(id, logoData);
      } else {
        return await HeaderRepository.updateRightLogo(id, logoData);
      }
    } catch (error) {
      // console.error(`Failed to update ${logoType} logo metadata for header ${id}:`, error);
      throw error;
    }
  }

  // Remove logo
  static async removeLogo(id: string, logoType: 'left' | 'right'): Promise<HeaderConfig> {
    try {
      this.setupDevAuth(); // Temporary development helper
      if (logoType === 'left') {
        return await HeaderRepository.removeLeftLogo(id);
      } else {
        return await HeaderRepository.removeRightLogo(id);
      }
    } catch (error) {
      // console.error(`Failed to remove ${logoType} logo for header ${id}:`, error);
      throw error;
    }
  }

  // Reorder headers
  static async reorderHeaders(ids: string[]): Promise<{ message: string; results: string[] }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      // This would need to be implemented in the repository if needed
      throw new Error('Header reordering not yet implemented');
    } catch (error) {
      // console.error('Failed to reorder headers:', error);
      throw error;
    }
  }

  // Export headers
  static async exportHeaders(query?: HeaderQuery, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.export(query, format);
    } catch (error) {
      // console.error('Failed to export headers:', error);
      throw error;
    }
  }

  // Import headers
  static async importHeaders(file: File): Promise<{ message: string; results: string[] }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.import(file);
    } catch (error) {
      // console.error('Failed to import headers:', error);
      throw error;
    }
  }

  // Generate CSS
  static async generateCSS(id: string): Promise<{ css: string }> {
    try {
      this.setupDevAuth(); // Temporary development helper
      return await HeaderRepository.generateCSS(id);
    } catch (error) {
      // console.error(`Failed to generate CSS for header ${id}:`, error);
      throw error;
    }
  }

  // Get default header configuration for form initialization
  static getDefaultHeaderConfig() {
    return {
      name: { en: '', ne: '' },
      order: 0,
      isActive: true,
      isPublished: false,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'normal' as const,
        color: '#000000',
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      alignment: 'LEFT' as const,
      logo: {
        leftLogo: undefined,
        rightLogo: undefined,
        logoAlignment: 'left' as const,
        logoSpacing: 10,
      },
      layout: {
        headerHeight: 80,
        backgroundColor: '#ffffff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    };
  }

  // Helper method to get display name from header
  static getDisplayName(header: HeaderConfig): string {
    return header.name?.en || header.name?.ne || 'Header';
  }

  // Helper method for preview functionality (placeholder)
  static async previewHeader(data: CreateHeaderRequest | UpdateHeaderRequest): Promise<{ preview: string }> {
    // Implementation would depend on backend preview endpoint
    // console.log('Preview header:', data);
    return { preview: 'Generated preview' };
  }

  // Private helper method for error handling
  private static handleError(error: unknown, message: string): void {
    // console.error(message, error);
    const errorMessage = error && typeof error === 'object' && 'response' in error && 
                        error.response && typeof error.response === 'object' && 'data' in error.response &&
                        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
                        ? String(error.response.data.message)
                        : message;
    throw new Error(errorMessage);
  }
}




