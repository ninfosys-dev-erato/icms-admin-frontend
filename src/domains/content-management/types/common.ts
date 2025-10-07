// Common Types for Content Management Domain
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

export interface ContentStatistics {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  archivedContent: number;
  featuredContent: number;
  contentByCategory: Record<string, number>;
  contentByStatus: Record<string, number>;
  contentByVisibility: Record<string, number>;
  averageViewsPerContent: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  categoriesWithContent: number;
  averageContentPerCategory: number;
  categoriesByLevel: Record<number, number>;
  topCategoriesByContent: Array<{ categoryId: string; categoryName: string; contentCount: number }>;
}
