import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/api/http-client";
import { ContentNotificationService } from "../services/content-notification-service";
import type { 
  Content, 
  CreateContentRequest, 
  UpdateContentRequest, 
  ContentQuery,
  Category,
  ContentListResponse
} from "../types/content";

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

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Parse backend response
const parseApiResponse = <T>(response: any): T => {
  if (response?.success && response?.data !== undefined) {
    return response.data;
  }
  throw new Error(response?.error?.message || 'API response parsing failed');
};

// Parse paginated response
const parsePaginatedResponse = (response: any): ContentListResponse => {
  if (response?.success && response?.data && response?.pagination) {
    return {
      data: response.data,
      pagination: response.pagination
    };
  }
  throw new Error(response?.error?.message || 'Paginated response parsing failed');
};

// Fetch all content for admin
export const useAdminContents = (query: ContentQuery) => {
  return useQuery({
    queryKey: ['admin-contents', query],
    queryFn: async (): Promise<ContentListResponse> => {
      const response = await httpClient.get<PaginatedApiResponse<Content[]>>('/admin/content', { params: query });
      return parsePaginatedResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch published content (public)
export const usePublishedContents = (query: ContentQuery) => {
  return useQuery({
    queryKey: ['published-contents', query],
    queryFn: async (): Promise<ContentListResponse> => {
      const response = await httpClient.get<PaginatedApiResponse<Content[]>>('/content', { params: query });
      return parsePaginatedResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch content by ID
export const useContentById = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async (): Promise<Content> => {
      const response = await httpClient.get<ApiResponse<Content>>(`/admin/content/${id}`);
      return parseApiResponse(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch content by slug (public)
export const useContentBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['content-by-slug', slug],
    queryFn: async (): Promise<Content> => {
      const response = await httpClient.get<ApiResponse<Content>>(`/content/${slug}`);
      return parseApiResponse(response);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch featured content (public)
export const useFeaturedContents = () => {
  return useQuery({
    queryKey: ['featured-contents'],
    queryFn: async (): Promise<Content[]> => {
      const response = await httpClient.get<ApiResponse<Content[]>>('/content/featured');
      return parseApiResponse(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Search content (public)
export const useSearchContents = (query: ContentQuery) => {
  return useQuery({
    queryKey: ['search-contents', query],
    queryFn: async (): Promise<ContentListResponse> => {
      const response = await httpClient.get<PaginatedApiResponse<Content[]>>('/content/search', { params: query });
      return parsePaginatedResponse(response);
    },
    enabled: !!query.filters?.search,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch content by category (public)
export const useContentsByCategory = (categorySlug: string, query: ContentQuery) => {
  return useQuery({
    queryKey: ['contents-by-category', categorySlug, query],
    queryFn: async (): Promise<ContentListResponse> => {
      const response = await httpClient.get<PaginatedApiResponse<Content[]>>(`/content/category/${categorySlug}`, { params: query });
      return parsePaginatedResponse(response);
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create content mutation
export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateContentRequest): Promise<Content> => {
      const response = await httpClient.post<ApiResponse<Content>>('/admin/content', data);
      return parseApiResponse(response);
    },
    onSuccess: (content) => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['admin-contents'] });
      queryClient.invalidateQueries({ queryKey: ['published-contents'] });
      queryClient.invalidateQueries({ queryKey: ['featured-contents'] });
      ContentNotificationService.showContentCreated(getContentTitle(content));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create content';
      ContentNotificationService.showContentCreationError(errorMessage);
    },
  });
};

// Update content mutation
export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContentRequest }): Promise<Content> => {
      const response = await httpClient.put<ApiResponse<Content>>(`/admin/content/${id}`, data);
      return parseApiResponse(response);
    },
    onSuccess: (content, { id }) => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['admin-contents'] });
      queryClient.invalidateQueries({ queryKey: ['published-contents'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['featured-contents'] });
      ContentNotificationService.showContentUpdated(getContentTitle(content));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update content';
      ContentNotificationService.showContentUpdateError(errorMessage);
    },
  });
};

// Delete content mutation
export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await httpClient.delete(`/admin/content/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['admin-contents'] });
      queryClient.invalidateQueries({ queryKey: ['published-contents'] });
      queryClient.invalidateQueries({ queryKey: ['featured-contents'] });
      ContentNotificationService.showContentDeleted();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete content';
      ContentNotificationService.showContentDeletionError(errorMessage);
    },
  });
};

// Publish content mutation
export const usePublishContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<Content> => {
      const response = await httpClient.post<ApiResponse<Content>>(`/admin/content/${id}/publish`);
      return parseApiResponse(response);
    },
    onSuccess: (content, id) => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['admin-contents'] });
      queryClient.invalidateQueries({ queryKey: ['published-contents'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['featured-contents'] });
      ContentNotificationService.showPublishSuccess(getContentTitle(content));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish content';
      ContentNotificationService.showContentUpdateError(errorMessage);
    },
  });
};


// Get content statistics
export const useContentStatistics = () => {
  return useQuery({
    queryKey: ['content-statistics'],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<any>>('/admin/content/statistics');
      return parseApiResponse(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper function to get content title for notifications
const getContentTitle = (content: Content): string => {
  if (content.title?.en) return content.title.en;
  if (content.title?.ne) return content.title.ne;
  return content.slug || 'Untitled';
}; 