export { HRContainer } from './components/hr-dashboard/hr-container';
export { EmployeeList } from './components/employees/employee-list';
export { EmployeeCardList } from './components/employees/employee-card-list';
export { EmployeeCard } from './components/employees/employee-card';
export { HRPanelForms } from './components/hr-dashboard/hr-panel-forms';
export { EmployeePhotoUpload } from './components/employees/employee-photo-upload';
export { EmployeePhotoPreview } from './components/employees/employee-photo-preview';

// Export specific types to avoid conflicts
export type { PaginatedResponse, HRStatistics } from './types/common';
export type { DepartmentResponseDto } from './types/department';
export type { EmployeeResponseDto, EmployeePhoto } from './types/employee';
