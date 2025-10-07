export interface TranslatableEntity {
  en: string;
  ne: string;
}

// ========================================
// ENUMS (from backend)
// ========================================

export enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  SIDEBAR = 'SIDEBAR',
  MOBILE = 'MOBILE',
  CUSTOM = 'CUSTOM'
}

export enum MenuItemType {
  LINK = 'LINK',
  CONTENT = 'CONTENT',
  PAGE = 'PAGE',
  CATEGORY = 'CATEGORY',
  CUSTOM = 'CUSTOM'
}

// ========================================
// MENU TYPES
// ========================================

export interface Menu {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  location: MenuLocation;
  order: number; // Add order field for menu ordering
  isActive: boolean;
  isPublished: boolean;
  categorySlug?: string; // New field for linking menu to category
  menuItemCount: number;
  menuItems: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: any;
  updatedBy: any;
}

export interface CreateMenuRequest {
  name: TranslatableEntity;
  description?: TranslatableEntity;
  location: MenuLocation;
  order?: number; // Add order field for menu ordering
  isActive?: boolean;
  isPublished?: boolean;
  categorySlug?: string; // New field for linking menu to category
}

export interface UpdateMenuRequest {
  name?: TranslatableEntity;
  description?: TranslatableEntity;
  location?: MenuLocation;
  order?: number; // Add order field for menu ordering
  isActive?: boolean;
  isPublished?: boolean;
  categorySlug?: string; // New field for linking menu to category
}

export interface MenuQuery {
  page?: number;
  limit?: number;
  search?: string;
  location?: MenuLocation;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ========================================
// MENU ITEM TYPES
// ========================================

export interface MenuItem {
  id: string;
  menuId: string;
  parentId?: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order: number;
  isActive: boolean;
  isVisible: boolean;
  isPublished: boolean;
  itemType: MenuItemType;
  itemId?: string;
  categorySlug?: string; // New field for linking menu item to category
  contentSlug?: string; // New field for linking menu item to content
  children: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: any;
  updatedBy: any;
}

export interface CreateMenuItemRequest {
  menuId: string;
  parentId?: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  itemType: MenuItemType;
  itemId?: string;
  categorySlug?: string; // New field for linking menu item to category
  contentSlug?: string; // New field for linking menu item to content
}

export interface UpdateMenuItemRequest {
  parentId?: string;
  title?: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order?: number;
  isActive?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  itemType?: MenuItemType;
  itemId?: string;
  categorySlug?: string; // New field for linking menu item to category
  contentSlug?: string; // New field for linking menu item to content
}

export interface MenuItemQuery {
  page?: number;
  limit?: number;
  search?: string;
  menuId?: string;
  parentId?: string;
  itemType?: MenuItemType;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MenuListResponse {
  data: Menu[];
  pagination: PaginationInfo;
}

export interface MenuItemListResponse {
  data: MenuItem[];
  pagination: PaginationInfo;
}

export interface MenuTreeResponse {
  menu: Menu;
  items: MenuItem[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
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

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// STORE TYPES (Following Slider Pattern)
// ========================================

export interface NavigationState {
  menus: Menu[];
  currentMenu: Menu | null;
  menuItems: MenuItem[];
  currentMenuItem: MenuItem | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isUploading: boolean;
  pagination: PaginationInfo | null;
  statistics: any | null;
  
  // UI state for panel (following slider pattern)
  panelOpen?: boolean;
  panelMode?: 'create' | 'edit';
  panelMenu?: Menu | null;
  panelMenuItem?: MenuItem | null;
  
  // Query state and request tracking
  currentQuery?: MenuQuery;
  currentMenuItemQuery?: MenuItemQuery;
  
  // Whether initial list has been loaded at least once in this session
  hasLoaded?: boolean;
}

export interface NavigationActions {
  // Menu operations
  loadMenus: (query?: MenuQuery) => Promise<void>;
  searchMenus: (searchTerm: string, query?: MenuQuery) => Promise<void>;
  loadPublishedMenus: () => Promise<void>;
  
  // Menu CRUD operations
  getMenuById: (id: string) => Promise<void>;
  createMenu: (data: CreateMenuRequest) => Promise<void>;
  updateMenu: (id: string, data: UpdateMenuRequest) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  
  // Menu status operations
  publishMenu: (id: string) => Promise<void>;
  unpublishMenu: (id: string) => Promise<void>;
  
  // Menu item operations
  loadMenuItems: (query?: MenuItemQuery) => Promise<void>;
  getMenuItemById: (id: string) => Promise<void>;
  createMenuItem: (data: CreateMenuItemRequest) => Promise<void>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  
  // Menu item operations
  reorderMenuItems: (orders: { id: string; order: number }[]) => Promise<void>;
  
  // Menu reordering operations
  reorderMenus: (orders: { id: string; order: number }[]) => Promise<void>;
  
  // Bulk operations
  bulkPublishMenus: (ids: string[]) => Promise<void>;
  bulkUnpublishMenus: (ids: string[]) => Promise<void>;
  bulkDeleteMenus: (ids: string[]) => Promise<void>;
  
  // Analytics
  loadStatistics: () => Promise<void>;
  
  // State management
  setCurrentMenu: (menu: Menu | null) => void;
  setCurrentMenuItem: (menuItem: MenuItem | null) => void;
  setEditing: (isEditing: boolean) => void;
  clearError: () => void;
}

export type NavigationStore = NavigationState & NavigationActions;

// ========================================
// FORM TYPES (Following Slider Pattern)
// ========================================

export interface MenuFormData {
  name: TranslatableEntity;
  description: TranslatableEntity;
  location: MenuLocation;
  order: number; // Add order field for menu ordering
  isActive: boolean;
  isPublished: boolean;
  categorySlug?: string; // New field for linking menu to category (optional)
}

export interface MenuItemFormData {
  title: TranslatableEntity;
  description: TranslatableEntity;
  url: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  icon: string;
  order: number;
  isActive: boolean;
  isVisible: boolean;
  isPublished: boolean;
  itemType: MenuItemType;
  itemId: string;
  categorySlug?: string; // New field for linking menu item to category (optional)
  contentSlug?: string; // New field for linking menu item to content (optional)
}
