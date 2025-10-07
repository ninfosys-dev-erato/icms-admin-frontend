import { httpClient } from '@/lib/api/http-client';
import type {
  EmployeeResponseDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
} from '../types/employee';
import type { PaginatedResponse, BulkOperationResult } from '../types/common';

/**
 * Repository responsible for direct API interactions for Employees.
 */
export interface EmployeeRepository {
  // List & Search
  getEmployees(params?: Partial<EmployeeQueryDto>): Promise<PaginatedResponse<EmployeeResponseDto>>;
  searchEmployees(params: Partial<EmployeeQueryDto> & { search: string }): Promise<PaginatedResponse<EmployeeResponseDto>>;

  // CRUD
  getById(id: string): Promise<EmployeeResponseDto>;
  create(data: CreateEmployeeDto): Promise<EmployeeResponseDto>;
  update(id: string, data: UpdateEmployeeDto): Promise<EmployeeResponseDto>;
  delete(id: string): Promise<void>;

  // Bulk
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;

  // Photo operations
  uploadPhoto(id: string, formData: FormData): Promise<EmployeeResponseDto>;
  removePhoto(id: string): Promise<EmployeeResponseDto>;
  createWithPhoto(formData: FormData): Promise<EmployeeResponseDto>;
}

class EmployeeRepositoryImpl implements EmployeeRepository {
  private readonly BASE_URL = '/admin/employees';

  async getEmployees(params: Partial<EmployeeQueryDto> = {}): Promise<PaginatedResponse<EmployeeResponseDto>> {
    const res = await httpClient.get<any>(this.BASE_URL, { params });
    const items = Array.isArray(res?.data) ? (res.data as EmployeeResponseDto[]) : ([] as EmployeeResponseDto[]);
    const pagination = (res?.pagination ?? res?.data?.pagination) as PaginatedResponse<EmployeeResponseDto>['pagination'];
    return { data: items, pagination } as PaginatedResponse<EmployeeResponseDto>;
  }

  async searchEmployees(params: Partial<EmployeeQueryDto> & { search: string }): Promise<PaginatedResponse<EmployeeResponseDto>> {
    const searchParams = { ...params, q: params.search };
    const { search, ...restParams } = searchParams;
    const res = await httpClient.get<any>(`${this.BASE_URL}/search`, { params: restParams });
    const items = Array.isArray(res?.data) ? (res.data as EmployeeResponseDto[]) : ([] as EmployeeResponseDto[]);
    const pagination = (res?.pagination ?? res?.data?.pagination) as PaginatedResponse<EmployeeResponseDto>['pagination'];
    return { data: items, pagination } as PaginatedResponse<EmployeeResponseDto>;
  }

  async getById(id: string): Promise<EmployeeResponseDto> {
    const res = await httpClient.get<EmployeeResponseDto>(`${this.BASE_URL}/${id}`);
    return res.data as EmployeeResponseDto;
  }

  async create(data: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const res = await httpClient.post<EmployeeResponseDto>(this.BASE_URL, data);
    return res.data as EmployeeResponseDto;
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    console.log('🔍 Repository: Updating employee with data:', data);
    console.log('🔍 Repository: Homepage fields:', {
      showUpInHomepage: data.showUpInHomepage,
      showDownInHomepage: data.showDownInHomepage
    });
    console.log('🔍 Repository: Full update payload:', JSON.stringify(data, null, 2));
    
    const res = await httpClient.put<EmployeeResponseDto>(`${this.BASE_URL}/${id}`, data);
    
    console.log('🔍 Repository: Backend response:', res.data);
    
    return res.data as EmployeeResponseDto;
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

  // Photo operations - Updated to use correct endpoints
  async uploadPhoto(id: string, formData: FormData): Promise<EmployeeResponseDto> {
    // Use PUT for replacing photo (matches backend controller)
    // Don't set Content-Type header - let browser set it automatically with boundary
    const res = await httpClient.put<EmployeeResponseDto>(`${this.BASE_URL}/${id}/photo`, formData);
    return res.data as EmployeeResponseDto;
  }

  async removePhoto(id: string): Promise<EmployeeResponseDto> {
    const res = await httpClient.delete<EmployeeResponseDto>(`${this.BASE_URL}/${id}/photo`);
    return res.data as EmployeeResponseDto;
  }

  async createWithPhoto(formData: FormData): Promise<EmployeeResponseDto> {
    // Don't set Content-Type header - let browser set it automatically with boundary
    const res = await httpClient.post<EmployeeResponseDto>(`${this.BASE_URL}/upload-with-employee`, formData);
    return res.data as EmployeeResponseDto;
  }
}

export const employeeRepository: EmployeeRepository = new EmployeeRepositoryImpl();


