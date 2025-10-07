import { navigationRepository } from '../repositories/navigation-repository';
import { 
  Menu, 
  MenuItem,
  MenuListResponse, 
  MenuItemListResponse,
  MenuQuery, 
  MenuItemQuery,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuTreeResponse,
  BulkOperationResult
} from '../types/navigation';

export class NavigationService {

  // ========================================
  // MENU LIST OPERATIONS
  // ========================================

  static async getMenus(query: MenuQuery = {}): Promise<MenuListResponse> {
    try {
      const response = await navigationRepository.getAdminMenus(query);
      return NavigationService.normalizeMenuListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menus');
      throw error;
    }
  }

  static async searchMenus(searchTerm: string, query: MenuQuery = {}): Promise<MenuListResponse> {
    try {
      const response = await navigationRepository.searchAdminMenus({ ...query, search: searchTerm });
      return NavigationService.normalizeMenuListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      NavigationService.handleError(error, 'Failed to search menus');
      throw error;
    }
  }

  static async getPublishedMenus(query: MenuQuery = {}): Promise<MenuListResponse> {
    try {
      const response = await navigationRepository.getPublicMenus(query);
      return NavigationService.normalizeMenuListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch published menus');
      throw error;
    }
  }

  // ========================================
  // MENU CRUD OPERATIONS
  // ========================================

  static async getMenuById(id: string): Promise<Menu> {
    try {
      const response = await navigationRepository.getMenuById(id);
      return NavigationService.transformBackendMenu(response);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu');
      throw error;
    }
  }

  static async createMenu(data: CreateMenuRequest): Promise<Menu> {
    try {
      const response = await navigationRepository.createMenu(data);
      return NavigationService.transformBackendMenu(response);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to create menu');
      throw error;
    }
  }

  static async updateMenu(id: string, data: UpdateMenuRequest): Promise<Menu> {
    try {
      const response = await navigationRepository.updateMenu(id, data);
      const raw = NavigationService.extractMenuFromResponse(response);
      if (!NavigationService.isMenuLike(raw)) {
        const latest = await navigationRepository.getMenuById(id);
        return NavigationService.transformBackendMenu(NavigationService.extractMenuFromResponse(latest) ?? latest);
      }
      return NavigationService.transformBackendMenu(raw);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to update menu');
      throw error;
    }
  }

  static async deleteMenu(id: string): Promise<void> {
    try {
      await navigationRepository.deleteMenu(id);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to delete menu');
      throw error;
    }
  }

  // ========================================
  // MENU STATUS OPERATIONS
  // ========================================

  static async publishMenu(id: string): Promise<Menu> {
    try {
      const response = await navigationRepository.publishMenu(id);
      const raw = NavigationService.extractMenuFromResponse(response);
      if (!NavigationService.isMenuLike(raw)) {
        const latest = await navigationRepository.getMenuById(id);
        return NavigationService.transformBackendMenu(NavigationService.extractMenuFromResponse(latest) ?? latest);
      }
      return NavigationService.transformBackendMenu(raw);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to publish menu');
      throw error;
    }
  }

  static async unpublishMenu(id: string): Promise<Menu> {
    try {
      const response = await navigationRepository.unpublishMenu(id);
      const raw = NavigationService.extractMenuFromResponse(response);
      if (!NavigationService.isMenuLike(raw)) {
        const latest = await navigationRepository.getMenuById(id);
        return NavigationService.transformBackendMenu(NavigationService.extractMenuFromResponse(latest) ?? latest);
      }
      return NavigationService.transformBackendMenu(raw);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to unpublish menu');
      throw error;
    }
  }

  // ========================================
  // MENU ITEM OPERATIONS
  // ========================================

  static async getMenuItems(query: MenuItemQuery = {}): Promise<MenuItemListResponse> {
    try {
      const response = await navigationRepository.getAdminMenuItems(query);
      return NavigationService.normalizeMenuItemListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu items');
      throw error;
    }
  }

  static async getMenuItemById(id: string): Promise<MenuItem> {
    try {
      const response = await navigationRepository.getMenuItemById(id);
      return NavigationService.transformBackendMenuItem(response);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu item');
      throw error;
    }
  }

  static async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    try {
      const response = await navigationRepository.createMenuItem(data);
      return NavigationService.transformBackendMenuItem(response);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to create menu item');
      throw error;
    }
  }

  static async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
    try {
      const response = await navigationRepository.updateMenuItem(id, data);
      const raw = NavigationService.extractMenuItemFromResponse(response);
      if (!NavigationService.isMenuItemLike(raw)) {
        const latest = await navigationRepository.getMenuItemById(id);
        return NavigationService.transformBackendMenuItem(NavigationService.extractMenuItemFromResponse(latest) ?? latest);
      }
      return NavigationService.transformBackendMenuItem(raw);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to update menu item');
      throw error;
    }
  }

  static async deleteMenuItem(id: string): Promise<void> {
    try {
      await navigationRepository.deleteMenuItem(id);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to delete menu item');
      throw error;
    }
  }

  static async reorderMenuItems(orders: { id: string; order: number }[]): Promise<void> {
    try {
      await navigationRepository.reorderMenuItems(orders);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to reorder menu items');
      throw error;
    }
  }

  static async reorderMenus(orders: { id: string; order: number }[]): Promise<void> {
    try {
      await navigationRepository.reorderMenus(orders);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to reorder menus');
      throw error;
    }
  }

  // ========================================
  // MENU LOCATION & TREE OPERATIONS
  // ========================================

  static async getMenuByLocation(location: string): Promise<Menu> {
    try {
      const response = await navigationRepository.getMenuByLocation(location);
      return NavigationService.transformBackendMenu(response);
    } catch (error) {
      NavigationService.handleError(error, `Failed to fetch menu for location: ${location}`);
      throw error;
    }
  }

  static async getMenuTree(id: string): Promise<MenuTreeResponse> {
    try {
      const response = await navigationRepository.getMenuTree(id);
      return {
        menu: NavigationService.transformBackendMenu(response.menu),
        items: response.items?.map((item: any) => NavigationService.transformBackendMenuItem(item)) || []
      };
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu tree');
      throw error;
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async bulkPublishMenus(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await navigationRepository.bulkPublishMenus(ids);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to bulk publish menus');
      throw error;
    }
  }

  static async bulkUnpublishMenus(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await navigationRepository.bulkUnpublishMenus(ids);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to bulk unpublish menus');
      throw error;
    }
  }

  static async bulkDeleteMenus(ids: string[]): Promise<BulkOperationResult> {
    try {
      return await navigationRepository.bulkDeleteMenus(ids);
    } catch (error) {
      NavigationService.handleError(error, 'Failed to bulk delete menus');
      throw error;
    }
  }

  // ========================================
  // STATISTICS
  // ========================================

  static async getMenuStatistics(): Promise<any> {
    try {
      const response = await navigationRepository.getMenuStatistics();
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu statistics');
      throw error;
    }
  }

  static async getMenuItemStatistics(): Promise<any> {
    try {
      const response = await navigationRepository.getMenuItemStatistics();
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to fetch menu item statistics');
      throw error;
    }
  }

  // ========================================
  // IMPORT/EXPORT
  // ========================================

  static async exportMenus(query: MenuQuery, format: string): Promise<Buffer> {
    try {
      const response = await navigationRepository.exportMenus(query, format);
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to export menus');
      throw error;
    }
  }

  static async exportMenuItems(query: MenuItemQuery, format: string): Promise<Buffer> {
    try {
      const response = await navigationRepository.exportMenuItems(query, format);
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to export menu items');
      throw error;
    }
  }

  static async importMenus(file: FormData): Promise<any> {
    try {
      const response = await navigationRepository.importMenus(file);
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to import menus');
      throw error;
    }
  }

  static async importMenuItems(file: FormData): Promise<any> {
    try {
      const response = await navigationRepository.importMenuItems(file);
      return response;
    } catch (error) {
      NavigationService.handleError(error, 'Failed to import menu items');
      throw error;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Compute a human-friendly menu name with sensible fallbacks.
   */
  static getDisplayName(menu: Menu | null | undefined): string {
    if (!menu) return 'Untitled';
    const nameEn = menu.name?.en?.trim();
    const nameNe = menu.name?.ne?.trim();
    if (nameEn) return nameEn;
    if (nameNe) return nameNe;
    return 'Untitled';
  }

  /**
   * Compute a human-friendly menu item title with sensible fallbacks.
   */
  static getDisplayTitle(menuItem: MenuItem | null | undefined): string {
    if (!menuItem) return 'Untitled';
    const titleEn = menuItem.title?.en?.trim();
    const titleNe = menuItem.title?.ne?.trim();
    if (titleEn) return titleEn;
    if (titleNe) return titleNe;
    return 'Untitled';
  }

  private static normalizeMenuListResponse(response: any, fallback: { page: number; limit: number }) {
    if (!response) {
      return {
        data: [],
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    if (response.data && response.pagination) {
      return {
        data: Array.isArray(response.data) ? response.data.map(NavigationService.transformBackendMenu) : [],
        pagination: response.pagination
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response.map(NavigationService.transformBackendMenu),
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: response.length,
          totalPages: Math.ceil(response.length / fallback.limit),
          hasNext: false,
          hasPrev: false
        }
      };
    }

    return {
      data: [NavigationService.transformBackendMenu(response)],
      pagination: {
        page: fallback.page,
        limit: fallback.limit,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  private static normalizeMenuItemListResponse(response: any, fallback: { page: number; limit: number }) {
    if (!response) {
      return {
        data: [],
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    if (response.data && response.pagination) {
      return {
        data: Array.isArray(response.data) ? response.data.map(NavigationService.transformBackendMenuItem) : [],
        pagination: response.pagination
      };
    }

    if (Array.isArray(response)) {
      return {
        data: response.map(NavigationService.transformBackendMenuItem),
        pagination: {
          page: fallback.page,
          limit: fallback.limit,
          total: response.length,
          totalPages: Math.ceil(response.length / fallback.limit),
          hasNext: false,
          hasPrev: false
        }
      };
    }

    return {
      data: [NavigationService.transformBackendMenuItem(response)],
      pagination: {
        page: fallback.page,
        limit: fallback.limit,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  private static extractMenuFromResponse(response: any): any | null {
    if (!response) return null;
    const candidate = response.data ?? response;
    return candidate ?? null;
  }

  private static extractMenuItemFromResponse(response: any): any | null {
    if (!response) return null;
    const candidate = response.data ?? response;
    return candidate ?? null;
  }

  private static isMenuLike(value: any): boolean {
    if (!value || typeof value !== 'object') return false;
    if (value.id || value._id) return true;
    if ('name' in value || 'location' in value) return true;
    return false;
  }

  private static isMenuItemLike(value: any): boolean {
    if (!value || typeof value !== 'object') return false;
    if (value.id || value._id) return true;
    if ('title' in value || 'itemType' in value) return true;
    return false;
  }

  private static transformBackendMenu(backendMenu: any): Menu {
    if (!backendMenu) {
      throw new Error('Invalid menu data received from backend');
    }

    // Debug: Log the backend menu data
  // backend menu data processed

    const name: any = (() => {
      const rawName = backendMenu.name;
      const nameEn = backendMenu.nameEn || backendMenu.name_en;
      const nameNe = backendMenu.nameNe || backendMenu.name_ne;

      if (rawName && typeof rawName === 'object') {
        return {
          en: (rawName.en ?? nameEn ?? '').toString(),
          ne: (rawName.ne ?? nameNe ?? '').toString(),
        };
      }
      if (typeof rawName === 'string') {
        return { en: rawName, ne: (nameNe ?? '').toString() };
      }
      if (nameEn || nameNe) {
        return { en: (nameEn ?? '').toString(), ne: (nameNe ?? '').toString() };
      }
      return { en: '', ne: '' };
    })();

    const description: any = (() => {
      const rawDesc = backendMenu.description;
      const descEn = backendMenu.descriptionEn || backendMenu.description_en;
      const descNe = backendMenu.descriptionNe || backendMenu.description_ne;

      if (rawDesc && typeof rawDesc === 'object') {
        return {
          en: (rawDesc.en ?? descEn ?? '').toString(),
          ne: (rawDesc.ne ?? descNe ?? '').toString(),
        };
      }
      if (typeof rawDesc === 'string') {
        return { en: rawDesc, ne: (descNe ?? '').toString() };
      }
      if (descEn || descNe) {
        return { en: (descEn ?? '').toString(), ne: (descNe ?? '').toString() };
      }
      return undefined;
    })();

    return {
      id: backendMenu.id || backendMenu._id || '',
      name,
      description,
      location: backendMenu.location || 'CUSTOM',
      order: backendMenu.order ?? 0, // Add order field with default value
      isActive: backendMenu.isActive ?? true,
      isPublished: backendMenu.isPublished ?? false,
      categorySlug: backendMenu.categorySlug || undefined, // Add categorySlug field
      menuItemCount: backendMenu.menuItemCount || 0,
      menuItems: backendMenu.menuItems?.map((item: any) => NavigationService.transformBackendMenuItem(item)) || [],
      createdAt: backendMenu.createdAt ? new Date(backendMenu.createdAt) : new Date(),
      updatedAt: backendMenu.updatedAt ? new Date(backendMenu.updatedAt) : new Date(),
      createdBy: backendMenu.createdBy || null,
      updatedBy: backendMenu.updatedBy || null,
    };
  }

  private static transformBackendMenuItem(backendMenuItem: any): MenuItem {
    if (!backendMenuItem) {
      throw new Error('Invalid menu item data received from backend');
    }

    const title: any = (() => {
      const rawTitle = backendMenuItem.title;
      const titleEn = backendMenuItem.titleEn || backendMenuItem.title_en;
      const titleNe = backendMenuItem.titleNe || backendMenuItem.title_ne;

      if (rawTitle && typeof rawTitle === 'object') {
        return {
          en: (rawTitle.en ?? titleEn ?? '').toString(),
          ne: (rawTitle.ne ?? titleNe ?? '').toString(),
        };
      }
      if (typeof rawTitle === 'string') {
        return { en: rawTitle, ne: (titleNe ?? '').toString() };
      }
      if (titleEn || titleNe) {
        return { en: (titleEn ?? '').toString(), ne: (titleNe ?? '').toString() };
      }
      return { en: '', ne: '' };
    })();

    const description: any = (() => {
      const rawDesc = backendMenuItem.description;
      const descEn = backendMenuItem.descriptionEn || backendMenuItem.description_en;
      const descNe = backendMenuItem.descriptionNe || backendMenuItem.description_ne;

      if (rawDesc && typeof rawDesc === 'object') {
        return {
          en: (rawDesc.en ?? descEn ?? '').toString(),
          ne: (rawDesc.ne ?? descNe ?? '').toString(),
        };
      }
      if (typeof rawDesc === 'string') {
        return { en: rawDesc, ne: (descNe ?? '').toString() };
      }
      if (descEn || descNe) {
        return { en: (descEn ?? '').toString(), ne: (descNe ?? '').toString() };
      }
      return undefined;
    })();

    return {
      id: backendMenuItem.id || backendMenuItem._id || '',
      menuId: backendMenuItem.menuId || '',
      parentId: backendMenuItem.parentId || undefined,
      title,
      description,
      url: backendMenuItem.url || '',
      target: backendMenuItem.target || 'self',
      icon: backendMenuItem.icon || '',
      order: backendMenuItem.order || 0,
      isActive: backendMenuItem.isActive ?? true,
      isVisible: backendMenuItem.isVisible ?? true,
      isPublished: backendMenuItem.isPublished ?? false,
      itemType: backendMenuItem.itemType || 'LINK',
      itemId: backendMenuItem.itemId || '',
      children: backendMenuItem.children?.map((child: any) => NavigationService.transformBackendMenuItem(child)) || [],
      createdAt: backendMenuItem.createdAt ? new Date(backendMenuItem.createdAt) : new Date(),
      updatedAt: backendMenuItem.updatedAt ? new Date(backendMenuItem.updatedAt) : new Date(),
      createdBy: backendMenuItem.createdBy || null,
      updatedBy: backendMenuItem.updatedBy || null,
    };
  }

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`NavigationService Error: ${defaultMessage}`, error);
    
    if (error instanceof Error) {
      throw new Error(`${defaultMessage}: ${error.message}`);
    }
    
    throw new Error(defaultMessage);
  }
}
