import { httpClient } from '@/lib/api/http-client';
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
  BulkOperationResult,
  MenuTreeResponse,
} from '../types/navigation';

/**
 * Repository responsible for direct API interactions for Navigation.
 * This layer should be the ONLY place that talks to the HTTP client.
 * Services and stores must depend on this repository rather than httpClient directly.
 */
export interface NavigationRepository {
  // Menu Operations
  getPublicMenus(params?: Partial<MenuQuery>): Promise<any>;
  getAdminMenus(params?: Partial<MenuQuery>): Promise<any>;
  searchAdminMenus(params: Partial<MenuQuery> & { search: string }): Promise<any>;
  getMenuById(id: string): Promise<any>;
  createMenu(data: CreateMenuRequest): Promise<any>;
  updateMenu(id: string, data: UpdateMenuRequest): Promise<any>;
  deleteMenu(id: string): Promise<any>;
  publishMenu(id: string): Promise<any>;
  unpublishMenu(id: string): Promise<any>;
  getMenuByLocation(location: string): Promise<any>;
  getMenuTree(id: string): Promise<any>;
  
  // Menu Item Operations
  getPublicMenuItems(params?: Partial<MenuItemQuery>): Promise<any>;
  getAdminMenuItems(params?: Partial<MenuItemQuery>): Promise<any>;
  searchAdminMenuItems(params: Partial<MenuItemQuery> & { search: string }): Promise<any>;
  getMenuItemById(id: string): Promise<any>;
  createMenuItem(data: CreateMenuItemRequest): Promise<any>;
  updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<any>;
  deleteMenuItem(id: string): Promise<any>;
  getMenuItemsByMenu(menuId: string, params?: Partial<MenuItemQuery>): Promise<any>;
  getMenuItemsByParent(parentId?: string): Promise<any>;
  getBreadcrumb(itemId: string): Promise<any>;
  reorderMenuItems(orders: { id: string; order: number }[]): Promise<any>;
  reorderMenus(orders: { id: string; order: number }[]): Promise<any>;
  
  // Bulk Operations
  bulkPublishMenus(ids: string[]): Promise<any>;
  bulkUnpublishMenus(ids: string[]): Promise<any>;
  bulkDeleteMenus(ids: string[]): Promise<any>;
  
  // Statistics
  getMenuStatistics(): Promise<any>;
  getMenuItemStatistics(): Promise<any>;
  
  // Import/Export
  exportMenus(query: MenuQuery, format: string): Promise<any>;
  exportMenuItems(query: MenuItemQuery, format: string): Promise<any>;
  importMenus(file: FormData): Promise<any>;
  importMenuItems(file: FormData): Promise<any>;
}

class NavigationRepositoryImpl implements NavigationRepository {
  // Since environment adds /api/v1 prefix, we need to use paths that will result in correct URLs
  // Environment: http://localhost:3005/api/v1
  // We want: http://localhost:3000/admin/menus
  // So we use: /admin/menus (which becomes http://localhost:3005/api/v1/admin/menus)
  // But we need to override the base URL for navigation endpoints
  private readonly BASE_URL = '/menus';
  private readonly ADMIN_URL = '/admin/menus';
  private readonly MENU_ITEMS_URL = '/menu-items';
  private readonly ADMIN_MENU_ITEMS_URL = '/admin/menu-items';

  // ========================================
  // MENU OPERATIONS
  // ========================================

  async getPublicMenus(params: Partial<MenuQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.BASE_URL}`, { params });
  }

  async getAdminMenus(params: Partial<MenuQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}`, { params });
  }

  async searchAdminMenus(params: Partial<MenuQuery> & { search: string }): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}`, { params });
  }

  async getMenuById(id: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/${id}`);
  }

  async createMenu(data: CreateMenuRequest): Promise<any> {
    
    try {
      const response = await httpClient.post<any>(`${this.ADMIN_URL}`, data);
    // Repository actions executed
      return response;
    } catch (error) {
      console.error('❌ NavigationRepository - createMenu error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('❌ NavigationRepository - Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            headers: axiosError.config?.headers
          }
        });
      }
      throw error;
    }
  }

  async updateMenu(id: string, data: UpdateMenuRequest): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_URL}/${id}`, data);
  }

  async deleteMenu(id: string): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_URL}/${id}`);
  }

  async publishMenu(id: string): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/${id}/publish`);
  }

  async unpublishMenu(id: string): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/${id}/unpublish`);
  }

  async getMenuByLocation(location: string): Promise<any> {
    return httpClient.get<any>(`${this.BASE_URL}/location/${location}`);
  }

  async getMenuTree(id: string): Promise<any> {
    return httpClient.get<any>(`${this.BASE_URL}/${id}/tree`);
  }

  // ========================================
  // MENU ITEM OPERATIONS
  // ========================================

  async getPublicMenuItems(params: Partial<MenuItemQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.MENU_ITEMS_URL}`, { params });
  }

  async getAdminMenuItems(params: Partial<MenuItemQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_MENU_ITEMS_URL}`, { params });
  }

  async searchAdminMenuItems(params: Partial<MenuItemQuery> & { search: string }): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_MENU_ITEMS_URL}`, { params });
  }

  async getMenuItemById(id: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_MENU_ITEMS_URL}/${id}`);
  }

  async createMenuItem(data: CreateMenuItemRequest): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_MENU_ITEMS_URL}`, data);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_MENU_ITEMS_URL}/${id}`, data);
  }

  async deleteMenuItem(id: string): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_MENU_ITEMS_URL}/${id}`);
  }

  async getMenuItemsByMenu(menuId: string, params: Partial<MenuItemQuery> = {}): Promise<any> {
    return httpClient.get<any>(`${this.MENU_ITEMS_URL}/menu/${menuId}`, { params });
  }

  async getMenuItemsByParent(parentId?: string): Promise<any> {
    const url = parentId ? `${this.MENU_ITEMS_URL}?parentId=${parentId}` : `${this.MENU_ITEMS_URL}`;
    return httpClient.get<any>(url);
  }

  async getBreadcrumb(itemId: string): Promise<any> {
    return httpClient.get<any>(`${this.MENU_ITEMS_URL}/${itemId}/breadcrumb`);
  }

  async reorderMenuItems(orders: { id: string; order: number }[]): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_MENU_ITEMS_URL}/reorder`, orders);
  }

  async reorderMenus(orders: { id: string; order: number }[]): Promise<any> {
    return httpClient.put<any>(`${this.ADMIN_URL}/reorder`, orders);
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  async bulkPublishMenus(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-publish`, { ids });
  }

  async bulkUnpublishMenus(ids: string[]): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/bulk-unpublish`, { ids });
  }

  async bulkDeleteMenus(ids: string[]): Promise<any> {
    return httpClient.delete<any>(`${this.ADMIN_URL}/bulk-delete`, { 
      params: { ids: ids.join(',') } 
    });
  }

  // ========================================
  // STATISTICS
  // ========================================

  async getMenuStatistics(): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/statistics`);
  }

  async getMenuItemStatistics(): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_MENU_ITEMS_URL}/statistics`);
  }

  // ========================================
  // IMPORT/EXPORT
  // ========================================

  async exportMenus(query: MenuQuery, format: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_URL}/export`, { 
      params: { ...query, format },
      responseType: 'blob'
    });
  }

  async exportMenuItems(query: MenuItemQuery, format: string): Promise<any> {
    return httpClient.get<any>(`${this.ADMIN_MENU_ITEMS_URL}/export`, { 
      params: { ...query, format },
      responseType: 'blob'
    });
  }

  async importMenus(file: FormData): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_URL}/import`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async importMenuItems(file: FormData): Promise<any> {
    return httpClient.post<any>(`${this.ADMIN_MENU_ITEMS_URL}/import`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const navigationRepository: NavigationRepository = new NavigationRepositoryImpl();
