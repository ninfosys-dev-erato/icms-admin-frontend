import { httpClient } from '@/lib/api/http-client';
import type {
  Content,
  CreateContentRequest,
  UpdateContentRequest,
  ContentQuery,
  ContentStatistics,
  BulkOperationResult,
} from '../types/content';
import type { PaginatedResponse } from '../types/common';

/**
 * Repository responsible for direct API interactions for Content.
 * Only this layer should talk to the HTTP client.
 */
export interface ContentRepository {
  // List & Search
  getPublicContents(params?: Partial<ContentQuery>): Promise<PaginatedResponse<Content>>;
  getAdminContents(params?: Partial<ContentQuery>): Promise<PaginatedResponse<Content>>;
  searchAdminContents(params: Partial<ContentQuery> & { search: string }): Promise<PaginatedResponse<Content>>;

  // CRUD
  getById(id: string): Promise<Content>;
  create(data: CreateContentRequest): Promise<Content>;
  update(id: string, data: UpdateContentRequest): Promise<Content>;
  delete(id: string): Promise<void>;

  // Status operations
  updateStatus(id: string, status: string): Promise<Content>;
  publish(id: string): Promise<Content>;
  unpublish(id: string): Promise<Content>;

  // Bulk operations
  bulkUpdate(operations: Array<{ id: string; operation: string; data?: Record<string, unknown> }>): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
  bulkPublish(ids: string[]): Promise<BulkOperationResult>;
  bulkUnpublish(ids: string[]): Promise<BulkOperationResult>;

  // Statistics
  getStatistics(): Promise<ContentStatistics>;
}

class ContentRepositoryImpl implements ContentRepository {
  private readonly BASE_URL = '/content';
  private readonly ADMIN_URL = '/admin/content';

  async getPublicContents(params: Partial<ContentQuery> = {}): Promise<PaginatedResponse<Content>> {
    const res = await httpClient.get<any>(this.BASE_URL, { params });
    const api: any = res as any;
    const items = Array.isArray(api?.data) ? (api.data as Content[]) : ([] as Content[]);
    const pagination = (api?.pagination ?? api?.data?.pagination) as PaginatedResponse<Content>['pagination'];
    return { data: items, pagination } as PaginatedResponse<Content>;
  }

  async getAdminContents(params: Partial<ContentQuery> = {}): Promise<PaginatedResponse<Content>> {
    const res = await httpClient.get<any>(this.ADMIN_URL, { params });
    const api: any = res as any;
    const items = Array.isArray(api?.data) ? (api.data as Content[]) : ([] as Content[]);
    const pagination = (api?.pagination ?? api?.data?.pagination) as PaginatedResponse<Content>['pagination'];
    return { data: items, pagination } as PaginatedResponse<Content>;
  }

  async searchAdminContents(params: Partial<ContentQuery> & { search: string }): Promise<PaginatedResponse<Content>> {
    const res = await httpClient.get<any>(this.ADMIN_URL, { params });
    const api: any = res as any;
    const items = Array.isArray(api?.data) ? (api.data as Content[]) : ([] as Content[]);
    const pagination = (api?.pagination ?? api?.data?.pagination) as PaginatedResponse<Content>['pagination'];
    return { data: items, pagination } as PaginatedResponse<Content>;
  }

  async getById(id: string): Promise<Content> {
    const res = await httpClient.get<Content>(`${this.ADMIN_URL}/${id}`);
    return res.data as Content;
  }

  async create(data: CreateContentRequest): Promise<Content> {
    const res = await httpClient.post<Content>(this.ADMIN_URL, data);
    return res.data as Content;
  }

  async update(id: string, data: UpdateContentRequest): Promise<Content> {
    const res = await httpClient.put<Content>(`${this.ADMIN_URL}/${id}`, data);
    return res.data as Content;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.ADMIN_URL}/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<Content> {
    const res = await httpClient.put<Content>(`${this.ADMIN_URL}/${id}/status`, { status });
    return res.data as Content;
  }

  async publish(id: string): Promise<Content> {
    const res = await httpClient.post<Content>(`${this.ADMIN_URL}/${id}/publish`);
    return res.data as Content;
  }

  async unpublish(id: string): Promise<Content> {
    const res = await httpClient.post<Content>(`${this.ADMIN_URL}/${id}/unpublish`);
    return res.data as Content;
  }

  async bulkUpdate(operations: Array<{ id: string; operation: string; data?: Record<string, unknown> }>): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.ADMIN_URL}/bulk-update`, { operations });
    return res.data as BulkOperationResult;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.ADMIN_URL}/bulk-delete`, { ids });
    return res.data as BulkOperationResult;
  }

  async bulkPublish(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.ADMIN_URL}/bulk-publish`, { ids });
    return res.data as BulkOperationResult;
  }

  async bulkUnpublish(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.ADMIN_URL}/bulk-unpublish`, { ids });
    return res.data as BulkOperationResult;
  }

  async getStatistics(): Promise<ContentStatistics> {
    const res = await httpClient.get<ContentStatistics>(`${this.ADMIN_URL}/statistics`);
    return res.data as ContentStatistics;
  }
}

export const contentRepository: ContentRepository = new ContentRepositoryImpl(); 