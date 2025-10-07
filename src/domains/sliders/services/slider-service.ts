import { sliderRepository } from '../repositories/slider-repository';
import { 
  Slider, 
  SliderListResponse, 
  SliderQuery, 
  SliderStatistics, 
  SliderAnalytics, 
  SliderFormData,
  CreateSliderRequest,
  UpdateSliderRequest,
  BulkOperationResult
} from '../types/slider';

export class SliderService {

  // ========================================
  // LIST OPERATIONS
  // ========================================

  static async getSliders(query: SliderQuery = {}): Promise<SliderListResponse> {
    try {
      const response = await sliderRepository.getAdminSliders(query);
      return this.normalizeListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to fetch sliders');
      throw error;
    }
  }

  static async searchSliders(searchTerm: string, query: SliderQuery = {}): Promise<SliderListResponse> {
    try {
      const response = await sliderRepository.searchAdminSliders({ ...query, search: searchTerm });
      return this.normalizeListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to search sliders');
      throw error;
    }
  }

  static async getPublicSliders(): Promise<Slider[]> {
    try {
      const response = await sliderRepository.getPublicSliders();
      return Array.isArray(response) ? response.map(this.transformBackendSlider) : [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch public sliders');
      throw error;
    }
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  static async getSliderById(id: string): Promise<Slider> {
    try {
      const response = await sliderRepository.getById(id);
      return this.transformBackendSlider(response);
    } catch (error) {
      this.handleError(error, 'Failed to fetch slider');
      throw error;
    }
  }

  static async createSlider(data: CreateSliderRequest): Promise<Slider> {
    try {
      const response = await sliderRepository.create(data);
      return this.transformBackendSlider(response);
    } catch (error) {
      this.handleError(error, 'Failed to create slider');
      throw error;
    }
  }

  static async updateSlider(id: string, data: UpdateSliderRequest): Promise<Slider> {
    try {
      const response = await sliderRepository.update(id, data);
      const raw = this.extractSliderFromResponse(response);
      if (!this.isSliderLike(raw)) {
        // Some backends return 200/204 without body; fetch the latest state explicitly
        const latest = await sliderRepository.getById(id);
        return this.transformBackendSlider(this.extractSliderFromResponse(latest) ?? latest);
      }
      console.log("Ghintag", raw, this.transformBackendSlider(raw))
      return this.transformBackendSlider(raw);
    } catch (error) {
      this.handleError(error, 'Failed to update slider');
      throw error;
    }
  }

  static async deleteSlider(id: string): Promise<void> {
    try {
      await sliderRepository.delete(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete slider');
      throw error;
    }
  }

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  static async publishSlider(id: string): Promise<Slider> {
    try {
      const response = await sliderRepository.publish(id);
      const raw = this.extractSliderFromResponse(response);
      if (!this.isSliderLike(raw)) {
        const latest = await sliderRepository.getById(id);
        return this.transformBackendSlider(this.extractSliderFromResponse(latest) ?? latest);
      }
      return this.transformBackendSlider(raw);
    } catch (error) {
      this.handleError(error, 'Failed to publish slider');
      throw error;
    }
  }

  static async unpublishSlider(id: string): Promise<Slider> {
    try {
      const response = await sliderRepository.unpublish(id);
      const raw = this.extractSliderFromResponse(response);
      if (!this.isSliderLike(raw)) {
        const latest = await sliderRepository.getById(id);
        return this.transformBackendSlider(this.extractSliderFromResponse(latest) ?? latest);
      }
      return this.transformBackendSlider(raw);
    } catch (error) {
      this.handleError(error, 'Failed to unpublish slider');
      throw error;
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async bulkPublish(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await sliderRepository.bulkPublish(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk publish sliders');
      throw error;
    }
  }

  static async bulkUnpublish(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await sliderRepository.bulkUnpublish(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk unpublish sliders');
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await sliderRepository.bulkDelete(ids);
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete sliders');
      throw error;
    }
  }

  static async reorderSliders(orders: { id: string; position: number }[]): Promise<void> {
    try {
      await sliderRepository.reorder(orders);
    } catch (error) {
      this.handleError(error, 'Failed to reorder sliders');
      throw error;
    }
  }

  // ========================================
  // MEDIA OPERATIONS
  // ========================================

  static async uploadSliderImage(id: string, file: File): Promise<Slider> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await sliderRepository.uploadImage(id, formData);
      const raw = this.extractSliderFromResponse(response);
      if (!this.isSliderLike(raw)) {
        const latest = await sliderRepository.getById(id);
        return this.transformBackendSlider(this.extractSliderFromResponse(latest) ?? latest);
      }
      return this.transformBackendSlider(raw);
    } catch (error) {
      this.handleError(error, 'Failed to upload slider image');
      throw error;
    }
  }

  static async removeSliderImage(id: string): Promise<Slider> {
    try {
      const response = await sliderRepository.removeImage(id);
      const raw = this.extractSliderFromResponse(response);
      if (!this.isSliderLike(raw)) {
        const latest = await sliderRepository.getById(id);
        return this.transformBackendSlider(this.extractSliderFromResponse(latest) ?? latest);
      }
      return this.transformBackendSlider(raw);
    } catch (error) {
      this.handleError(error, 'Failed to remove slider image');
      throw error;
    }
  }

  static async createSliderWithImage(file: File, data: SliderFormData): Promise<Slider> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add form data fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'title') {
          formData.append('title[en]', value.en || '');
          formData.append('title[ne]', value.ne || '');
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await sliderRepository.createWithImage(formData);
      return this.transformBackendSlider(response);
    } catch (error) {
      this.handleError(error, 'Failed to create slider with image');
      throw error;
    }
  }

  // ========================================
  // ANALYTICS
  // ========================================

  static async getStatistics(): Promise<SliderStatistics> {
    try {
      const response = await sliderRepository.getStatistics();
      return response;
    } catch (error) {
      this.handleError(error, 'Failed to fetch statistics');
      throw error;
    }
  }

  static async getSliderAnalytics(
    id: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<SliderAnalytics> {
    try {
      const params = {
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString()
      };
      const response = await sliderRepository.getAnalytics(id, params);
      return response;
    } catch (error) {
      this.handleError(error, 'Failed to fetch analytics');
      throw error;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Compute a human-friendly slider title with sensible fallbacks.
   * Prefers English, then Nepali, then media/original names, else a generic label.
   */
  static getDisplayTitle(slider: Slider | null | undefined): string {
    if (!slider) return 'Untitled';
    const titleEn = slider.title?.en?.trim();
    const titleNe = slider.title?.ne?.trim();
    if (titleEn) return titleEn;
    if (titleNe) return titleNe;
    const mediaName = slider.media?.originalName || slider.media?.fileName;
    if (mediaName) return mediaName;
    const fileName = slider.originalName || slider.fileName;
    if (fileName) return fileName;
    return 'Untitled';
  }

  private static normalizeListResponse(response: any, fallback: { page: number; limit: number }) {
    if (!response) {
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
      return {
        data: Array.isArray(response.data) ? response.data.map(this.transformBackendSlider) : [],
        pagination: response.pagination
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response.map(this.transformBackendSlider),
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
      data: [this.transformBackendSlider(response)],
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

  /** Try to extract a slider-like object from a backend response that may wrap data */
  private static extractSliderFromResponse(response: any): any | null {
    if (!response) return null;
    // Common patterns: { data: slider }, slider directly
    const candidate = response.data ?? response;
    return candidate ?? null;
  }

  /** Minimal check for a slider-like object */
  private static isSliderLike(value: any): boolean {
    if (!value || typeof value !== 'object') return false;
    // Accept if it has id/_id or at least known fields
    if (value.id || value._id) return true;
    if ('position' in value || 'displayTime' in value || 'title' in value) return true;
    return false;
  }

  private static transformBackendSlider(backendSlider: any): Slider {
    if (!backendSlider) {
      throw new Error('Invalid slider data received from backend');
    }

    // Normalize title to TranslatableEntity
    const title: any = (() => {
      const rawTitle = backendSlider.title;
      const titleEn = backendSlider.titleEn || backendSlider.title_en;
      const titleNe = backendSlider.titleNe || backendSlider.title_ne;
      const name = backendSlider.name;

      if (rawTitle && typeof rawTitle === 'object') {
        // Already a map of languages
        return {
          en: (rawTitle.en ?? titleEn ?? name ?? '').toString(),
          ne: (rawTitle.ne ?? titleNe ?? '').toString(),
        };
      }
      if (typeof rawTitle === 'string') {
        return { en: rawTitle, ne: (titleNe ?? '').toString() };
      }
      if (titleEn || titleNe) {
        return { en: (titleEn ?? '').toString(), ne: (titleNe ?? '').toString() };
      }
      if (name) {
        return { en: name.toString(), ne: '' };
      }
      return { en: '', ne: '' };
    })();

    return {
      id: backendSlider.id || backendSlider._id || '',
      title,
      position: backendSlider.position || 1,
      displayTime: backendSlider.displayTime || 5000,
      isActive: backendSlider.isActive ?? true,
      isPublished: backendSlider.isPublished ?? false,
      mediaId: backendSlider.mediaId || null,
      imageUrl: backendSlider.imageUrl || null,
      presignedUrl: backendSlider.presignedUrl || null,
      createdAt: backendSlider.createdAt ? new Date(backendSlider.createdAt) : new Date(),
      updatedAt: backendSlider.updatedAt ? new Date(backendSlider.updatedAt) : new Date(),
      // Preserve the nested media object from backend
      ...(backendSlider.media && { media: backendSlider.media }),
      // Add any additional fields that might exist
      ...(backendSlider.description && { description: backendSlider.description }),
      ...(backendSlider.metadata && { metadata: backendSlider.metadata }),
      // Preserve other media-related fields that might be flattened
      ...(backendSlider.fileId && { fileId: backendSlider.fileId }),
      ...(backendSlider.fileName && { fileName: backendSlider.fileName }),
      ...(backendSlider.originalName && { originalName: backendSlider.originalName }),
      ...(backendSlider.size && { size: backendSlider.size }),
      ...(backendSlider.contentType && { contentType: backendSlider.contentType }),
      ...(backendSlider.folder && { folder: backendSlider.folder }),
      ...(backendSlider.category && { category: backendSlider.category }),
      ...(backendSlider.altText && { altText: backendSlider.altText }),
      ...(backendSlider.tags && { tags: backendSlider.tags }),
      // Preserve analytics fields
      ...(backendSlider.clickCount !== undefined && { clickCount: backendSlider.clickCount }),
      ...(backendSlider.viewCount !== undefined && { viewCount: backendSlider.viewCount }),
      ...(backendSlider.clickThroughRate !== undefined && { clickThroughRate: backendSlider.clickThroughRate })
    };
  }

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`SliderService Error: ${defaultMessage}`, error);
    
    if (error instanceof Error) {
      throw new Error(`${defaultMessage}: ${error.message}`);
    }
    
    throw new Error(defaultMessage);
  }
}