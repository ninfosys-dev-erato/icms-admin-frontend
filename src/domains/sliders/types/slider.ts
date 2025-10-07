export interface TranslatableEntity {
  en: string;
  ne: string;
}

// ========================================
// SLIDER TYPES
// ========================================

export interface Slider {
  id: string;
  title?: TranslatableEntity;
  description?: TranslatableEntity;
  position: number;
  displayTime: number;
  isActive: boolean;
  isPublished?: boolean;
  mediaId?: string;
  clickCount?: number;
  viewCount?: number;
  clickThroughRate?: number;
  media?: SliderMedia;
  imageUrl?: string;
  presignedUrl?: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  contentType?: string;
  folder?: string;
  category?: string;
  altText?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  fileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SliderMedia {
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

export interface CreateSliderRequest {
  title?: TranslatableEntity;
  position: number;
  displayTime: number;
  isActive?: boolean;
  mediaId: string;
}

export interface UpdateSliderRequest {
  title?: TranslatableEntity;
  position?: number;
  displayTime?: number;
  isActive?: boolean;
  mediaId?: string;
}

export interface SliderQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  position?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SliderFormData {
  title: TranslatableEntity;
  position: number;
  displayTime: number;
  isActive: boolean;
}

// ========================================
// SLIDER STATISTICS & ANALYTICS
// ========================================

export interface SliderStatistics {
  total: number;
  active: number;
  published: number;
  totalClicks: number;
  totalViews: number;
  averageClickThroughRate: number;
  byPosition: Record<number, number>;
}

export interface SliderAnalytics {
  sliderId: string;
  totalClicks: number;
  totalViews: number;
  clickThroughRate: number;
  averageViewDuration: number;
  clicksByDate: Record<string, number>;
  viewsByDate: Record<string, number>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
}

// ========================================
// PAGINATION & API RESPONSE
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SliderListResponse {
  data: Slider[];
  pagination: PaginationInfo;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// STORE TYPES
// ========================================

export interface SliderState {
  sliders: Slider[];
  currentSlider: Slider | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isUploading: boolean;
  pagination: PaginationInfo | null;
  statistics: SliderStatistics | null;
  // UI state for panel
  panelOpen?: boolean;
  panelMode?: 'create' | 'edit';
  panelSlider?: Slider | null;
  // Query state and request tracking
  currentQuery?: SliderQuery;
  // Whether initial list has been loaded at least once in this session
  hasLoaded?: boolean;
}

export interface SliderActions {
  // List operations
  loadSliders: (query?: SliderQuery) => Promise<void>;
  searchSliders: (searchTerm: string, query?: SliderQuery) => Promise<void>;
  loadPublicSliders: () => Promise<void>;
  
  // CRUD operations
  getSliderById: (id: string) => Promise<void>;
  createSlider: (data: CreateSliderRequest) => Promise<void>;
  updateSlider: (id: string, data: UpdateSliderRequest) => Promise<void>;
  deleteSlider: (id: string) => Promise<void>;
  
  // Media operations
  uploadSliderImage: (id: string, file: File) => Promise<void>;
  removeSliderImage: (id: string) => Promise<void>;
  createSliderWithImage: (file: File, data: SliderFormData) => Promise<void>;
  
  // Bulk operations
  bulkPublish: (ids: string[]) => Promise<void>;
  bulkUnpublish: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  reorderSliders: (orders: { id: string; position: number }[]) => Promise<void>;
  
  // Status operations
  publishSlider: (id: string) => Promise<void>;
  unpublishSlider: (id: string) => Promise<void>;
  
  // Analytics
  loadStatistics: () => Promise<void>;
  getSliderAnalytics: (id: string, dateFrom?: Date, dateTo?: Date) => Promise<SliderAnalytics>;
  
  // State management
  setCurrentSlider: (slider: Slider | null) => void;
  setEditing: (isEditing: boolean) => void;
  clearError: () => void;
  // internal control
  _requestSeq?: number;
}

export type SliderStore = SliderState & SliderActions;

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