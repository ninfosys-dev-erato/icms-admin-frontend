import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';
import { env } from '@/lib/env';

class HttpClient {
  private client: AxiosInstance;
  private refreshingPromise: Promise<string | null> | null = null;

  constructor() {
    const baseURL = this.getBaseURL();
    
    // Log initialization info
    // console.log('🌐 HTTP Client: Initializing...', {
    //   baseURL,
    //   isUsingMSW: this.isMSWEnabled(),
    //   environment: env.NODE_ENV,
    //   apiMocking: env.NEXT_PUBLIC_API_MOCKING,
    //   debug: env.NEXT_PUBLIC_DEBUG
    // });
    
    // Create axios instance
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token and request ID
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add authorization header if token exists and is valid
        const token = this.getStoredToken();
        if (token) {
          // Validate token before using it
          const validation = this.validateToken();
          
          if (validation.isValid) {
            config.headers.Authorization = `Bearer ${token}`;
            if (env.NEXT_PUBLIC_DEBUG === 'true') {
              // console.log('🔐 HTTP Client: Adding Authorization header with valid token:', {
              //   hasToken: !!token,
              //   tokenLength: token.length,
              //   tokenStart: token.substring(0, 20) + '...',
              //   url: config.url,
              //   method: config.method?.toUpperCase(),
              //   expiresAt: validation.expiresAt
              // });
            }
          } else {
            if (env.NEXT_PUBLIC_DEBUG === 'true') {
              // console.log('⚠️ HTTP Client: Token validation failed, not adding auth header:', {
              //   url: config.url,
              //   method: config.method?.toUpperCase(),
              //   reason: validation.reason
              // });
            }
            
            // If token should be cleared, do it now
            if (validation.shouldClear) {
              // console.log('🚫 HTTP Client: Clearing invalid token before request');
              this.clearStoredTokens();
            }
          }
        } else {
          if (env.NEXT_PUBLIC_DEBUG === 'true') {
            // console.log('⚠️ HTTP Client: No auth token found for request:', {
            //   url: config.url,
            //   method: config.method?.toUpperCase()
            // });
          }
        }
        
        // Handle FormData - remove Content-Type to let browser set it automatically
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        if (env.NEXT_PUBLIC_DEBUG === 'true') {
          // console.log('🌐 HTTP Client: Request sent:', {
          //   method: config.method?.toUpperCase(),
          //   url: config.url,
          //   hasAuth: !!token,
          //   isFormData: config.data instanceof FormData,
          //   headers: Object.keys(config.headers || {}),
          // });
        }
        
        return config;
      },
      (error) => {
        // console.error('🚨 HTTP Client: Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (env.NEXT_PUBLIC_DEBUG === 'true') {
          // console.log('🌐 HTTP Client: Response received:', {
          //   status: response.status,
          //   url: response.config.url,
          //   success: response.data?.success,
          //   fullResponseData: response.data,
          //   responseDataType: typeof response.data,
          //   hasData: !!response.data,
          //   dataKeys: response.data ? Object.keys(response.data) : 'no data'
          // });
        }
        return response;
      },
      async (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  private getBaseURL(): string {
    // In development, use MSW if enabled, otherwise use real backend
    if (this.isMSWEnabled()) {
      return ''; // MSW intercepts all requests
    }
    return env.NEXT_PUBLIC_API_BASE_URL;
  }

  private isMSWEnabled(): boolean {
    return env.NODE_ENV === 'development' && env.NEXT_PUBLIC_API_MOCKING === 'enabled';
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    this.refreshingPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshingPromise;
      this.refreshingPromise = null;
      return newToken;
    } catch (error) {
      this.refreshingPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = this.getStoredRefreshToken();
      if (!refreshToken) {
        // console.log('❌ HTTP Client: No refresh token found');
        return null;
      }

      // Use the same base URL logic as the main client
      const baseURL = this.isMSWEnabled() ? '' : env.NEXT_PUBLIC_API_BASE_URL;
      
      // Try different possible refresh endpoints
      const refreshEndpoints = [
        '/auth/refresh',
        '/api/v1/auth/refresh',
        '/api/auth/refresh'
      ];
      
      let lastError: any = null;
      
      for (const endpoint of refreshEndpoints) {
        try {
          const refreshUrl = `${baseURL}${endpoint}`;
          // console.log('🔄 HTTP Client: Attempting token refresh at:', refreshUrl);

          const response = await axios.post<ApiResponse<{
            accessToken: string;
            refreshToken: string;
          }>>(refreshUrl, {
            refreshToken,
          }, {
            timeout: 10000, // 10 second timeout for refresh
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            this.storeTokens(accessToken, newRefreshToken);
            // console.log('✅ HTTP Client: Tokens refreshed and stored');
            return accessToken;
          } else {
            // console.log('❌ HTTP Client: Token refresh response invalid:', response.data);
            lastError = new Error('Invalid refresh response');
          }
        } catch (endpointError: any) {
          // console.log(`❌ HTTP Client: Failed to refresh at ${endpoint}:`, endpointError.message);
          lastError = endpointError;
          // Continue to next endpoint
        }
      }
      
      // All endpoints failed
      // console.error('❌ HTTP Client: All refresh endpoints failed');
      this.clearStoredTokens();
      return null;
      
    } catch (error) {
      // console.error('❌ HTTP Client: Token refresh failed:', error);
      this.clearStoredTokens();
      return null;
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh-token');
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
  }

  private clearStoredTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
  }

  private handleAuthFailure(): void {
    // console.log('🚪 HTTP Client: Handling authentication failure');
    this.clearStoredTokens();
    
    // Use the auth utility for better state management
    if (typeof window !== 'undefined') {
      // Import and use the auth utility
      import('@/lib/auth-utils').then(({ forceLogout }) => {
        forceLogout();
      }).catch(() => {
        // Fallback to direct redirect if auth utility import fails
        setTimeout(() => {
          if (window.location.pathname !== '/login' && !window.location.pathname.includes('/admin/login')) {
            // console.log('🚪 HTTP Client: Fallback redirect to login page');
            window.location.href = '/admin/login';
          }
        }, 100);
      });
    }
  }

  private normalizeError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiResponse;
      if (response?.error) {
        return response.error;
      }
      
      return {
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T, U = unknown>(
    url: string,
    data?: U,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T, U = unknown>(
    url: string,
    data?: U,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async patch<T, U = unknown>(
    url: string,
    data?: U,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // Helper method to check if using MSW
  isUsingMSW(): boolean {
    return this.isMSWEnabled();
  }

  // Helper method to get current base URL
  getCurrentBaseURL(): string {
    return this.getBaseURL();
  }

  // Check if token refresh should be attempted
  shouldAttemptRefresh(): boolean {
    const validation = this.validateToken();
    
    // Attempt refresh if:
    // 1. Token is expired but not significantly expired (within 5 minutes)
    // 2. Token format is valid but expired
    if (!validation.isValid && validation.formatValid && validation.isExpired) {
      const currentTime = Date.now() / 1000;
      const fiveMinutesAgo = currentTime - (5 * 60);
      
      // Check if token expired within the last 5 minutes
      if (validation.expiresAt && validation.expiresAt.getTime() / 1000 > fiveMinutesAgo) {
        return true;
      }
    }
    
    return false;
  }

  // Pre-flight token check before making API calls
  async ensureValidToken(): Promise<boolean> {
    const validation = this.validateToken();
    
    if (validation.isValid) {
      return true;
    }
    
    // If token is recently expired, try to refresh it
    if (this.shouldAttemptRefresh()) {
      try {
        // console.log('🔄 HTTP Client: Pre-flight token refresh attempt');
        const newToken = await this.refreshToken();
        return !!newToken;
      } catch (error) {
        // console.log('❌ HTTP Client: Pre-flight token refresh failed');
        return false;
      }
    }
    
    return false;
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; baseURL: string; error?: string }> {
    const baseURL = this.getCurrentBaseURL();
    
    // console.log('🏥 HTTP Client: Performing health check...', {
    //   baseURL,
    //   isUsingMSW: this.isUsingMSW(),
    //   environment: env.NODE_ENV,
    //   apiMocking: env.NEXT_PUBLIC_API_MOCKING
    // });
    
    try {
      // Try different health check endpoints
      const healthEndpoints = ['/health', '/api/health', '/api/v1/health'];
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await this.client.get(endpoint, { timeout: 5000 });
          // console.log('✅ HTTP Client: Health check passed', {
          //   endpoint,
          //   status: response.status,
          //   data: response.data
          // });
          
          return { 
            healthy: true, 
            baseURL,
            endpoint
          };
        } catch (endpointError: any) {
          // console.log(`❌ HTTP Client: Health check failed for ${endpoint}:`, endpointError.message);
        }
      }
      
      return { 
        healthy: false, 
        baseURL,
        error: 'All health endpoints failed'
      };
    } catch (error: any) {
      // console.error('🚨 HTTP Client: Health check error:', error.message);
      return { 
        healthy: false, 
        baseURL,
        error: error.message 
      };
    }
  }

  // Public logout method
  logout(): void {
    // console.log('🚪 HTTP Client: Logging out user');
    this.clearStoredTokens();
    this.handleAuthFailure();
  }

  // Debug method to help troubleshoot token issues
  debugTokenStatus(): void {
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    const validation = this.validateToken();
    const tokenInfo = this.getTokenInfo();
    
    // console.group('🔍 HTTP Client: Token Debug Information');
    // console.log('Has auth token:', !!token);
    // console.log('Has refresh token:', !!refreshToken);
    // console.log('Token length:', token?.length || 0);
    // console.log('Refresh token length:', refreshToken?.length || 0);
    // console.log('Token validation:', validation);
    // console.log('Token info:', tokenInfo);
    
    if (token) {
      try {
        const parts = token.split('.');
        // console.log('Token parts count:', parts.length);
        if (parts.length === 3 && parts[1]) {
          const payload = JSON.parse(atob(parts[1]));
          // console.log('Token payload:', payload);
          // console.log('Token claims:', Object.keys(payload));
        }
      } catch (error) {
        // console.log('Token parsing error:', error);
      }
    }
    
    // console.groupEnd();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;
    
    // Use enhanced token validation
    const validation = this.validateToken();
    
    if (env.NEXT_PUBLIC_DEBUG === 'true') {
      // console.log('🔐 HTTP Client: Token validation result:', validation);
    }
    
    // Only clear tokens if validation explicitly says we should
    if (validation.shouldClear) {
      // console.log('🚫 HTTP Client: Clearing tokens due to validation:', validation.reason);
      this.clearStoredTokens();
    }
    
    return validation.isValid;
  }

  // Get token expiration info for debugging
  getTokenInfo(): { isValid: boolean; expiresAt?: Date; isExpired?: boolean; formatValid?: boolean; parseError?: string } {
    const token = this.getStoredToken();
    if (!token) {
      return { isValid: false, formatValid: false };
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        return { isValid: false, formatValid: false, parseError: 'Invalid JWT format' };
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = payload.exp && payload.exp < currentTime;
      
      return {
        isValid: !isExpired,
        formatValid: true,
        expiresAt,
        isExpired
      };
    } catch (error) {
      return { 
        isValid: false, 
        formatValid: false, 
        parseError: error instanceof Error ? error.message : 'Unknown parsing error' 
      };
    }
  }

  // Enhanced token validation that provides more context
  validateToken(): { 
    isValid: boolean; 
    shouldClear: boolean; 
    reason?: string;
    expiresAt?: Date;
    isExpired?: boolean;
    formatValid?: boolean;
  } {
    const token = this.getStoredToken();
    if (!token) {
      return { isValid: false, shouldClear: false, reason: 'No token found' };
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        return { 
          isValid: false, 
          shouldClear: false, 
          reason: 'Invalid JWT format - wrong number of parts',
          formatValid: false
        };
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (!payload.exp) {
        return { 
          isValid: false, 
          shouldClear: false, 
          reason: 'Token has no expiration claim',
          formatValid: true
        };
      }
      
      const expiresAt = new Date(payload.exp * 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        // Only clear if token is significantly expired (more than 5 minutes)
        const fiveMinutesAgo = currentTime - (5 * 60);
        const shouldClear = payload.exp < fiveMinutesAgo;
        
        return {
          isValid: false,
          shouldClear,
          reason: shouldClear ? 'Token significantly expired' : 'Token recently expired',
          expiresAt,
          isExpired: true,
          formatValid: true
        };
      }
      
      return {
        isValid: true,
        shouldClear: false,
        expiresAt,
        isExpired: false,
        formatValid: true
      };
      
    } catch (error) {
      return { 
        isValid: false, 
        shouldClear: false, 
        reason: `Token parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        formatValid: false
      };
    }
  }

  private async handleResponseError(error: any): Promise<any> {
    // Enhanced error logging
    const errorInfo = {
      message: error.message || 'Unknown error',
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      code: error.code,
      isNetworkError: !error.response,
      isAuthError: error.response?.status === 401 || error.response?.status === 403,
    };

    if (env.NEXT_PUBLIC_DEBUG === 'true') {
      // console.error('🚨 HTTP Client: Response error:', errorInfo);
    } else {
      // console.error('🚨 HTTP Client: API Error:', {
      //   status: errorInfo.status,
      //   message: errorInfo.message,
      //   url: errorInfo.url,
      // });
    }
    
    // For 404 responses, reject with a clear error so callers (e.g. react-query)
    // receive an error instead of getting undefined data from a successful resolution.
    if (error.response?.status === 404) {
      if (env.NEXT_PUBLIC_DEBUG === 'true') {
        // console.log('🌐 HTTP Client: 404 response handled (will throw):', {
        //   url: error.config?.url,
        //   data: error.response?.data,
        // });
      }
      const notFoundError = new Error(`Not Found (404): ${error.config?.url || 'unknown URL'}`);
      // Attach the original response for callers that need details
      (notFoundError as any).response = error.response;
      return Promise.reject(notFoundError);
    }

    // Handle network errors (when backend is not available)
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
      // console.warn('🌐 HTTP Client: Network error detected - backend may not be available');
      
      // Return a mock response structure for network errors to prevent crashes
      return {
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        },
        status: 503,
        statusText: 'Service Unavailable'
      };
    }

    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // console.log('🔄 HTTP Client: Attempting token refresh...');
        const newToken = await this.refreshToken();
        if (newToken) {
          // console.log('✅ HTTP Client: Token refreshed successfully');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.client(originalRequest);
        } else {
          // console.log('❌ HTTP Client: Token refresh failed, redirecting to login');
          // Clear tokens and redirect immediately
          this.clearStoredTokens();
          this.handleAuthFailure();
          return Promise.reject(new Error('Token refresh failed'));
        }
      } catch (refreshError) {
        // console.log('❌ HTTP Client: Token refresh error:', refreshError);
        // Refresh failed, clear tokens and redirect to login
        this.clearStoredTokens();
        this.handleAuthFailure();
        return Promise.reject(new Error('Token refresh failed'));
      }
    }

    // Handle 403 Forbidden - don't immediately clear tokens
    if (error.response?.status === 403) {
      // console.log('🚫 HTTP Client: Access forbidden, but not clearing tokens immediately');
      // Only clear tokens if we're sure it's a permanent auth issue
      if (error.response?.data?.error?.code === 'TOKEN_EXPIRED' || 
          error.response?.data?.error?.message?.includes('expired') ||
          error.response?.data?.error?.message?.includes('invalid')) {
        // console.log('🚫 HTTP Client: Confirmed token issue, clearing tokens');
        this.clearStoredTokens();
        this.handleAuthFailure();
      }
      return Promise.reject(new Error('Access forbidden'));
    }

    // Handle other 5xx errors - don't clear tokens for server errors
    if (error.response?.status && error.response.status >= 500) {
      // console.log('🌐 HTTP Client: Server error, not clearing tokens');
      return Promise.reject(new Error('Server error'));
    }

    return Promise.reject(this.normalizeError(error));
  }
}

export const httpClient = new HttpClient(); 