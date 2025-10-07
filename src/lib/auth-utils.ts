import { useAuthStore } from '@/stores/auth-store';
import { httpClient } from '@/lib/api/http-client';

/**
 * Global logout utility that can be called from anywhere
 * This function handles both manual logout and forced logout due to token issues
 */
export const logoutUser = async (force: boolean = false): Promise<void> => {
  try {
    if (force) {
      // Force logout without API call (for token expiration, etc.)
      const { forceLogout } = useAuthStore.getState();
      forceLogout();
    } else {
      // Normal logout with API call
      const { logout } = useAuthStore.getState();
      await logout();
    }
  } catch (error) {
    console.error('Logout failed:', error);
    // Fallback to force logout if normal logout fails
    const { forceLogout } = useAuthStore.getState();
    forceLogout();
  }
};

/**
 * Check if user is currently authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuthStore.getState();
  return isAuthenticated;
};

/**
 * Get current user information
 */
export const getCurrentUser = () => {
  const { user } = useAuthStore.getState();
  return user;
};

/**
 * Get token information for debugging
 */
export const getTokenInfo = () => {
  return httpClient.getTokenInfo();
};

/**
 * Force logout due to authentication issues
 * This bypasses the API call and immediately clears all auth state
 */
export const forceLogout = (): void => {
  logoutUser(true);
};

/**
 * Debug authentication state and token information
 * This helps troubleshoot authentication issues
 */
export const debugAuthState = (): void => {
  const { httpClient } = require('@/lib/api/http-client');
  const { useAuthStore } = require('@/stores/auth-store');
  
  console.group('🔍 Auth State Debug Information');
  
  // Debug HTTP client token status
  httpClient.debugTokenStatus();
  
  // Debug auth store state
  const authState = useAuthStore.getState();
  console.log('Auth Store State:', {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error
  });
  
  // Debug localStorage
  if (typeof window !== 'undefined') {
    console.log('LocalStorage:', {
      hasAuthToken: !!localStorage.getItem('auth-token'),
      hasRefreshToken: !!localStorage.getItem('refresh-token'),
      authTokenLength: localStorage.getItem('auth-token')?.length || 0,
      refreshTokenLength: localStorage.getItem('refresh-token')?.length || 0
    });
  }
  
  console.groupEnd();
}; 