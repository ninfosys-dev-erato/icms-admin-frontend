import { httpClient } from '@/lib/api/http-client';
import { 
  HeaderConfig, 
  CreateHeaderRequest, 
  UpdateHeaderRequest, 
  HeaderQuery, 
  HeaderSearchQuery,
  HeaderStatistics,
  LogoUploadData
} from '../types/header';

export class HeaderRepository {
  private static readonly BASE_PATH = '/admin/header-configs';

  // Get all header configs with pagination and filters
  static async getAll(query?: HeaderQuery): Promise<{
    data: HeaderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (query?.page) queryParams.append('page', query.page.toString());
    if (query?.limit) queryParams.append('limit', query.limit.toString());
    if (query?.search) queryParams.append('search', query.search);
    if (query?.isActive !== undefined) queryParams.append('isActive', query.isActive.toString());
    if (query?.isPublished !== undefined) queryParams.append('isPublished', query.isPublished.toString());
    if (query?.sort) queryParams.append('sort', query.sort);
    if (query?.order) queryParams.append('order', query.order);

    const response = await httpClient.get(`${this.BASE_PATH}?${queryParams.toString()}`);
    
    // Handle different possible response structures
    const responseData = response.data as Record<string, unknown>;
    
    // If the response has a data property, use it
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = responseData.data;
      
      return {
        data: Array.isArray(data) ? data : [],
        total: typeof responseData.total === 'number' ? responseData.total : 0,
        page: typeof responseData.page === 'number' ? responseData.page : 1,
        limit: typeof responseData.limit === 'number' ? responseData.limit : 10,
        totalPages: typeof responseData.totalPages === 'number' ? responseData.totalPages : 1
      };
    }
    
    // If the response is directly an array, wrap it
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        total: responseData.length,
        page: 1,
        limit: responseData.length,
        totalPages: 1
      };
    }
    
    // If the response has a different structure, try to extract what we can
    const fallbackData = responseData?.headers || responseData?.items || responseData?.results || [];
    
    return {
      data: Array.isArray(fallbackData) ? fallbackData : [],
      total: typeof responseData.total === 'number' ? responseData.total : 
             typeof responseData.count === 'number' ? responseData.count : 0,
      page: typeof responseData.page === 'number' ? responseData.page : 1,
      limit: typeof responseData.limit === 'number' ? responseData.limit : 10,
      totalPages: typeof responseData.totalPages === 'number' ? responseData.totalPages : 1
    };
  }

  // Search header configs
  static async search(query: HeaderSearchQuery): Promise<{
    data: HeaderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('q', query.q);
    if (query.page) queryParams.append('page', query.page.toString());
    if (query.limit) queryParams.append('limit', query.limit.toString());
    if (query.isActive !== undefined) queryParams.append('isActive', query.isActive.toString());
    if (query.isPublished !== undefined) queryParams.append('isPublished', query.isPublished.toString());
    if (query.sort) queryParams.append('sort', query.sort);
    if (query.order) queryParams.append('order', query.order);

    const response = await httpClient.get(`${this.BASE_PATH}/search?${queryParams.toString()}`);
    
    // Handle response similar to getAll
    const responseData = response.data as Record<string, unknown>;
    
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = responseData.data;
      
      return {
        data: Array.isArray(data) ? data : [],
        total: typeof responseData.total === 'number' ? responseData.total : 0,
        page: typeof responseData.page === 'number' ? responseData.page : 1,
        limit: typeof responseData.limit === 'number' ? responseData.limit : 10,
        totalPages: typeof responseData.totalPages === 'number' ? responseData.totalPages : 1
      };
    }
    
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    };
  }

  // Get header by ID
  static async getById(id: string): Promise<HeaderConfig> {
    const response = await httpClient.get(`${this.BASE_PATH}/${id}`);
    return response.data as HeaderConfig;
  }

  // Get header by ID with logo media details (including presigned URLs)
  static async getByIdWithLogoMedia(id: string): Promise<HeaderConfig> {
    const response = await httpClient.get(`${this.BASE_PATH}/${id}`);
    return response.data as HeaderConfig;
  }

  // Create new header
  static async create(data: CreateHeaderRequest): Promise<HeaderConfig> {
    // Log request payload for debugging
    console.log('HeaderRepository.create - request payload:', data);
    const response = await httpClient.post(`${this.BASE_PATH}`, data);
    // Log response from server
    console.log('HeaderRepository.create - response:', response?.data);
    return response.data as HeaderConfig;
  }

  // Update header
  static async update(id: string, data: UpdateHeaderRequest): Promise<HeaderConfig> {
    // Log request payload for debugging
    console.log(`HeaderRepository.update - id: ${id} - request payload:`, data);
    const response = await httpClient.put(`${this.BASE_PATH}/${id}`, data);
    // Log response from server
    console.log(`HeaderRepository.update - id: ${id} - response:`, response?.data);
    return response.data as HeaderConfig;
  }

  // Delete header
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_PATH}/${id}`);
  }

  // Publish header
  static async publish(id: string): Promise<HeaderConfig> {
    const response = await httpClient.post(`${this.BASE_PATH}/${id}/publish`);
    return response.data as HeaderConfig;
  }

  // Unpublish header
  static async unpublish(id: string): Promise<HeaderConfig> {
    const response = await httpClient.post(`${this.BASE_PATH}/${id}/unpublish`);
    return response.data as HeaderConfig;
  }

  // Bulk operations
  static async bulkPublish(ids: string[]): Promise<{ message: string; results: string[] }> {
    const response = await httpClient.post(`${this.BASE_PATH}/bulk-publish`, { ids });
    return response.data as { message: string; results: string[] };
  }

  static async bulkUnpublish(ids: string[]): Promise<{ message: string; results: string[] }> {
    const response = await httpClient.post(`${this.BASE_PATH}/bulk-unpublish`, { ids });
    return response.data as { message: string; results: string[] };
  }

  static async bulkDelete(ids: string[]): Promise<{ message: string; results: string[] }> {
    const response = await httpClient.post(`${this.BASE_PATH}/bulk-delete`, { ids });
    return response.data as { message: string; results: string[] };
  }

  // Logo operations
  static async uploadLeftLogo(id: string, formData: FormData): Promise<HeaderConfig> {
    const response = await httpClient.post(`${this.BASE_PATH}/${id}/logo/left/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as HeaderConfig;
  }

  static async uploadRightLogo(id: string, formData: FormData): Promise<HeaderConfig> {
    const response = await httpClient.post(`${this.BASE_PATH}/${id}/logo/right/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as HeaderConfig;
  }

  static async updateLeftLogo(id: string, data: LogoUploadData): Promise<HeaderConfig> {
    const response = await httpClient.put(`${this.BASE_PATH}/${id}/logo/left`, data);
    return response.data as HeaderConfig;
  }

  static async updateRightLogo(id: string, data: LogoUploadData): Promise<HeaderConfig> {
    const response = await httpClient.put(`${this.BASE_PATH}/${id}/logo/right`, data);
    return response.data as HeaderConfig;
  }

  static async removeLeftLogo(id: string): Promise<HeaderConfig> {
    const response = await httpClient.delete(`${this.BASE_PATH}/${id}/logo/left`);
    return response.data as HeaderConfig;
  }

  static async removeRightLogo(id: string): Promise<HeaderConfig> {
    const response = await httpClient.delete(`${this.BASE_PATH}/${id}/logo/right`);
    return response.data as HeaderConfig;
  }

  // Statistics
  static async getStatistics(): Promise<HeaderStatistics> {
    const response = await httpClient.get(`${this.BASE_PATH}/statistics`);
    return response.data as HeaderStatistics;
  }

  // Export headers
  static async export(query?: HeaderQuery, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (query?.page) queryParams.append('page', query.page.toString());
    if (query?.limit) queryParams.append('limit', query.limit.toString());
    if (query?.search) queryParams.append('search', query.search);
    if (query?.isActive !== undefined) queryParams.append('isActive', query.isActive.toString());
    if (query?.isPublished !== undefined) queryParams.append('isPublished', query.isPublished.toString());
    if (query?.sort) queryParams.append('sort', query.sort);
    if (query?.order) queryParams.append('order', query.order);
    
    queryParams.append('format', format);

    const response = await httpClient.get(`${this.BASE_PATH}/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  }

  // Import headers
  static async import(file: File): Promise<{ message: string; results: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post(`${this.BASE_PATH}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { message: string; results: string[] };
  }

  // Generate CSS
  static async generateCSS(id: string): Promise<{ css: string }> {
    const response = await httpClient.get(`${this.BASE_PATH}/${id}/css`);
    return response.data as { css: string };
  }
}
