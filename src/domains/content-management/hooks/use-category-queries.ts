import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/api/http-client";
import { categoryRepository } from "@/domains/content-management/repositories/category-repository";
import { ContentNotificationService } from "../services/content-notification-service";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/content";

// Backend API response structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string | string[];
  };
}

// Parse backend response
const parseApiResponse = <T>(response: any): T => {
  if (response?.success && response?.data !== undefined) {
    return response.data;
  }
  throw new Error(response?.error?.message || 'API response parsing failed');
};

// Fetch all categories
export const useCategories = (query: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['categories', query],
    queryFn: async (): Promise<{ data: Category[]; pagination?: any }> => {
      // Use repository which understands pagination and will slice results if backend returns full list
      const response = await categoryRepository.getCategories(query as any);
      return {
        data: response.data,
        pagination: response.pagination,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch category tree structure
export const useCategoryTree = () => {
  return useQuery({
    queryKey: ['category-tree'],
    queryFn: async (): Promise<Category[]> => {
      const response = await httpClient.get<ApiResponse<Category[]>>('/categories/tree');
      return parseApiResponse<Category[]>(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch active categories
export const useActiveCategories = () => {
  return useQuery({
    queryKey: ['active-categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await httpClient.get<ApiResponse<Category[]>>('/categories/active');
      return parseApiResponse<Category[]>(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch category by slug
export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['category-by-slug', slug],
    queryFn: async (): Promise<Category> => {
      const response = await httpClient.get<ApiResponse<Category>>(`/categories/${slug}`);
      return parseApiResponse<Category>(response);
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest): Promise<Category> => {
      const response = await httpClient.post<ApiResponse<Category>>('/admin/categories', data);
      return parseApiResponse<Category>(response);
    },
    onSuccess: (category) => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      queryClient.invalidateQueries({ queryKey: ['active-categories'] });
      ContentNotificationService.showCategoryCreated(getCategoryName(category));
    },
    onError: (error: any) => {
      // Extract the actual error message from the backend response structure
      let errorMessage = 'Failed to create category';
      
      // Try different error structures the backend might return
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.data?.error?.message) {
        errorMessage = error.data.error.message;
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      ContentNotificationService.showCategoryCreationError(errorMessage);
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryRequest }): Promise<Category> => {
      const response = await httpClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
      return parseApiResponse<Category>(response);
    },
    onSuccess: (category, { id }) => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      queryClient.invalidateQueries({ queryKey: ['active-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-by-slug', id] });
      ContentNotificationService.showCategoryUpdated(getCategoryName(category));
    },
    onError: (error: any) => {
      // Extract the actual error message from the backend response structure
      let errorMessage = 'Failed to update category';
      
      // Try different error structures the backend might return
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.data?.error?.message) {
        errorMessage = error.data.error.message;
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      ContentNotificationService.showCategoryUpdateError(errorMessage);
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🔍 Deleting category with ID:', id);
      await httpClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      queryClient.invalidateQueries({ queryKey: ['active-categories'] });
      ContentNotificationService.showCategoryDeleted();
    },
    onError: (error: any) => {
      console.log('🔍 DELETE MUTATION ERROR HANDLER CALLED');
      console.log('🔍 Delete error object:', error);
      
      // Test notification directly first
      ContentNotificationService.showError('Test Error', 'This is a test error notification');
      
      // Extract the actual error message from the backend response structure
      let errorMessage = 'Failed to delete category';
      
      // Try different error structures the backend might return
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.data?.error?.message) {
        errorMessage = error.data.error.message;
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log('🔍 Extracted error message:', errorMessage);
      ContentNotificationService.showCategoryDeletionError(errorMessage);
    },
  });
};

// Helper function to get category name for notifications
const getCategoryName = (category: Category): string => {
  if (category.name?.en) return category.name.en;
  if (category.name?.ne) return category.name.ne;
  return category.slug || 'Unnamed Category';
}; 