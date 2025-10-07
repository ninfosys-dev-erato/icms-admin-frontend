import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApiService } from '../services/dashboard-api.service';
import { DashboardQuery, DashboardOverview, DashboardConfig } from '@/types/dashboard';

// Query keys for React Query
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  overview: (query: DashboardQuery = {}) => [...dashboardQueryKeys.all, 'overview', query] as const,
  roleBased: (role: string, query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'role-based', role, query] as const,
  config: (role: string) => [...dashboardQueryKeys.all, 'config', role] as const,
  widget: (widgetId: string, query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'widget', widgetId, query] as const,
  systemOverview: () => [...dashboardQueryKeys.all, 'system-overview'] as const,
  contentAnalytics: (query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'content-analytics', query] as const,
  userAnalytics: (query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'user-analytics', query] as const,
  hrAnalytics: (query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'hr-analytics', query] as const,
  marketingAnalytics: (query: DashboardQuery = {}) => 
    [...dashboardQueryKeys.all, 'marketing-analytics', query] as const,
  health: () => [...dashboardQueryKeys.all, 'health'] as const,
  cacheStats: () => [...dashboardQueryKeys.all, 'cache-stats'] as const,
};

/**
 * Hook to get comprehensive dashboard overview
 */
export const useDashboardOverview = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(query),
    queryFn: () => dashboardApiService.getDashboardOverview(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get role-based dashboard overview
 */
export const useRoleBasedDashboard = (role: string, query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.roleBased(role, query),
    queryFn: () => dashboardApiService.getRoleBasedDashboard(role, query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!role,
  });
};

/**
 * Hook to get dashboard configuration for a role
 */
export const useDashboardConfig = (role: string) => {
  return useQuery({
    queryKey: dashboardQueryKeys.config(role),
    queryFn: () => dashboardApiService.getDashboardConfig(role),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    enabled: !!role,
  });
};

/**
 * Hook to update dashboard configuration
 */
export const useUpdateDashboardConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ role, config }: { role: string; config: Partial<DashboardConfig> }) =>
      dashboardApiService.updateDashboardConfig(role, config),
    onSuccess: (data, { role }) => {
      // Update the config cache
      queryClient.setQueryData(dashboardQueryKeys.config(role), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to get specific widget data
 */
export const useWidgetData = (widgetId: string, query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.widget(widgetId, query),
    queryFn: () => dashboardApiService.getWidgetData(widgetId, query),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    enabled: !!widgetId,
  });
};

/**
 * Hook to get system overview metrics
 */
export const useSystemOverview = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.systemOverview(),
    queryFn: () => dashboardApiService.getSystemOverview(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get content analytics
 */
export const useContentAnalytics = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.contentAnalytics(query),
    queryFn: () => dashboardApiService.getContentAnalytics(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get user analytics
 */
export const useUserAnalytics = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.userAnalytics(query),
    queryFn: () => dashboardApiService.getUserAnalytics(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get HR analytics
 */
export const useHrAnalytics = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.hrAnalytics(query),
    queryFn: () => dashboardApiService.getHrAnalytics(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get marketing analytics
 */
export const useMarketingAnalytics = (query: DashboardQuery = {}) => {
  return useQuery({
    queryKey: dashboardQueryKeys.marketingAnalytics(query),
    queryFn: () => dashboardApiService.getMarketingAnalytics(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get dashboard health status
 */
export const useDashboardHealth = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.health(),
    queryFn: () => dashboardApiService.getDashboardHealth(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to get cache statistics
 */
export const useCacheStats = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.cacheStats(),
    queryFn: () => dashboardApiService.getCacheStats(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to clear dashboard cache
 */
export const useClearCache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (category?: string) => dashboardApiService.clearCache(category),
    onSuccess: () => {
      // Invalidate all dashboard queries
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to refresh dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (query: DashboardQuery = {}) => dashboardApiService.refreshDashboard(query),
    onSuccess: () => {
      // Invalidate all dashboard queries
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to export dashboard data
 */
export const useExportDashboard = () => {
  return useMutation({
    mutationFn: ({ query, format }: { query: DashboardQuery; format: 'json' | 'csv' | 'pdf' }) =>
      dashboardApiService.exportDashboard(query, format),
  });
};

/**
 * Hook to get all dashboard data for a comprehensive view
 */
export const useComprehensiveDashboard = (query: DashboardQuery = {}) => {
  const overview = useDashboardOverview(query);
  const system = useSystemOverview();
  const content = useContentAnalytics(query);
  const users = useUserAnalytics(query);
  const hr = useHrAnalytics(query);
  const marketing = useMarketingAnalytics(query);
  const health = useDashboardHealth();

  const isLoading = overview.isLoading || system.isLoading || content.isLoading || 
                   users.isLoading || hr.isLoading || marketing.isLoading || health.isLoading;
  
  // Debug logging for errors
  if (overview.error || system.error || content.error || users.error || hr.error || marketing.error || health.error) {
    console.log('🔍 Dashboard Query Errors:', {
      overview: overview.error,
      system: system.error,
      content: content.error,
      users: users.error,
      hr: hr.error,
      marketing: marketing.error,
      health: health.error
    });
  }
  
  const error = overview.error || system.error || content.error || 
                users.error || hr.error || marketing.error || health.error;

  return {
    overview: overview.data,
    system: system.data,
    content: content.data,
    users: users.data,
    hr: hr.data,
    marketing: marketing.data,
    health: health.data,
    isLoading,
    error,
    refetch: () => {
      overview.refetch();
      system.refetch();
      content.refetch();
      users.refetch();
      hr.refetch();
      marketing.refetch();
      health.refetch();
    },
  };
};
