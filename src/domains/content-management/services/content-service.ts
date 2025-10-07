import { contentRepository } from '../repositories/content-repository';
import { 
  Content, 
  ContentListResponse, 
  ContentQuery, 
  ContentStatistics, 
  ContentFormData,
  CreateContentRequest,
  UpdateContentRequest,
  BulkOperationResult,
  Category
} from '../types/content';
import { ContentNotificationService } from './content-notification-service';

export class ContentService {

  // ========================================
  // LIST OPERATIONS
  // ========================================

  static async getContents(query: ContentQuery = {}): Promise<ContentListResponse> {
    try {
      const response = await contentRepository.getAdminContents(query);
      return this.normalizeListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to fetch contents');
      throw error;
    }
  }

  static async searchContents(searchTerm: string, query: ContentQuery = {}): Promise<ContentListResponse> {
    try {
      const response = await contentRepository.searchAdminContents({ ...query, search: searchTerm });
      return this.normalizeListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to search contents');
      throw error;
    }
  }

  static async getPublicContents(query: ContentQuery = {}): Promise<ContentListResponse> {
    try {
      const response = await contentRepository.getPublicContents();
      const contents = Array.isArray(response) ? response.map(this.transformBackendContent) : [];
      return this.normalizeListResponse(contents, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to fetch public contents');
      throw error;
    }
  }

  static async searchPublicContent(searchTerm: string, options: {
    lang?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ContentListResponse> {
    try {
      // For now, return empty response - implement when backend is ready
      return {
        data: [],
        pagination: {
          page: options.page || 1,
          limit: options.limit || 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to search public content');
      throw error;
    }
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  static async getContentById(id: string): Promise<Content> {
    try {
      const response = await contentRepository.getById(id);
      return this.transformBackendContent(response);
    } catch (error) {
      this.handleError(error, 'Failed to fetch content');
      throw error;
    }
  }

  static async getAdminContentById(id: string): Promise<Content> {
    try {
      const response = await contentRepository.getById(id);
      return this.transformBackendContent(response);
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin content');
      throw error;
    }
  }

  static async createContent(data: CreateContentRequest): Promise<Content> {
    try {
      const response = await contentRepository.create(data);
      return this.transformBackendContent(response);
    } catch (error) {
      this.handleError(error, 'Failed to create content');
      throw error;
    }
  }

  static async updateContent(id: string, data: UpdateContentRequest): Promise<Content> {
    try {
      const response = await contentRepository.update(id, data);
      const raw = this.extractContentFromResponse(response);
      if (!this.isContentLike(raw)) {
        // Some backends return 200/204 without body; fetch the latest state explicitly
        const latest = await contentRepository.getById(id);
        return this.transformBackendContent(this.extractContentFromResponse(latest) ?? latest);
      }
      return this.transformBackendContent(raw);
    } catch (error) {
      this.handleError(error, 'Failed to update content');
      throw error;
    }
  }

  static async deleteContent(id: string): Promise<void> {
    try {
      await contentRepository.delete(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete content');
      throw error;
    }
  }

  static async bulkDeleteContent(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkDelete(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete contents');
      throw error;
    }
  }

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  static async publishContent(id: string): Promise<Content> {
    try {
      const response = await contentRepository.publish(id);
      const raw = this.extractContentFromResponse(response);
      if (!this.isContentLike(raw)) {
        const latest = await contentRepository.getById(id);
        return this.transformBackendContent(this.extractContentFromResponse(latest) ?? latest);
      }
      return this.transformBackendContent(raw);
    } catch (error) {
      this.handleError(error, 'Failed to publish content');
      throw error;
    }
  }

  static async unpublishContent(id: string): Promise<Content> {
    try {
      const response = await contentRepository.unpublish(id);
      const raw = this.extractContentFromResponse(response);
      if (!this.isContentLike(raw)) {
        const latest = await contentRepository.getById(id);
        return this.transformBackendContent(this.extractContentFromResponse(latest) ?? latest);
      }
      return this.transformBackendContent(raw);
    } catch (error) {
      this.handleError(error, 'Failed to unpublish content');
      throw error;
    }
  }

  static async updateContentStatus(id: string, status: string): Promise<Content> {
    try {
      const response = await contentRepository.updateStatus(id, status);
      const raw = this.extractContentFromResponse(response);
      if (!this.isContentLike(raw)) {
        const latest = await contentRepository.getById(id);
        return this.transformBackendContent(this.extractContentFromResponse(latest) ?? latest);
      }
      return this.transformBackendContent(raw);
    } catch (error) {
      this.handleError(error, 'Failed to update content status');
      throw error;
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async bulkPublish(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkPublish(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk publish contents');
      throw error;
    }
  }

  static async bulkUnpublish(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkUnpublish(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk unpublish contents');
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkDelete(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete contents');
      throw error;
    }
  }

  static async bulkUpdate(operations: Array<{ id: string; operation: string; data?: Record<string, unknown> }>): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkUpdate(operations);
    } catch (error) {
      this.handleError(error, 'Failed to bulk update contents');
      throw error;
    }
  }

  static async bulkUpdateContent(operations: Array<{ id: string; operation: string; data?: any }>): Promise<BulkOperationResult> {
    try {
      return await contentRepository.bulkUpdate(operations);
    } catch (error) {
      this.handleError(error, 'Failed to bulk update contents');
      throw error;
    }
  }

  // ========================================
  // ANALYTICS
  // ========================================

  static async getStatistics(): Promise<ContentStatistics> {
    try {
      const response = await contentRepository.getStatistics();
      return response;
    } catch (error) {
      this.handleError(error, 'Failed to fetch statistics');
      throw error;
    }
  }

  static async getContentStatistics(): Promise<ContentStatistics> {
    try {
      const response = await contentRepository.getStatistics();
      return response;
    } catch (error) {
      this.handleError(error, 'Failed to fetch content statistics');
      throw error;
    }
  }

  // ========================================
  // CATEGORY OPERATIONS
  // ========================================

  static async getPublicCategories(lang?: string): Promise<Category[]> {
    try {
      // For now, return empty array - implement when backend is ready
      return [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch public categories');
      throw error;
    }
  }

  static async getPublicCategoryById(id: string, lang?: string): Promise<Category> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Public category by ID not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to fetch public category');
      throw error;
    }
  }

  static async getCategoryTree(lang?: string): Promise<Category[]> {
    try {
      // For now, return empty array - implement when backend is ready
      return [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch category tree');
      throw error;
    }
  }

  static async getAdminCategories(query: any = {}): Promise<any> {
    try {
      // For now, return empty response - implement when backend is ready
      return {
        data: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin categories');
      throw error;
    }
  }

  static async getAdminCategoryById(id: string): Promise<Category> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Admin category by ID not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to fetch admin category');
      throw error;
    }
  }

  static async createCategory(data: any): Promise<Category> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Create category not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to create category');
      throw error;
    }
  }

  static async updateCategory(id: string, data: any): Promise<Category> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Update category not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to update category');
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Delete category not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to delete category');
      throw error;
    }
  }

  static async bulkCreateCategories(categories: any[]): Promise<any> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Bulk create categories not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to bulk create categories');
      throw error;
    }
  }

  static async bulkUpdateCategories(operations: any[]): Promise<any> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Bulk update categories not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to bulk update categories');
      throw error;
    }
  }

  static async bulkDeleteCategories(ids: string[]): Promise<any> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Bulk delete categories not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete categories');
      throw error;
    }
  }

  static async importContent(data: any): Promise<any> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Import content not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to import content');
      throw error;
    }
  }

  static async exportContent(exportOptions: { format?: string; categoryId?: string; status?: string }): Promise<any> {
    try {
      // For now, throw error - implement when backend is ready
      throw new Error('Export content not implemented yet');
    } catch (error) {
      this.handleError(error, 'Failed to export content');
      throw error;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Compute a human-friendly content title with sensible fallbacks.
   * Prefers English, then Nepali, then a generic label.
   */
  static getDisplayTitle(content: Content | null | undefined): string {
    if (!content) return 'Untitled';
    const titleEn = content.title?.en?.trim();
    const titleNe = content.title?.ne?.trim();
    if (titleEn) return titleEn;
    if (titleNe) return titleNe;
    return 'Untitled';
  }

  static getCategoryDisplayName(category: any | null | undefined): string {
    if (!category) return 'Untitled Category';
    const nameEn = category.name?.en?.trim();
    const nameNe = category.name?.ne?.trim();
    if (nameEn) return nameEn;
    if (nameNe) return nameNe;
    return 'Untitled Category';
  }

  private static normalizeListResponse(response: any, fallback: { page: number; limit: number }) {
    console.log('🔍 normalizeListResponse called with:', response);
    
    if (!response) {
      console.log('🔍 Response is null/undefined, returning empty');
      return {
        data: [],
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    // Handle different response formats
    if (response.data && response.pagination) {
      console.log('🔍 Found data and pagination, processing:', response.data);
      return {
        data: Array.isArray(response.data) ? response.data.map(this.transformBackendContent) : [],
        pagination: response.pagination
      };
    }

    // Handle nested response format from backend (data.data and data.pagination)
    if (response.data && response.data.data && response.data.pagination) {
      console.log('🔍 Found nested data and pagination, processing:', response.data.data);
      return {
        data: Array.isArray(response.data.data) ? response.data.data.map(this.transformBackendContent) : [],
        pagination: response.data.pagination
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response.map(this.transformBackendContent),
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: response.length,
          totalPages: Math.ceil(response.length / fallback.limit),
          hasNext: false,
          hasPrev: false
        }
      };
    }

    // Single item response
    return {
      data: [this.transformBackendContent(response)],
      pagination: {
        page: fallback.page,
        limit: fallback.limit,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  /** Try to extract a content-like object from a backend response that may wrap data */
  private static extractContentFromResponse(response: any): any | null {
    if (!response) return null;
    // Common patterns: { data: content }, content directly
    const candidate = response.data ?? response;
    return candidate ?? null;
  }

  /** Minimal check for a content-like object */
  private static isContentLike(value: any): boolean {
    if (!value || typeof value !== 'object') return false;
    // Accept if it has id/_id or at least known fields
    if (value.id || value._id) return true;
    if ('title' in value || 'content' in value || 'slug' in value) return true;
    return false;
  }

  static transformBackendCategory(backendCategory: any): any {
    if (!backendCategory) {
      return undefined;
    }

    return {
      id: backendCategory.id || backendCategory._id || '',
      name: backendCategory.name || { en: '', ne: '' },
      slug: backendCategory.slug || '',
      description: backendCategory.description || undefined,
      parentId: backendCategory.parentId || undefined,
      parent: backendCategory.parent || undefined,
      children: backendCategory.children || [],
      level: backendCategory.level || 0,
      order: backendCategory.order || 0,
      isActive: backendCategory.isActive ?? true,
      icon: backendCategory.icon || undefined,
      color: backendCategory.color || undefined,
      createdAt: backendCategory.createdAt ? new Date(backendCategory.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: backendCategory.updatedAt ? new Date(backendCategory.updatedAt).toISOString() : new Date().toISOString(),
      contentCount: backendCategory.contentCount || 0,
    };
  }

  private static transformBackendContent(backendContent: any): Content {
    if (!backendContent) {
      throw new Error('Invalid content data received from backend');
    }

    // Debug: Log the incoming data structure
    console.log('🔍 Backend content received:', backendContent);
    console.log('🔍 Title:', backendContent.title);
    console.log('🔍 Slug:', backendContent.slug);
    console.log('🔍 Category:', backendContent.category);

    // The backend already sends data in the correct format
    // Just ensure the fields exist and have proper fallbacks
    const title = backendContent.title || { en: '', ne: '' };
    const content = backendContent.content || { en: '', ne: '' };
    const excerpt = backendContent.excerpt || { en: '', ne: '' };

    return {
      id: backendContent.id || backendContent._id || '',
      title,
      slug: backendContent.slug || '',
      excerpt,
      content,
      categoryId: backendContent.categoryId || '',
      tags: backendContent.tags || [],
      priority: backendContent.priority || 0,
      status: backendContent.status || 'DRAFT',
      visibility: backendContent.visibility || 'public',
      featured: backendContent.featured ?? false,
      order: backendContent.order || 0,
      featuredImageId: backendContent.featuredImageId || undefined,
      additionalMedia: backendContent.additionalMedia || [],
      attachments: backendContent.attachments || [],
      authorId: backendContent.authorId || backendContent.createdBy?.id || '',
      seoTitle: backendContent.seoTitle || { en: '', ne: '' },
      seoDescription: backendContent.seoDescription || { en: '', ne: '' },
      seoKeywords: backendContent.seoKeywords || [],
      publishedAt: backendContent.publishedAt || undefined,
      expiresAt: backendContent.expiresAt || undefined,
      createdAt: backendContent.createdAt ? new Date(backendContent.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: backendContent.updatedAt ? new Date(backendContent.updatedAt).toISOString() : new Date().toISOString(),
      viewCount: backendContent.viewCount || 0,
      likeCount: backendContent.likeCount || 0,
      shareCount: backendContent.shareCount || 0,
      // Preserve additional fields that might exist
      ...(backendContent.category && { category: ContentService.transformBackendCategory(backendContent.category) }),
      ...(backendContent.featuredImage && { featuredImage: backendContent.featuredImage }),
      ...(backendContent.author && { author: backendContent.author }),
      // Map createdBy to author for API compatibility
      ...(backendContent.createdBy && { author: backendContent.createdBy }),
      // Also preserve createdBy and updatedBy if they exist
      ...(backendContent.createdBy && { createdBy: backendContent.createdBy }),
      ...(backendContent.updatedBy && { updatedBy: backendContent.updatedBy }),
    };
  }

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`ContentService Error: ${defaultMessage}`, error);
    
    // Extract error details for better user feedback
    let errorMessage = defaultMessage;
    let isSlugConflict = false;
    
    if (error && typeof error === 'object' && 'data' in error) {
      const errorData = (error as any).data;
      if (errorData && typeof errorData === 'object') {
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
          isSlugConflict = errorData.error.message.includes('slug already exists');
        }
      }
    }
    
    // Show appropriate notification based on error type
    if (isSlugConflict) {
      ContentNotificationService.showContentCreationError('A content with this slug already exists. Please choose a different slug.');
    } else {
      ContentNotificationService.showContentCreationError(errorMessage);
    }
    
    if (error instanceof Error) {
      throw new Error(`${defaultMessage}: ${error.message}`);
    }
    
    throw new Error(defaultMessage);
  }
}