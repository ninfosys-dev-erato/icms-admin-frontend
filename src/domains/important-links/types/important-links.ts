// ========================================
// CORE TYPES
// ========================================

export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface ImportantLink {
  id: string;
  linkTitle: TranslatableEntity;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface ImportantLinkFormData {
  linkTitle: TranslatableEntity;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

// ========================================
// API REQUEST TYPES
// ========================================

export interface CreateImportantLinkRequest {
  linkTitle: TranslatableEntity;
  linkUrl: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateImportantLinkRequest {
  linkTitle?: TranslatableEntity;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

// ========================================
// QUERY TYPES
// ========================================

export interface ImportantLinkQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  lang?: string;
  search?: string;
}

// ========================================
// RESPONSE TYPES
// ========================================

export interface ImportantLinkListResponse {
  data: ImportantLink[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ========================================
// STATISTICS TYPES
// ========================================

export interface ImportantLinkStatistics {
  total: number;
  active: number;
  inactive: number;
  lastUpdated: Date | null;
}

// ========================================
// FOOTER TYPES
// ========================================

export interface FooterLinks {
  quickLinks: ImportantLink[];
  governmentLinks: ImportantLink[];
  socialMediaLinks: ImportantLink[];
  contactLinks: ImportantLink[];
}

// ========================================
// BULK OPERATION TYPES
// ========================================

export interface BulkCreateImportantLinksRequest {
  links: CreateImportantLinkRequest[];
}

export interface BulkUpdateImportantLinksRequest {
  links: Array<{
    id: string;
    data: Partial<UpdateImportantLinkRequest>;
  }>;
}

export interface ReorderImportantLinksRequest {
  orders: Array<{
    id: string;
    order: number;
  }>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// STORE TYPES
// ========================================

export interface ImportantLinkUIStore {
  // UI state for IBM Products SidePanel
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelLink: ImportantLink | null;
  isEditing: boolean;
  isSubmitting: boolean;

  // Form state management
  activeFormId: string | 'create' | null;
  // Persisted form fields
  formStateById: Record<string, ImportantLinkFormData>;
  createFormState: ImportantLinkFormData;

  // UI Actions
  openCreatePanel: () => void;
  openEditPanel: (link: ImportantLink) => void;
  closePanel: () => void;
  setEditing: (isEditing: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;

  // Form Actions
  initializeEditForm: (link: ImportantLink) => void;
  resetCreateForm: () => void;
  updateFormField: (
    id: string | 'create',
    field: keyof ImportantLinkFormData,
    value: unknown
  ) => void;
  resetFormState: (id: string | 'create') => void;
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========================================
// IMPORT/EXPORT TYPES
// ========================================

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface ExportResult {
  data: ImportantLink[];
  total: number;
  exportedAt: Date;
}
