import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { authRepository } from '@/repositories/auth-repository';
import { NotificationService } from '@/services/notification-service';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          console.log('🏪 AuthStore Step 1: Starting login, setting loading state...');
          set({ loading: true, error: null });

          console.log('🏪 AuthStore Step 2: Calling authRepository.login...');
          const authResponse = await authRepository.login(credentials);
          console.log('🏪 AuthStore Step 3: authRepository.login completed:', {
            hasUser: !!authResponse.user,
            hasAccessToken: !!authResponse.accessToken,
            hasRefreshToken: !!authResponse.refreshToken,
            userEmail: authResponse.user?.email
          });
          
          // Store tokens
          if (typeof window !== 'undefined') {
            console.log('🏪 AuthStore Step 4: Storing tokens in localStorage...');
            localStorage.setItem('auth-token', authResponse.accessToken);
            localStorage.setItem('refresh-token', authResponse.refreshToken);
            
            // Also set cookie for middleware
            console.log('🏪 AuthStore Step 5: Setting auth cookie for middleware...');
            document.cookie = `auth-token=${authResponse.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=lax`;
          }

          console.log('🏪 AuthStore Step 5: Setting user state...');
          set({
            user: authResponse.user,
            isAuthenticated: true,
            loading: false
          });
          console.log('🏪 AuthStore Step 6: Login completed successfully');
          
          // Show success notification
          NotificationService.showSuccess(
            'Login Successful',
            `Welcome back, ${authResponse.user.email}!`
          );
        } catch (error) {
          console.error('🚨 AuthStore login failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          console.error('🚨 AuthStore error message:', errorMessage);
          set({ 
            error: errorMessage, 
            loading: false, 
            isAuthenticated: false, 
            user: null 
          });
          
          // Show error notification
          NotificationService.showError(
            'Login Failed',
            errorMessage
          );
          
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ loading: true });

          // Call logout API
          await authRepository.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Clear tokens and state regardless of API call result
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('refresh-token');
            // Clear auth cookie
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }

          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          
          // Show logout notification
          NotificationService.showInfo(
            'Logged Out',
            'You have been successfully logged out.'
          );

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
      },

      getCurrentUser: async () => {
        try {
          set({ loading: true, error: null });

          const user = await authRepository.getCurrentUser();
          
          set({ 
            user, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ 
            error: errorMessage, 
            loading: false, 
            isAuthenticated: false, 
            user: null 
          });
          
          // Clear tokens on user fetch failure
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('refresh-token');
          }
          
          // Show error notification for failed user fetch
          NotificationService.showUnauthorizedError();
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading }),

      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      // Force logout without API call (for token expiration, etc.)
      forceLogout: () => {
        console.log('🏪 AuthStore: Force logout due to token issues');
        
        // Clear tokens and state immediately
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          // Clear auth cookie
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
        
        // Show logout notification
        NotificationService.showInfo(
          'Session Expired',
          'Your session has expired. Please log in again.'
        );

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 