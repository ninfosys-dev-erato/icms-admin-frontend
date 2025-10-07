import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 401
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number } };
          if (axiosError.response?.status >= 400 && axiosError.response?.status < 500) {
            return axiosError.response?.status === 401 ? failureCount < 1 : false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry mutations on network errors
        if (error && typeof error === 'object' && 'code' in error) {
          const networkError = error as { code: string };
          return networkError.code === 'NETWORK_ERROR' && failureCount < 2;
        }
        return false;
      },
    },
  },
}); 