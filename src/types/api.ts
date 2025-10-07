export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  // Some endpoints include pagination at the top level alongside data
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string | string[];
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
} 