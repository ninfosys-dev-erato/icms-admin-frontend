export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus; // some backends may accept status
  isActive?: boolean;  // others accept boolean; we send both for compatibility
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  isActive?: boolean;
}

// Form data persisted in store for create/edit flows
export interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | 'ALL';
  status?: UserStatus | 'ALL';
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserListResponse {
  data: User[];
  pagination: PaginationInfo;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  adminCount: number;
  editorCount: number;
  viewerCount: number;
  recentRegistrations: number;
}

export interface UserActivityItem {
  id: string;
  userId: string;
  action: string;
  timestamp: string; // ISO
  actorEmail?: string;
}


