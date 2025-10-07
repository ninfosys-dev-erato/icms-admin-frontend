import { HRStatistics, DepartmentAnalytics } from './common';

// HR Statistics Types
export interface HRStatisticsResponse {
  totalDepartments: number;
  activeDepartments: number;
  totalEmployees: number;
  activeEmployees: number;
  employeesByDepartment: Record<string, number>;
  departmentsWithHead: number;
  departmentsWithoutHead: number;
}

export interface EmployeeStatistics {
  total: number;
  active: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  averageEmployeesPerDepartment: number;
}

export interface DepartmentStatistics {
  total: number;
  active: number;
  withEmployees: number;
  averageEmployeesPerDepartment: number;
  byLevel: Record<number, number>;
}

export interface OrganizationalChartNode {
  id: string;
  name: TranslatableEntityDto;
  type: 'department' | 'employee';
  parentId?: string;
  children: OrganizationalChartNode[];
  employeeCount?: number;
  departmentHead?: EmployeeResponseDto;
}

export interface EmployeeDirectoryEntry {
  id: string;
  name: TranslatableEntityDto;
  position: TranslatableEntityDto;
  department: DepartmentResponseDto;
  contact: {
    mobileNumber?: string;
    telephone?: string;
    email?: string;
    roomNumber?: string;
  };
}

// Import types to avoid circular dependency
export interface TranslatableEntityDto {
  en: string;
  ne: string;
}

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
