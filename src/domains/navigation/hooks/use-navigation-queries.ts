import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/http-client';
import type { 
  Menu, 
  MenuItem, 
  CreateMenuRequest, 
  UpdateMenuRequest, 
  CreateMenuItemRequest, 
  UpdateMenuItemRequest,
  MenuQuery,
  MenuItemQuery,
  MenuListResponse,
  MenuItemListResponse,
  BulkOperationResult
} from '../types/navigation';
import { NavigationService } from '../services/navigation-service';
import { NotificationService } from '@/services/notification-service';
import { 
  MenuTreeResponse
} from '../types/navigation';

export const navigationKeys = {
  all: ['navigation'] as const,
  menus: {
    all: ['navigation', 'menus'] as const,
    list: (query: Partial<MenuQuery> = {}) => [...navigationKeys.menus.all, 'list', query] as const,
    detail: (id: string) => [...navigationKeys.menus.all, 'detail', id] as const,
    location: (location: string) => [...navigationKeys.menus.all, 'location', location] as const,
    tree: (id: string) => [...navigationKeys.menus.all, 'tree', id] as const,
    stats: () => [...navigationKeys.menus.all, 'stats'] as const,
  },
  menuItems: {
    all: ['navigation', 'menuItems'] as const,
    list: (query: Partial<MenuItemQuery> = {}) => [...navigationKeys.menuItems.all, 'list', query] as const,
    detail: (id: string) => [...navigationKeys.menuItems.all, 'detail', id] as const,
    byMenu: (menuId: string, query?: Partial<MenuItemQuery>) => [...navigationKeys.menuItems.all, 'byMenu', menuId, query] as const,
    byParent: (parentId?: string) => [...navigationKeys.menuItems.all, 'byParent', parentId] as const,
    breadcrumb: (itemId: string) => [...navigationKeys.menuItems.all, 'breadcrumb', itemId] as const,
    stats: () => [...navigationKeys.menuItems.all, 'stats'] as const,
  },
};

// ========================================
// MENU QUERIES
// ========================================

export const useMenus = (query: Partial<MenuQuery> = {}) => {
  return useQuery<MenuListResponse>({
    queryKey: navigationKeys.menus.list(query),
    queryFn: () => NavigationService.getMenus(query),
    placeholderData: (previousData) => previousData,
  });
};

export const usePublishedMenus = (query: Partial<MenuQuery> = {}) => {
  return useQuery<MenuListResponse>({
    queryKey: navigationKeys.menus.list({ ...query, isPublished: true }),
    queryFn: () => NavigationService.getPublishedMenus(query),
  });
};

export const useMenu = (id: string, enabled = true) => {
  return useQuery<Menu>({
    queryKey: navigationKeys.menus.detail(id),
    queryFn: () => NavigationService.getMenuById(id),
    enabled: !!id && enabled,
  });
};

export const useMenuByLocation = (location: string, enabled = true) => {
  return useQuery<Menu>({
    queryKey: navigationKeys.menus.location(location),
    queryFn: () => NavigationService.getMenuByLocation(location),
    enabled: !!location && enabled,
  });
};

export const useMenuTree = (id: string, enabled = true) => {
  return useQuery<MenuTreeResponse>({
    queryKey: navigationKeys.menus.tree(id),
    queryFn: () => NavigationService.getMenuTree(id),
    enabled: !!id && enabled,
  });
};

export const useMenuStatistics = () => {
  return useQuery<any>({
    queryKey: navigationKeys.menus.stats(),
    queryFn: () => NavigationService.getMenuStatistics(),
  });
};

// ========================================
// MENU ITEM QUERIES
// ========================================

export const useMenuItems = (query: Partial<MenuItemQuery> = {}) => {
  return useQuery<MenuItemListResponse>({
    queryKey: navigationKeys.menuItems.list(query),
    queryFn: () => NavigationService.getMenuItems(query),
    placeholderData: (previousData) => previousData,
  });
};

export const useMenuItem = (id: string, enabled = true) => {
  return useQuery<MenuItem>({
    queryKey: navigationKeys.menuItems.detail(id),
    queryFn: () => NavigationService.getMenuItemById(id),
    enabled: !!id && enabled,
  });
};

export const useMenuItemsByMenu = (menuId: string, query: Partial<MenuItemQuery> = {}) => {
  return useQuery<MenuItemListResponse>({
    queryKey: navigationKeys.menuItems.byMenu(menuId, query),
    queryFn: () => NavigationService.getMenuItems({ ...query, menuId }),
    enabled: !!menuId,
  });
};

export const useMenuItemsByParent = (parentId?: string) => {
  return useQuery<MenuItemListResponse>({
    queryKey: navigationKeys.menuItems.byParent(parentId),
    queryFn: () => NavigationService.getMenuItems({ parentId }),
    enabled: parentId !== undefined,
  });
};

export const useMenuItemBreadcrumb = (itemId: string, enabled = true) => {
  return useQuery<MenuItemListResponse>({
    queryKey: navigationKeys.menuItems.breadcrumb(itemId),
    queryFn: () => NavigationService.getMenuItems({ parentId: itemId }),
    enabled: !!itemId && enabled,
  });
};

export const useMenuItemStatistics = () => {
  return useQuery<any>({
    queryKey: navigationKeys.menuItems.stats(),
    queryFn: () => NavigationService.getMenuItemStatistics(),
  });
};

// ========================================
// MENU MUTATIONS
// ========================================

export const useCreateMenu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMenuRequest) => {
      try {
        const result = await NavigationService.createMenu(data);
        return result;
      } catch (error) {
        console.error('❌ useCreateMenu - NavigationService.createMenu failed:', error);
        throw error;
      }
    },
    onSuccess: (menu) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('❌ useCreateMenu - onError called with:', error);
      console.error('❌ useCreateMenu - Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    },
    onSettled: (data, error) => {
    }
  });
};

export const useUpdateMenu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuRequest }) => 
      NavigationService.updateMenu(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.list({}) });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.detail(updated.id) });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to update menu:', error);
    },
  });
};

export const useDeleteMenu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NavigationService.deleteMenu(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification
    },
    onError: (error) => {
      console.error('❌ Failed to delete menu:', error);
      // Show error notification
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu';
      console.error('Delete error:', errorMessage);
    },
  });
};

export const usePublishMenu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NavigationService.publishMenu(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.list({}) });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.detail(updated.id) });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to publish menu:', error);
    },
  });
};

export const useUnpublishMenu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NavigationService.unpublishMenu(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.list({}) });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.detail(updated.id) });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to unpublish menu:', error);
    },
  });
};

// ========================================
// MENU ITEM MUTATIONS
// ========================================

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuItemRequest) => NavigationService.createMenuItem(data),
    onSuccess: (menuItem) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.all });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.detail(menuItem.menuId) });
      try {
        const title = NavigationService.getDisplayTitle(menuItem);
        NotificationService.showCreateSuccess(title);
      } catch (e) {
        console.warn('NotificationService.showCreateSuccess failed', e);
      }
    },
    onError: (error) => {
      console.error('Failed to create menu item:', error);
      try {
        const message = error instanceof Error ? error.message : 'Failed to create menu item';
        NotificationService.showCreateError(message);
      } catch (e) {
        console.warn('NotificationService.showCreateError failed', e);
      }
    },
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemRequest }) => 
      NavigationService.updateMenuItem(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.list({}) });
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.detail(updated.id) });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.detail(updated.menuId) });
      try {
        const title = NavigationService.getDisplayTitle((updated as any));
        NotificationService.showUpdateSuccess(title);
      } catch (e) {
        console.warn('NotificationService.showUpdateSuccess failed', e);
      }
    },
    onError: (error) => {
      console.error('Failed to update menu item:', error);
      try {
        const message = error instanceof Error ? error.message : 'Failed to update menu item';
        NotificationService.showUpdateError(message);
      } catch (e) {
        console.warn('NotificationService.showUpdateError failed', e);
      }
    },
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NavigationService.deleteMenuItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.all });
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification
  // Mutation handlers executed
    },
    onError: (error) => {
      console.error('❌ Failed to delete menu item:', error);
      // Show error notification
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
      console.error('Delete error:', errorMessage);
    },
  });
};

export const useReorderMenuItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) => 
      NavigationService.reorderMenuItems(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to reorder menu items:', error);
    },
  });
};

export const useReorderMenus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) => 
      NavigationService.reorderMenus(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to reorder menus:', error);
    },
  });
};

// ========================================
// BULK OPERATIONS
// ========================================

export const useBulkPublishMenus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => NavigationService.bulkPublishMenus(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to bulk publish menus:', error);
    },
  });
};

export const useBulkUnpublishMenus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => NavigationService.bulkUnpublishMenus(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to bulk unpublish menus:', error);
    },
  });
};

export const useBulkDeleteMenus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => NavigationService.bulkDeleteMenus(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to bulk delete menus:', error);
    },
  });
};

// ========================================
// IMPORT/EXPORT OPERATIONS
// ========================================

export const useExportMenus = () => {
  return useMutation({
    mutationFn: ({ query, format }: { query: MenuQuery; format: string }) => 
      NavigationService.exportMenus(query, format),
    onError: (error) => {
      console.error('Failed to export menus:', error);
    },
  });
};

export const useExportMenuItems = () => {
  return useMutation({
    mutationFn: ({ query, format }: { query: MenuItemQuery; format: string }) => 
      NavigationService.exportMenuItems(query, format),
    onError: (error) => {
      console.error('Failed to export menu items:', error);
    },
  });
};

export const useImportMenus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: FormData) => NavigationService.importMenus(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menus.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to import menus:', error);
    },
  });
};

export const useImportMenuItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: FormData) => NavigationService.importMenuItems(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: navigationKeys.menuItems.all });
      // Show success notification here if you have a notification service
    },
    onError: (error) => {
      console.error('Failed to import menu items:', error);
    },
  });
};

// Hook for fetching categories for autocomplete
export const useCategoriesForNavigation = () => {
  return useQuery({
    queryKey: ['categories-for-navigation'],
    queryFn: async (): Promise<{ data: any[] }> => {
      const response = await httpClient.get('/categories', { 
        params: { page: 1, limit: 100, isActive: true } 
      });
      // Handle different response structures
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching content by category for autocomplete
export const useContentByCategoryForNavigation = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['content-by-category-for-navigation', categorySlug],
    queryFn: async (): Promise<{ data: any[] }> => {
      if (!categorySlug) return { data: [] };
      const response = await httpClient.get(`/content/category/${categorySlug}`, { 
        params: { page: 1, limit: 100, status: 'PUBLISHED' } 
      });
      // Handle different response structures
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for searching content for autocomplete
export const useSearchContentForNavigation = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-content-for-navigation', searchTerm],
    queryFn: async (): Promise<{ data: any[] }> => {
      if (!searchTerm.trim()) return { data: [] };
      const response = await httpClient.get('/content/search', { 
        params: { q: searchTerm, limit: 20, status: 'PUBLISHED' } 
      });
      // Handle different response structures
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    enabled: !!searchTerm.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
