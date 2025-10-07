import { TranslatableEntityDto } from './common';

// Department Types
export interface DepartmentResponseDto {
  id: string;
  departmentName: TranslatableEntityDto;
  parentId?: string;
  departmentHeadId?: string;
  order: number;
  isActive: boolean;
  parent?: DepartmentResponseDto;
  children?: DepartmentResponseDto[];
  employees?: EmployeeResponseDto[];
  departmentHead?: EmployeeResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDto {
  departmentName: TranslatableEntityDto;
  parentId?: string;
  departmentHeadId?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentDto {
  departmentName?: TranslatableEntityDto;
  parentId?: string;
  departmentHeadId?: string;
  order?: number;
  isActive?: boolean;
}

export interface DepartmentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DepartmentFormData {
  departmentName: TranslatableEntityDto;
  parentId?: string;
  departmentHeadId?: string;
  order: number;
  isActive: boolean;
}

// Import EmployeeResponseDto to avoid circular dependency
export interface EmployeeResponseDto {
  id: string;
  name: TranslatableEntityDto;
  departmentId: string;
  position: TranslatableEntityDto;
  order: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive: boolean;
  department?: DepartmentResponseDto;
  createdAt: Date;
  updatedAt: Date;
}
