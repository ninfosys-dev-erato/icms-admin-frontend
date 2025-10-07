import { httpClient } from '@/lib/api/http-client';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryListResponse, 
  CategoryQuery
} from '../types/content';

/**
 * Repository responsible for direct API interactions for Categories.
 * This layer should be the ONLY place that talks to the HTTP client.
 */
export interface CategoryRepository {
  getCategories(query?: CategoryQuery): Promise<CategoryListResponse>;
  getCategoryTree(): Promise<CategoryListResponse>;
  getCategoryById(id: string): Promise<Category>;
  createCategory(data: CreateCategoryRequest): Promise<Category>;
  updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

class CategoryRepositoryImpl implements CategoryRepository {
  private readonly BASE_URL = '/admin/categories';

  /**
   * Get all categories with filtering and pagination
   */
  async getCategories(query: CategoryQuery = {}): Promise<CategoryListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
      
      // Add filters if they exist
      if (query.filters) {
        if (query.filters.search) params.append('search', query.filters.search);
        if (query.filters.parentId) params.append('parentId', query.filters.parentId);
        if (query.filters.isActive !== undefined) params.append('isActive', query.filters.isActive.toString());
        if (query.filters.level !== undefined) params.append('level', query.filters.level.toString());
      }

  const requestUrl = `${this.BASE_URL}?${params.toString()}`;
  // Debug request URL
  // eslint-disable-next-line no-console
  console.debug('CategoryRepository.getCategories request', { requestUrl });
  const response = await httpClient.get(requestUrl);
      // Handle the actual API response format
      if (!response.data || typeof response.data !== 'object') {
        return {
          data: [],
          pagination: {
            page: query.page || 1,
            limit: query.limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        } as CategoryListResponse;
      }

      // The API returns { success: true, data: [...], meta: {...} }
      const apiData = response.data as any;

      // Support responses where the API wraps data in { data: [...] } and may include pagination meta
      const wrappedData = apiData && apiData.data && Array.isArray(apiData.data) ? apiData.data : null;

      // If server provided pagination metadata (common patterns: pagination, meta, or paging), use it directly
      const serverPagination = apiData?.pagination || apiData?.meta || apiData?.paging || apiData?.pageInfo;

      if (serverPagination && wrappedData && Array.isArray(wrappedData)) {
        const total = Number(serverPagination.total ?? serverPagination.totalItems ?? wrappedData.length) || wrappedData.length;
        const serverLimit = Number(serverPagination.limit ?? serverPagination.pageSize ?? 0) || 0;
        const serverPage = Number(serverPagination.page ?? serverPagination.currentPage ?? query.page ?? 1) || (query.page || 1);
        // If server didn't provide a limit, fall back to requested or 10
        const requestedLimit = Number(query.limit ?? serverLimit ?? 10);
        const limit = serverLimit || requestedLimit || 10;
        const page = serverPage;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        // If the client requested a larger page size than the server enforces, fetch additional pages
        let finalData = wrappedData;
        if (requestedLimit > serverLimit && serverLimit > 0) {
          // Calculate how many additional pages we need to fetch to reach requestedLimit
          const needed = Math.min(requestedLimit, total) - finalData.length;
          if (needed > 0) {
            // Build base params excluding page/limit so we can fetch further pages
            const baseParams = new URLSearchParams();
            if (query.sortBy) baseParams.append('sortBy', query.sortBy);
            if (query.sortOrder) baseParams.append('sortOrder', query.sortOrder);
            if (query.filters) {
              if (query.filters.search) baseParams.append('search', query.filters.search);
              if (query.filters.parentId) baseParams.append('parentId', query.filters.parentId);
              if (query.filters.isActive !== undefined) baseParams.append('isActive', query.filters.isActive.toString());
              if (query.filters.level !== undefined) baseParams.append('level', query.filters.level.toString());
            }

            let nextPage = page + 1;
            while (finalData.length < Math.min(requestedLimit, total)) {
              const p = new URLSearchParams(baseParams.toString());
              p.set('page', String(nextPage));
              p.set('limit', String(serverLimit));
              const nextUrl = `${this.BASE_URL}?${p.toString()}`;
              // eslint-disable-next-line no-console
              console.debug('CategoryRepository.getCategories fetching extra page', { nextUrl });
              // Fetch next page
              // eslint-disable-next-line no-await-in-loop
              const extraResp = await httpClient.get(nextUrl);
              const extraApiData = extraResp.data as any;
              const extraWrapped = extraApiData && extraApiData.data && Array.isArray(extraApiData.data) ? extraApiData.data : (Array.isArray(extraApiData) ? extraApiData : null);
              if (!extraWrapped || !Array.isArray(extraWrapped) || extraWrapped.length === 0) break;
              finalData = finalData.concat(extraWrapped);
              nextPage += 1;
            }

            // Trim to requestedLimit if we fetched extra
            if (finalData.length > requestedLimit) {
              finalData = finalData.slice(0, requestedLimit);
            }
          }
        }

        return {
          data: finalData,
          pagination: {
            page,
            limit: requestedLimit,
            total,
            totalPages: Math.max(1, Math.ceil(total / (serverLimit || requestedLimit || 10))),
            hasNext: page < Math.max(1, Math.ceil(total / (serverLimit || requestedLimit || 10))),
            hasPrev: page > 1,
            // debug helpers
            _requestUrl: requestUrl,
            _serverMeta: serverPagination,
          }
        } as unknown as CategoryListResponse;
      }

      // Otherwise, fall back to treating the response as a raw array (either at root or in data)
      let list = wrappedData ?? apiData;

      if (!list || !Array.isArray(list)) {
        return {
          data: [],
          pagination: {
            page: query.page || 1,
            limit: query.limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        } as CategoryListResponse;
      }
      // If backend returned the full list regardless of page/limit, or returned inconsistent pagination
      // (e.g. meta/page always 1), slice it here so the client only gets the requested page.
      const total = list.length;
      const limit = query.limit || 10;
      const page = query.page && query.page > 0 ? query.page : 1;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      // Detect inconsistent server pagination: server provided pagination meta but it doesn't match requested page/limit
      const serverMeta = apiData?.pagination || apiData?.meta || apiData?.paging || apiData?.pageInfo || null;
      const inconsistentServerPaging = serverMeta && (
        Number(serverMeta.page ?? serverMeta.currentPage ?? serverMeta.pageNumber ?? 0) !== page ||
        Number(serverMeta.limit ?? serverMeta.pageSize ?? 0) !== limit
      );

      // Debug response info
      // eslint-disable-next-line no-console
      console.debug('CategoryRepository.getCategories response', {
        returnedLength: list.length,
        requested: { page, limit },
        serverMeta,
        inconsistentServerPaging,
      });

      const start = (page - 1) * limit;
      const pagedData = list.slice(start, start + limit);

      return {
        data: pagedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          _requestUrl: requestUrl,
          _serverMeta: serverMeta,
        }
      } as CategoryListResponse;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get hierarchical category tree
   */
  async getCategoryTree(): Promise<CategoryListResponse> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/tree`);
      
      // Handle the actual API response format
      if (!response.data || typeof response.data !== 'object') {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 100,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        } as CategoryListResponse;
      }

      // The API returns { success: true, data: [...], meta: {...} }
      const apiData = response.data as any;
      
      if (!apiData.data || !Array.isArray(apiData.data)) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 100,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        } as CategoryListResponse;
      }
      
      // Transform API response to expected format
      return {
        data: apiData.data,
        pagination: {
          page: 1,
          limit: 100,
          total: apiData.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      } as CategoryListResponse;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/${id}`);
      
      // Handle the API response format { success: true, data: {...}, meta: {...} }
      const apiData = response.data as any;
      
      if (apiData && apiData.data) {
        return apiData.data as Category;
      }
      
      // Fallback to direct response if structure is different
      if (response.data) {
        return response.data as Category;
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await httpClient.post(this.BASE_URL, data);
      
      // Handle the API response format { success: true, data: {...}, meta: {...} }
      const apiData = response.data as any;
      
      if (apiData && apiData.data) {
        return apiData.data as Category;
      }
      
      // Fallback to direct response if structure is different
      return response.data as Category;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await httpClient.put(`${this.BASE_URL}/${id}`, data);
      
      // Handle the API response format { success: true, data: {...}, meta: {...} }
      const apiData = response.data as any;
      
      if (apiData && apiData.data) {
        return apiData.data as Category;
      }
      
      // Fallback to direct response if structure is different
      return response.data as Category;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
}

export const categoryRepository: CategoryRepository = new CategoryRepositoryImpl(); 