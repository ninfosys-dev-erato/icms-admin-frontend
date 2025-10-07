import { httpClient } from '@/lib/api/http-client';
import type {
  UserQuery,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/user';

export interface UserRepository {
  // List & Search
  getAdminUsers(params?: Partial<UserQuery>): Promise<unknown>;
  getById(id: string): Promise<unknown>;
  create(data: CreateUserRequest): Promise<unknown>;
  update(id: string, data: UpdateUserRequest): Promise<unknown>;
  delete(id: string): Promise<unknown>;

  // Status & Role
  activate(id: string): Promise<unknown>;
  deactivate(id: string): Promise<unknown>;
  updateRole(id: string, role: string): Promise<unknown>;

  // Bulk
  bulkActivate(ids: string[]): Promise<unknown>;
  bulkDeactivate(ids: string[]): Promise<unknown>;
  bulkDelete(ids: string[]): Promise<unknown>;

  // Import / Export
  import(file: File): Promise<unknown>;
  export(format?: 'json' | 'csv' | 'pdf', query?: Partial<UserQuery>): Promise<unknown>;

  // Analytics
  getStatistics(): Promise<unknown>;
  getActivity(params?: { page?: number; limit?: number }): Promise<unknown>;
}

class UserRepositoryImpl implements UserRepository {
  private readonly ADMIN_URL = '/admin/users';

  async getAdminUsers(params: Partial<UserQuery> = {}): Promise<unknown> {
    // Normalize params for backend: drop ALL/empty
    const built: Record<string, unknown> = {
      page: params.page,
      limit: params.limit,
      order: params.order,
      sort: params.sort,
    };
    if (params.search && params.search.trim().length > 0) built.search = params.search.trim();
    if (params.role && params.role !== 'ALL') built.role = params.role;
    // Map status to isActive for backend
    if (params.status && params.status !== 'ALL') {
      if (params.status === 'ACTIVE') built.isActive = true;
      else if (params.status === 'INACTIVE') built.isActive = false;
      // PENDING not supported on backend query; omit
    }
    if (params.dateFrom) built.dateFrom = params.dateFrom;
    if (params.dateTo) built.dateTo = params.dateTo;

    return httpClient.get<unknown>(this.ADMIN_URL, { params: built });
  }

  async getById(id: string): Promise<unknown> {
    return httpClient.get<unknown>(`${this.ADMIN_URL}/${id}`);
  }

  async create(data: CreateUserRequest): Promise<unknown> {
    return httpClient.post<unknown>(this.ADMIN_URL, data);
  }

  async update(id: string, data: UpdateUserRequest): Promise<unknown> {
    return httpClient.put<unknown>(`${this.ADMIN_URL}/${id}`, data);
  }

  async delete(id: string): Promise<unknown> {
    return httpClient.delete<unknown>(`${this.ADMIN_URL}/${id}`);
  }

  async activate(id: string): Promise<unknown> {
    return httpClient.post<unknown>(`${this.ADMIN_URL}/${id}/activate`);
  }

  async deactivate(id: string): Promise<unknown> {
    return httpClient.post<unknown>(`${this.ADMIN_URL}/${id}/deactivate`);
  }

  async updateRole(id: string, role: string): Promise<unknown> {
    return httpClient.put<unknown>(`${this.ADMIN_URL}/${id}/role`, { role });
  }

  async bulkActivate(ids: string[]): Promise<unknown> {
    return httpClient.post<unknown>(`${this.ADMIN_URL}/bulk-activate`, { ids });
  }

  async bulkDeactivate(ids: string[]): Promise<unknown> {
    return httpClient.post<unknown>(`${this.ADMIN_URL}/bulk-deactivate`, { ids });
  }

  async bulkDelete(ids: string[]): Promise<unknown> {
    return httpClient.post<unknown>(`${this.ADMIN_URL}/bulk-delete`, { ids });
  }

  async import(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post<unknown>(`${this.ADMIN_URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async export(format: 'json' | 'csv' | 'pdf' = 'json', query: Partial<UserQuery> = {}): Promise<unknown> {
    const params: Record<string, unknown> = { format };
    if (query.search && query.search.trim()) params.search = query.search.trim();
    if (query.role && query.role !== 'ALL') params.role = query.role;
    if (query.status && query.status !== 'ALL') params.status = query.status;
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    return httpClient.get<unknown>(`${this.ADMIN_URL}/export`, { params });
  }

  async getStatistics(): Promise<unknown> {
    return httpClient.get<unknown>(`${this.ADMIN_URL}/statistics`);
  }

  async getActivity(params: { limit?: number } = {}): Promise<unknown> {
    const built: Record<string, unknown> = {};
    if (params.limit) built.limit = params.limit;
    return httpClient.get<unknown>(`${this.ADMIN_URL}/activity`, { params: built });
  }
}

export const userRepository: UserRepository = new UserRepositoryImpl();


