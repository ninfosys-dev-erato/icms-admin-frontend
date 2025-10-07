import { httpClient } from '@/lib/api/http-client';
import { ApiResponse } from '@/types/api';
import { User, LoginCredentials, AuthResponse } from '@/types/auth';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  getCurrentUser(): Promise<User>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(): Promise<void>;
}

class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🗄️ AuthRepository Step 1: Starting login API call...');
    
    console.log('🗄️ AuthRepository Step 2: Making API request...');
    const response = await httpClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    console.log('🗄️ AuthRepository Step 3: API response received:', {
      success: response.success,
      hasData: !!response.data,
      hasError: !!response.error
    });

    if (!response.success || !response.data) {
      console.error('🚨 AuthRepository: Login API failed:', response.error);
      throw new Error(this.formatErrorMessage(response.error?.message) || 'Login failed');
    }

    console.log('🗄️ AuthRepository Step 4: Login API successful, returning data');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/auth/me');

    if (!response.success || !response.data) {
      throw new Error(this.formatErrorMessage(response.error?.message) || 'Failed to fetch user');
    }

    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (!response.success || !response.data) {
      throw new Error(this.formatErrorMessage(response.error?.message) || 'Token refresh failed');
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.warn('Logout API call failed:', error);
    }
  }

  // Format error messages to be user-friendly
  private formatErrorMessage(message: string | string[] | undefined): string {
    if (!message) {
      return 'Something went wrong. Please try again.';
    }

    // Handle case where message is an array (validation errors)
    if (Array.isArray(message)) {
      if (message.length === 1) {
        return this.formatSingleMessage(message[0]);
      } else if (message.length > 1) {
        return `Multiple validation errors: ${message.slice(0, 3).join(', ')}${message.length > 3 ? '...' : ''}`;
      } else {
        return 'Please check your input and try again.';
      }
    }

    return this.formatSingleMessage(message);
  }

  // Format a single error message
  private formatSingleMessage(message: string | undefined): string {
    if (!message) {
      return 'Something went wrong. Please try again.';
    }

    // Remove technical details and make messages user-friendly
    const userFriendlyMessages: Record<string, string> = {
      'Validation failed': 'Please check your input and try again',
      'Unauthorized': 'You need to log in to perform this action',
      'Forbidden': 'You do not have permission to perform this action',
      'Not Found': 'The requested information was not found',
      'timeout': 'Request timed out. Please try again',
      'Network Error': 'Please check your internet connection and try again',
    };

    // Check for known error patterns
    for (const [pattern, friendlyMessage] of Object.entries(userFriendlyMessages)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    // If no pattern matches, return a generic message
    return 'Something went wrong. Please try again.';
  }
}

export const authRepository = new AuthRepositoryImpl(); 