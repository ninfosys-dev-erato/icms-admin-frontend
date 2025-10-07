import { httpClient } from '@/lib/api/http-client';
import type {
  DepartmentResponseDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentQueryDto,
} from '../types/department';
import type { PaginatedResponse, BulkOperationResult } from '../types/common';

/**
 * Repository responsible for direct API interactions for Departments.
 * Only this layer should talk to the HTTP client.
 */
export interface DepartmentRepository {
  // List & Search
  getDepartments(params?: Partial<DepartmentQueryDto>): Promise<PaginatedResponse<DepartmentResponseDto>>;
  searchDepartments(params: Partial<DepartmentQueryDto> & { search: string }): Promise<PaginatedResponse<DepartmentResponseDto>>;

  // CRUD
  getById(id: string): Promise<DepartmentResponseDto>;
  create(data: CreateDepartmentDto): Promise<DepartmentResponseDto>;
  update(id: string, data: UpdateDepartmentDto): Promise<DepartmentResponseDto>;
  delete(id: string): Promise<void>;

  // Bulk
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;

  // Hierarchy / Stats
  getHierarchy(): Promise<DepartmentResponseDto[]>;
  getStatistics(): Promise<any>;
}

class DepartmentRepositoryImpl implements DepartmentRepository {
  private readonly BASE_URL = '/admin/departments';

  async getDepartments(params: Partial<DepartmentQueryDto> = {}): Promise<PaginatedResponse<DepartmentResponseDto>> {
    // Our API returns { success, data: T[], pagination, meta }
    // httpClient wraps that as ApiResponse<T[]> where pagination is at the top level.
    const res = await httpClient.get<any>(this.BASE_URL, { params });
    const api: any = res as any;
    const items = Array.isArray(api?.data) ? (api.data as DepartmentResponseDto[]) : ([] as DepartmentResponseDto[]);
    const pagination = (api?.pagination ?? api?.data?.pagination) as PaginatedResponse<DepartmentResponseDto>['pagination'];
    return { data: items, pagination } as PaginatedResponse<DepartmentResponseDto>;
  }

  async searchDepartments(params: Partial<DepartmentQueryDto> & { search: string }): Promise<PaginatedResponse<DepartmentResponseDto>> {
    const searchParams = { ...params, q: params.search };
    const { search, ...restParams } = searchParams;
    const res = await httpClient.get<any>(`${this.BASE_URL}/search`, { params: restParams });
    const api: any = res as any;
    const items = Array.isArray(api?.data) ? (api.data as DepartmentResponseDto[]) : ([] as DepartmentResponseDto[]);
    const pagination = (api?.pagination ?? api?.data?.pagination) as PaginatedResponse<DepartmentResponseDto>['pagination'];
    return { data: items, pagination } as PaginatedResponse<DepartmentResponseDto>;
  }

  async getById(id: string): Promise<DepartmentResponseDto> {
    const res = await httpClient.get<DepartmentResponseDto>(`${this.BASE_URL}/${id}`);
    return res.data as DepartmentResponseDto;
  }

  async create(data: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const res = await httpClient.post<DepartmentResponseDto>(this.BASE_URL, data);
    return res.data as DepartmentResponseDto;
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const res = await httpClient.put<DepartmentResponseDto>(`${this.BASE_URL}/${id}`, data);
    return res.data as DepartmentResponseDto;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  async bulkActivate(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.BASE_URL}/bulk-activate`, { ids });
    return res.data as BulkOperationResult;
  }

  async bulkDeactivate(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.BASE_URL}/bulk-deactivate`, { ids });
    return res.data as BulkOperationResult;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const res = await httpClient.post<BulkOperationResult>(`${this.BASE_URL}/bulk-delete`, { ids });
    return res.data as BulkOperationResult;
  }

  async getHierarchy(): Promise<DepartmentResponseDto[]> {
    const res = await httpClient.get<DepartmentResponseDto[]>(`${this.BASE_URL}/hierarchy`);
    return res.data as DepartmentResponseDto[];
  }

  async getStatistics(): Promise<any> {
    const res = await httpClient.get<any>(`${this.BASE_URL}/statistics`);
    return res.data as any;
  }
}

export const departmentRepository: DepartmentRepository = new DepartmentRepositoryImpl();


