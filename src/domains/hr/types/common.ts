// Common Types for HR Domain
export interface TranslatableEntityDto {
  en: string;
  ne: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface HRStatistics {
  totalDepartments: number;
  activeDepartments: number;
  totalEmployees: number;
  activeEmployees: number;
  employeesByDepartment: Record<string, number>;
  departmentsWithHead: number;
  departmentsWithoutHead: number;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  activePercentage: number;
  employeePositions: Array<{ position: string; count: number }>;
  employeesByDate: Record<string, number>;
}
