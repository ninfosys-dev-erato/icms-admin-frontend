import { importantLinksRepository } from '../repositories/important-links-repository';
import {
  ImportantLink,
  ImportantLinkListResponse,
  ImportantLinkQuery,
  ImportantLinkStatistics,
  CreateImportantLinkRequest,
  UpdateImportantLinkRequest,
  BulkCreateImportantLinksRequest,
  BulkUpdateImportantLinksRequest,
  ReorderImportantLinksRequest,
  FooterLinks,
} from '../types/important-links';

/**
 * Service layer for Important Links business logic.
 * Handles data transformation, validation, and orchestrates repository calls.
 */
export class ImportantLinksService {
  // ========================================
  // PUBLIC ENDPOINTS
  // ========================================

  /**
   * Get all public important links
   */
  static async getPublicLinks(params?: Partial<ImportantLinkQuery>): Promise<ImportantLink[]> {
    try {
      const response = await importantLinksRepository.getPublicLinks(params);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch public important links:', error);
      throw new Error('Failed to fetch important links');
    }
  }

  /**
   * Get public important links with pagination
   */
  static async getPublicLinksWithPagination(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse> {
    try {
      return await importantLinksRepository.getPublicLinksWithPagination(params);
    } catch (error) {
      console.error('Failed to fetch public important links with pagination:', error);
      throw new Error('Failed to fetch important links');
    }
  }

  /**
   * Get footer links organized by category
   */
  static async getFooterLinks(lang?: string): Promise<FooterLinks> {
    try {
      return await importantLinksRepository.getFooterLinks(lang);
    } catch (error) {
      console.error('Failed to fetch footer links:', error);
      throw new Error('Failed to fetch footer links');
    }
  }

  /**
   * Get active important links
   */
  static async getActiveLinks(lang?: string): Promise<ImportantLink[]> {
    try {
      return await importantLinksRepository.getActiveLinks(lang);
    } catch (error) {
      console.error('Failed to fetch active important links:', error);
      throw new Error('Failed to fetch active links');
    }
  }

  /**
   * Get public important link by ID
   */
  static async getPublicLinkById(id: string, lang?: string): Promise<ImportantLink> {
    try {
      return await importantLinksRepository.getPublicLinkById(id, lang);
    } catch (error) {
      console.error('Failed to fetch public important link:', error);
      throw new Error('Failed to fetch important link');
    }
  }

  // ========================================
  // ADMIN ENDPOINTS
  // ========================================

  /**
   * Get all admin important links
   */
  static async getAdminLinks(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse> {
    try {
      return await importantLinksRepository.getAdminLinks(params);
    } catch (error) {
      console.error('Failed to fetch admin important links:', error);
      throw new Error('Failed to fetch important links');
    }
  }

  /**
   * Get admin important links with pagination
   */
  static async getAdminLinksWithPagination(params?: Partial<ImportantLinkQuery>): Promise<ImportantLinkListResponse> {
    try {
      return await importantLinksRepository.getAdminLinksWithPagination(params);
    } catch (error) {
      console.error('Failed to fetch admin important links with pagination:', error);
      throw new Error('Failed to fetch important links');
    }
  }

  /**
   * Search admin important links
   */
  static async searchAdminLinks(params: Partial<ImportantLinkQuery> & { q: string }): Promise<ImportantLinkListResponse> {
    try {
      return await importantLinksRepository.searchAdminLinks(params);
    } catch (error) {
      console.error('Failed to search admin important links:', error);
      throw new Error('Failed to search important links');
    }
  }

  /**
   * Get admin important link by ID
   */
  static async getAdminLinkById(id: string): Promise<ImportantLink> {
    try {
      return await importantLinksRepository.getAdminLinkById(id);
    } catch (error) {
      console.error('Failed to fetch admin important link:', error);
      throw new Error('Failed to fetch important link');
    }
  }

  /**
   * Create new important link
   */
  static async createLink(data: CreateImportantLinkRequest): Promise<ImportantLink> {
    try {
      // Validate required fields
      if (!data.linkTitle?.en?.trim() && !data.linkTitle?.ne?.trim()) {
        throw new Error('Link title is required in at least one language');
      }

      if (!data.linkUrl?.trim()) {
        throw new Error('Link URL is required');
      }

      // Validate URL format
      try {
        new URL(data.linkUrl);
      } catch {
        throw new Error('Invalid URL format');
      }

      return await importantLinksRepository.createLink(data);
    } catch (error) {
      console.error('Failed to create important link:', error);
      throw error;
    }
  }

  /**
   * Update existing important link
   */
  static async updateLink(id: string, data: UpdateImportantLinkRequest): Promise<ImportantLink> {
    try {
      // Validate URL format if provided
      if (data.linkUrl) {
        try {
          new URL(data.linkUrl);
        } catch {
          throw new Error('Invalid URL format');
        }
      }

      return await importantLinksRepository.updateLink(id, data);
    } catch (error) {
      console.error('Failed to update important link:', error);
      throw error;
    }
  }

  /**
   * Delete important link
   */
  static async deleteLink(id: string): Promise<void> {
    try {
      await importantLinksRepository.deleteLink(id);
    } catch (error) {
      console.error('Failed to delete important link:', error);
      throw new Error('Failed to delete important link');
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Bulk create important links
   */
  static async bulkCreateLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]> {
    try {
      // Validate all links before bulk creation
      for (const link of data.links) {
        if (!link.linkTitle?.en?.trim() && !link.linkTitle?.ne?.trim()) {
          throw new Error('All links must have a title in at least one language');
        }
        if (!link.linkUrl?.trim()) {
          throw new Error('All links must have a URL');
        }
        try {
          new URL(link.linkUrl);
        } catch {
          throw new Error('All links must have valid URLs');
        }
      }

      return await importantLinksRepository.bulkCreateLinks(data);
    } catch (error) {
      console.error('Failed to bulk create important links:', error);
      throw error;
    }
  }

  /**
   * Bulk update important links
   */
  static async bulkUpdateLinks(data: BulkUpdateImportantLinksRequest): Promise<ImportantLink[]> {
    try {
      return await importantLinksRepository.bulkUpdateLinks(data);
    } catch (error) {
      console.error('Failed to bulk update important links:', error);
      throw new Error('Failed to bulk update important links');
    }
  }

  /**
   * Reorder important links
   */
  static async reorderLinks(data: ReorderImportantLinksRequest): Promise<void> {
    try {
      await importantLinksRepository.reorderLinks(data);
    } catch (error) {
      console.error('Failed to reorder important links:', error);
      throw new Error('Failed to reorder important links');
    }
  }

  // ========================================
  // STATISTICS AND EXPORT
  // ========================================

  /**
   * Get important links statistics
   */
  static async getStatistics(): Promise<ImportantLinkStatistics> {
    try {
      return await importantLinksRepository.getStatistics();
    } catch (error) {
      console.error('Failed to fetch important links statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  /**
   * Export all important links
   */
  static async exportLinks(): Promise<ImportantLink[]> {
    try {
      return await importantLinksRepository.exportLinks();
    } catch (error) {
      console.error('Failed to export important links:', error);
      throw new Error('Failed to export important links');
    }
  }

  /**
   * Import important links
   */
  static async importLinks(data: BulkCreateImportantLinksRequest): Promise<ImportantLink[]> {
    try {
      return await importantLinksRepository.importLinks(data);
    } catch (error) {
      console.error('Failed to import important links:', error);
      throw new Error('Failed to import important links');
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get display title for an important link
   */
  static getDisplayTitle(link: ImportantLink): string {
    return link.linkTitle?.en?.trim() || link.linkTitle?.ne?.trim() || 'Untitled Link';
  }

  /**
   * Validate important link data
   */
  static validateLinkData(data: CreateImportantLinkRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.linkTitle?.en?.trim() && !data.linkTitle?.ne?.trim()) {
      errors.push('Link title is required in at least one language');
    }

    if (!data.linkUrl?.trim()) {
      errors.push('Link URL is required');
    } else {
      try {
        new URL(data.linkUrl);
      } catch {
        errors.push('Invalid URL format');
      }
    }

    if (data.order !== undefined && data.order < 0) {
      errors.push('Order must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format URL for display
   */
  static formatUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }
}
