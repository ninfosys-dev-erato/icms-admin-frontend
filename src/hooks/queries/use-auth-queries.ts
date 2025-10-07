import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { authRepository } from '@/repositories/auth-repository';
import { LoginCredentials } from '@/types/auth';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
};

// Queries
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authRepository.getCurrentUser,
    enabled: isAuthenticated && typeof window !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message as string;
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('🔄 useLogin Step 1: Starting mutation with credentials:', {
        email: credentials.email,
        rememberMe: credentials.rememberMe
      });
      
      console.log('🔄 useLogin Step 2: Calling storeLogin...');
      await storeLogin(credentials);
      console.log('🔄 useLogin Step 3: storeLogin completed successfully');
      
      console.log('🔄 useLogin Step 4: Calling authRepository.getCurrentUser...');
      const user = await authRepository.getCurrentUser();
      console.log('🔄 useLogin Step 5: getCurrentUser completed successfully:', user);
      
      return user;
    },
    onSuccess: (user) => {
      console.log('🔄 useLogin Step 6: onSuccess called with user:', user);
      // Update the current user cache
      queryClient.setQueryData(authKeys.currentUser(), user);
      // Invalidate and refetch any cached data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('🚨 useLogin onError called with:', error);
      // Clear any auth-related cache on login failure
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await storeLogout();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}; 