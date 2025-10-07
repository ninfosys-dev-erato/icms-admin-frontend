import { httpClient } from '@/lib/api/http-client';
import {
  Slider,
  SliderAnalytics,
  SliderListResponse,
  SliderQuery,
  SliderStatistics,
  BulkOperationResult,
} from '../types/slider';

/**
 * Repository responsible for direct API interactions for Sliders.
 * This layer should be the ONLY place that talks to the HTTP client.
 * Services and stores must depend on this repository rather than httpClient directly.
 */
export interface SliderRepository {
  // List & Search
  getPublicSliders(params?: Partial<SliderQuery>): Promise<any>;
  getAdminSliders(params?: Partial<SliderQuery>): Promise<any>;
  searchAdminSliders(params: Partial<SliderQuery> & { search: string }): Promise<any>;

  // CRUD
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;

  // Publish status
  publish(id: string): Promise<any>;
  unpublish(id: string): Promise<any>;

  // Bulk
  bulkPublish(ids: string[]): Promise<any>;
  bulkUnpublish(ids: string[]): Promise<any>;
  bulkDelete(ids: string[]): Promise<any>;
  reorder(orders: { id: string; position: number }[]): Promise<any>;

  // Media
  uploadImage(id: string, formData: FormData): Promise<any>;
  removeImage(id: string): Promise<any>;
  createWithImage(formData: FormData): Promise<any>;

  // Stats / Analytics
  getStatistics(): Promise<any>;
  getAnalytics(id: string, params?: { dateFrom?: string; dateTo?: string }): Promise<any>;
}

class SliderRepositoryImpl implements SliderRepository {
  private readonly BASE_URL = '/sliders';
  private readonly ADMIN_URL = '/admin/sliders';

  // List & Search
  async getPublicSliders(params: Partial<SliderQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.BASE_URL}`, { params });
  }

  async getAdminSliders(params: Partial<SliderQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}`, { params });
  }

  async searchAdminSliders(params: Partial<SliderQuery> & { search: string }): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}`, { params });
  }

  // CRUD
  async getById(id: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}`);
  }

  async create(data: any): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}`, data);
  }

  async update(id: string, data: any): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_URL}/${id}`, data);
  }

  async delete(id: string): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_URL}/${id}`);
  }

  // Publish status
  async publish(id: string): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/${id}/publish`);
  }

  async unpublish(id: string): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/${id}/unpublish`);
  }

  // Bulk
  async bulkPublish(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-publish`, { ids });
  }

  async bulkUnpublish(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-unpublish`, { ids });
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-delete`, { ids });
  }

  async reorder(orders: { id: string; position: number }[]): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_URL}/reorder`, orders);
  }

  // Media
  async uploadImage(id: string, formData: FormData): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async removeImage(id: string): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_URL}/${id}/image`);
  }

  async createWithImage(formData: FormData): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/upload-with-slider`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Stats / Analytics
  async getStatistics(): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/statistics`);
  }

  async getAnalytics(id: string, params: { dateFrom?: string; dateTo?: string } = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}/analytics`, { params });
  }
}

export const sliderRepository: SliderRepository = new SliderRepositoryImpl();


