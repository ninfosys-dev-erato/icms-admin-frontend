import { httpClient } from '@/lib/api/http-client';
import { ApiResponse } from '@/types/api';
import {
  DashboardOverview,
  DashboardConfig,
  DashboardQuery,
  DashboardExport,
  CacheStats,
  DashboardHealth,
} from '@/types/dashboard';

export class DashboardApiService {
  private readonly baseUrl = '/admin/dashboard';

  /**
   * Get comprehensive dashboard overview
   */
  async getDashboardOverview(query: DashboardQuery = {}): Promise<DashboardOverview> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.granularity) {
      params.append('granularity', query.granularity);
    }
    if (query.category) {
      params.append('category', query.category);
    }
    if (query.includeTrends !== undefined) {
      params.append('includeTrends', query.includeTrends.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/overview${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<DashboardOverview>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch dashboard overview');
    }

    return response.data.data;
  }

  /**
   * Get role-based dashboard overview
   */
  async getRoleBasedDashboard(role: string, query: DashboardQuery = {}): Promise<DashboardOverview> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.granularity) {
      params.append('granularity', query.granularity);
    }
    if (query.category) {
      params.append('category', query.category);
    }
    if (query.includeTrends !== undefined) {
      params.append('includeTrends', query.includeTrends.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/overview/${role}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<DashboardOverview>>(url);
    
    if (!response?.success || !response?.data) {
      throw new Error(response?.error?.message || 'Failed to fetch role-based dashboard');
    }

    return response.data;
  }

  /**
   * Get dashboard configuration for a specific role
   */
  async getDashboardConfig(role: string): Promise<DashboardConfig> {
    const url = `${this.baseUrl}/config/${role}`;
    const response = await httpClient.get<ApiResponse<DashboardConfig>>(url);
    
    if (!response?.success || !response?.data) {
      throw new Error(response?.error?.message || 'Failed to fetch dashboard configuration');
    }

    return response.data;
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(role: string, config: Partial<DashboardConfig>): Promise<DashboardConfig> {
    const url = `${this.baseUrl}/config/${role}`;
    const response = await httpClient.put<ApiResponse<DashboardConfig>>(url, config);
    
    if (!response?.success || !response?.data) {
      throw new Error(response?.error?.message || 'Failed to update dashboard configuration');
    }

    return response.data;
  }

  /**
   * Get specific widget data
   */
  async getWidgetData(widgetId: string, query: DashboardQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.granularity) {
      params.append('granularity', query.granularity);
    }
    if (query.category) {
      params.append('category', query.category);
    }
    if (query.includeTrends !== undefined) {
      params.append('includeTrends', query.includeTrends.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/widget/${widgetId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch widget data');
    }

    return response?.data;
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(
    query: DashboardQuery = {},
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<DashboardExport> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.granularity) {
      params.append('granularity', query.granularity);
    }
    if (query.category) {
      params.append('category', query.category);
    }
    if (query.includeTrends !== undefined) {
      params.append('includeTrends', query.includeTrends.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/export?${params.toString()}`;
    
    if (format === 'json') {
      const response = await httpClient.get<ApiResponse<DashboardExport>>(url);
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.error?.message || 'Failed to export dashboard data');
      }

      return response?.data;
    } else {
      // For CSV and PDF, we need to handle the file download
      const response = await httpClient.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Return mock export data for UI feedback
      return {
        filename: `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`,
        contentType: format === 'csv' ? 'text/csv' : 'application/pdf',
        size: blob.size,
        exportedAt: new Date(),
        exportedBy: 'current-user', // This would come from auth context
      };
    }
  }

  /**
   * Get dashboard cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const url = `${this.baseUrl}/cache/stats`;
    const response = await httpClient.get<ApiResponse<CacheStats>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch cache statistics');
    }

    return response?.data;
  }

  /**
   * Clear dashboard cache
   */
  async clearCache(category?: string): Promise<{ cleared: number }> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }

    const url = `${this.baseUrl}/cache/clear${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.post<ApiResponse<{ cleared: number }>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to clear cache');
    }

    return response?.data;
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(query: DashboardQuery = {}): Promise<DashboardOverview> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.granularity) {
      params.append('granularity', query.granularity);
    }
    if (query.category) {
      params.append('category', query.category);
    }
    if (query.includeTrends !== undefined) {
      params.append('includeTrends', query.includeTrends.toString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/refresh${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.post<ApiResponse<DashboardOverview>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to refresh dashboard');
    }

    return response?.data;
  }

  /**
   * Get dashboard health status
   */
  async getDashboardHealth(): Promise<DashboardHealth> {
    const url = `${this.baseUrl}/health`;
    const response = await httpClient.get<ApiResponse<DashboardHealth>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch dashboard health');
    }

    return response?.data;
  }

  /**
   * Get system overview metrics
   */
  async getSystemOverview(): Promise<any> {
    const url = `${this.baseUrl}/system/overview`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    // Debug logging
    console.log('🔍 System Overview Response:', {
      url,
      responseStatus: response.status,
      responseData: response.data,
      responseDataType: typeof response.data,
      hasSuccess: !!response.data?.success,
      hasData: !!response.data?.data,
      successValue: response.data?.success,
      dataValue: response.data?.data,
      responseKeys: response.data ? Object.keys(response.data) : 'no data',
      fullResponse: response
    });
    
    if (!response.data.success || !response.data.data) {
      console.error('❌ System Overview Validation Failed:', {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error
      });
      throw new Error(response.data.error?.message || 'Failed to fetch system overview');
    }

    return response.data.data;
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(query: DashboardQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/content/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch content analytics');
    }

    return response.data.data;
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(query: DashboardQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/users/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch user analytics');
    }

    return response?.data;
  }

  /**
   * Get HR analytics
   */
  async getHrAnalytics(query: DashboardQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/hr/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch HR analytics');
    }

    return response?.data;
  }

  /**
   * Get marketing analytics
   */
  async getMarketingAnalytics(query: DashboardQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (query.dateFrom) {
      params.append('dateFrom', query.dateFrom.toISOString());
    }
    if (query.dateTo) {
      params.append('dateTo', query.dateTo.toISOString());
    }
    if (query.limit) {
      params.append('limit', query.limit.toString());
    }

    const url = `${this.baseUrl}/marketing/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<any>>(url);
    
    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.error?.message || 'Failed to fetch marketing analytics');
    }

    return response?.data;
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();
