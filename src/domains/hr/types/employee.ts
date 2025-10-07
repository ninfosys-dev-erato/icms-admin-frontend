import { TranslatableEntityDto } from './common';

// Employee Types
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
  photoMediaId?: string;
  photo?: EmployeePhoto;
  department?: DepartmentResponseDto;
  showUpInHomepage: boolean;
  showDownInHomepage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDto {
  name: TranslatableEntityDto;
  departmentId: string;
  position: TranslatableEntityDto;
  order?: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive?: boolean;
  photoMediaId?: string;
  showUpInHomepage?: boolean;
  showDownInHomepage?: boolean;
}

export interface UpdateEmployeeDto {
  name?: TranslatableEntityDto;
  departmentId?: string;
  position?: TranslatableEntityDto;
  order?: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive?: boolean;
  photoMediaId?: string;
  showUpInHomepage?: boolean;
  showDownInHomepage?: boolean;
}

export interface EmployeeQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  departmentId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface EmployeeFormData {
  name: TranslatableEntityDto;
  departmentId: string;
  position: TranslatableEntityDto;
  order: number;
  mobileNumber: string;
  telephone: string;
  email: string;
  roomNumber: string;
  isActive: boolean;
  photoMediaId?: string;
}

export interface EmployeePhoto {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  presignedUrl?: string;
  size: number;
  contentType: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
}

// Import DepartmentResponseDto to avoid circular dependency
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
