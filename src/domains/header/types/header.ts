// ========================================
// COMMON TYPES
// ========================================

export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export enum HeaderAlignment {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  JUSTIFY = 'JUSTIFY'
}

// ========================================
// TYPOGRAPHY TYPES
// ========================================

export interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

// ========================================
// LOGO TYPES
// ========================================

export interface LogoMedia {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  presignedUrl?: string;
  size: number;
  contentType: string;
}

export interface LogoItem {
  mediaId: string;
  altText: TranslatableEntity;
  width: number;
  height: number;
  media?: LogoMedia; // Optional media details including presigned URLs
}

export interface LogoConfiguration {
  leftLogo?: LogoItem;
  rightLogo?: LogoItem;
  logoAlignment: 'left' | 'center' | 'right';
  logoSpacing: number;
}

// ========================================
// LAYOUT TYPES
// ========================================

export interface LayoutConfiguration {
  headerHeight: number;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  padding: Padding;
  margin: Margin;
  responsive?: {
    mobile?: Partial<LayoutConfiguration>;
    tablet?: Partial<LayoutConfiguration>;
    desktop?: Partial<LayoutConfiguration>;
  };
}

// ========================================
// HEADER CONFIG TYPES
// ========================================

export interface HeaderConfig {
  id: string;
  name: TranslatableEntity;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfiguration;
  layout: LayoutConfiguration;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface HeaderFormData {
  name: TranslatableEntity;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfiguration;
  layout: LayoutConfiguration;
}

export interface CreateHeaderRequest {
  name: TranslatableEntity;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfiguration;
  layout: LayoutConfiguration;
}

export interface UpdateHeaderRequest {
  name?: TranslatableEntity;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  typography?: TypographySettings;
  alignment?: HeaderAlignment;
  logo?: LogoConfiguration;
  layout?: LayoutConfiguration;
}

// ========================================
// LOGO UPLOAD TYPES
// ========================================

export interface LogoUploadData {
  altText: TranslatableEntity;
  width: number;
  height: number;
}

export interface LogoFileUploadData {
  logo: File;
  altText: TranslatableEntity;
  width: number;
  height: number;
}

// ========================================
// PREVIEW & CSS TYPES
// ========================================

export interface HeaderPreview {
  css: string;
  html: string;
  config: HeaderConfig;
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
// BULK OPERATION TYPES
// ========================================

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

// ========================================
// PAGINATION & API RESPONSE TYPES
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HeaderListResponse {
  data: HeaderConfig[];
  pagination: PaginationInfo;
}

// ========================================
// QUERY TYPES
// ========================================

export interface HeaderQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface HeaderSearchQuery {
  q: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ========================================
// STATISTICS TYPES
// ========================================

export interface HeaderStatistics {
  total: number;
  active: number;
  published: number;
  byAlignment: Record<HeaderAlignment, number>;
  averageOrder: number;
}

// ========================================
// STORE TYPES
// ========================================

export interface HeaderUIStore {
  // UI state for IBM Products SidePanel
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelHeader: HeaderConfig | null;
  isEditing: boolean;
  isSubmitting: boolean;

  // Form state management
  activeFormId: string | 'create' | null;
  formStateById: Record<string, HeaderFormData>;
  createFormState: HeaderFormData;
  
  // Logo file management (non-persisted)
  leftLogoFileById: Record<string, File | null>;
  rightLogoFileById: Record<string, File | null>;
  createLeftLogoFile: File | null;
  createRightLogoFile: File | null;

  // Form data access getters
  formData: HeaderFormData;
  leftLogoFile: File | null;
  rightLogoFile: File | null;
  
  // Validation
  validationErrors: Record<string, string>;
  activeTab: number;

  // UI Actions
  openCreatePanel: () => void;
  openEditPanel: (header: HeaderConfig) => void;
  closePanel: () => void;
  setEditing: (isEditing: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;

  // Form Actions
  initializeEditForm: (header: HeaderConfig) => void;
  resetCreateForm: () => void;
  updateFormField: (field: keyof HeaderFormData, value: unknown) => void;
  setLogoFile: (type: 'left' | 'right', file: File | null) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  setActiveTab: (tab: number) => void;
}

// ========================================
// COMPONENT PROP TYPES
// ========================================

export interface HeaderFormProps {
  header?: HeaderConfig;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export interface HeaderListProps {
  headers?: HeaderConfig[];
  onEdit?: (header: HeaderConfig) => void;
  onView?: (header: HeaderConfig) => void;
  onPreview?: (header: HeaderConfig) => void;
  onCreate?: () => void;
  statusFilter?: 'all' | 'active' | 'inactive' | 'published' | 'unpublished';
}

export interface HeaderStatisticsProps {
  headers?: HeaderConfig[];
  statistics?: HeaderStatistics | null;
  loading?: boolean;
}

export interface LogoConfigurationProps {
  value: LogoConfiguration;
  onChange: (logo: LogoConfiguration) => void;
  disabled?: boolean;
  className?: string;
}

export interface TypographySettingsProps {
  value: TypographySettings;
  onChange: (typography: TypographySettings) => void;
  disabled?: boolean;
  className?: string;
}

export interface LayoutConfigurationProps {
  value: LayoutConfiguration;
  onChange: (layout: LayoutConfiguration) => void;
  disabled?: boolean;
  className?: string;
}
