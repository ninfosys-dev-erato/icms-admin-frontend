import { userRepository } from '../repositories/user-repository';
import type {
  User,
  UserQuery,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  BulkOperationResult,
  UserStatistics,
  UserActivityItem,
} from '../types/user';

export class UserService {
  static async getUsers(query: Partial<UserQuery> = {}): Promise<UserListResponse> {
    try {
      const response = await userRepository.getAdminUsers(query);
      return this.normalizeListResponse(response, { page: query.page || 1, limit: query.limit || 12 });
    } catch (error) {
      this.handleError(error, 'Failed to fetch users');
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response = await userRepository.getById(id);
      return this.transformBackendUser(response);
    } catch (error) {
      this.handleError(error, 'Failed to fetch user');
      throw error;
    }
  }

  static async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const response = await userRepository.create(data);
      return this.transformBackendUser(response);
    } catch (error) {
      this.handleError(error, 'Failed to create user');
      throw error;
    }
  }

  static async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await userRepository.update(id, data);
      const raw = this.extractUserFromResponse(response);
      if (!this.isUserLike(raw)) {
        const latest = await userRepository.getById(id);
        return this.transformBackendUser(this.extractUserFromResponse(latest) ?? latest);
      }
      return this.transformBackendUser(raw);
    } catch (error) {
      this.handleError(error, 'Failed to update user');
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await userRepository.delete(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete user');
      throw error;
    }
  }

  static async activateUser(id: string): Promise<User> {
    try {
      const response = await userRepository.activate(id);
      const raw = this.extractUserFromResponse(response);
      return this.transformBackendUser(raw ?? response);
    } catch (error) {
      this.handleError(error, 'Failed to activate user');
      throw error;
    }
  }

  static async deactivateUser(id: string): Promise<User> {
    try {
      const response = await userRepository.deactivate(id);
      const raw = this.extractUserFromResponse(response);
      return this.transformBackendUser(raw ?? response);
    } catch (error) {
      this.handleError(error, 'Failed to deactivate user');
      throw error;
    }
  }

  static async updateUserRole(id: string, role: string): Promise<User> {
    try {
      const response = await userRepository.updateRole(id, role);
      const raw = this.extractUserFromResponse(response);
      return this.transformBackendUser(raw ?? response);
    } catch (error) {
      this.handleError(error, 'Failed to update user role');
      throw error;
    }
  }

  static async bulkActivate(ids: string[]): Promise<BulkOperationResult> {
    try {
      const resp = await userRepository.bulkActivate(ids);
      return this.extractData(resp) as BulkOperationResult;
    } catch (error) {
      this.handleError(error, 'Failed to bulk activate users');
      throw error;
    }
  }

  static async bulkDeactivate(ids: string[]): Promise<BulkOperationResult> {
    try {
      const resp = await userRepository.bulkDeactivate(ids);
      return this.extractData(resp) as BulkOperationResult;
    } catch (error) {
      this.handleError(error, 'Failed to bulk deactivate users');
      throw error;
    }
  }

  static async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    try {
      const resp = await userRepository.bulkDelete(ids);
      return this.extractData(resp) as BulkOperationResult;
    } catch (error) {
      this.handleError(error, 'Failed to bulk delete users');
      throw error;
    }
  }

  static async importUsers(file: File): Promise<{ imported: number }>
  {
    try {
      const resp = await userRepository.import(file);
      const data = this.extractData(resp) as { imported?: number };
      return { imported: data?.imported ?? 0 };
    } catch (error) {
      this.handleError(error, 'Failed to import users');
      throw error;
    }
  }

  static async exportUsers(format: 'json' | 'csv' | 'pdf' = 'json', query: Partial<UserQuery> = {}): Promise<string> {
    try {
      const resp = await userRepository.export(format, query);
      const data = this.extractData(resp) as { url?: string };
      return data?.url ?? '';
    } catch (error) {
      this.handleError(error, 'Failed to export users');
      throw error;
    }
  }

  static async getStatistics(): Promise<UserStatistics> {
    try {
      const resp = await userRepository.getStatistics();
      const data = this.extractData(resp) as UserStatistics;
      return data as UserStatistics;
    } catch (error) {
      this.handleError(error, 'Failed to fetch user statistics');
      throw error;
    }
  }

  static async getActivity(params: { limit?: number } = {}): Promise<UserActivityItem[]> {
    try {
      const resp = await userRepository.getActivity(params);
      const data = this.extractData(resp);
      return Array.isArray(data) ? (data as UserActivityItem[]) : [];
    } catch (error) {
      this.handleError(error, 'Failed to fetch user activity');
      throw error;
    }
  }

  // Helpers
  static getDisplayTitle(user: User | null | undefined): string {
    if (!user) return 'User';
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.email || 'User';
  }
  private static normalizeListResponse(response: unknown, fallback: { page: number; limit: number }): UserListResponse {
    if (!response) {
      return {
        data: [],
        pagination: { page: fallback.page, limit: fallback.limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
    const candidate = this.extractData(response) as unknown;
    const r = response as Record<string, unknown> & { meta?: { pagination?: unknown }; pagination?: unknown };
    const candidateObj = (candidate && typeof candidate === 'object') ? (candidate as Record<string, unknown> & { meta?: { pagination?: unknown }; pagination?: unknown }) : undefined;
    const pagination = r?.pagination ?? r?.meta?.pagination ?? candidateObj?.pagination ?? candidateObj?.meta?.pagination;
    const data = Array.isArray((candidate as { data?: unknown[] })?.data)
      ? ((candidate as { data: unknown[] }).data)
      : Array.isArray(candidate) ? (candidate as unknown[]) : [];
    return {
      data: (data as unknown[]).map(this.transformBackendUser),
      pagination: (pagination as UserListResponse['pagination']) ?? { page: fallback.page, limit: fallback.limit, total: (data as unknown[]).length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  }

  private static extractUserFromResponse(response: unknown): unknown | null {
    if (!response) return null;
    return UserService.extractData(response);
  }

  private static isUserLike(value: unknown): boolean {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return !!(obj.id || obj._id || obj.email);
  }

  private static transformBackendUser(backendUser: unknown): User {
    if (!backendUser) {
      throw new Error('Invalid user data received from backend');
    }
    const u = UserService.extractData(backendUser) as Record<string, unknown>;
    return {
      id: (u.id as string) || (u._id as string) || '',
      email: (u.email as string) || '',
      firstName: (u.firstName as string) || (u.first_name as string) || '',
      lastName: (u.lastName as string) || (u.last_name as string) || '',
      role: String(u.role ?? 'VIEWER').toUpperCase() as User['role'],
      status: String(u.status ?? ((u.isActive ? 'ACTIVE' : 'INACTIVE') as string)).toUpperCase() as User['status'],
      lastLoginAt: (u.lastLoginAt as string) || (u.last_login_at as string) || (u.last_login as string) || undefined,
      createdAt: (u.createdAt as string) || (u.created_at as string) || new Date().toISOString(),
      updatedAt: (u.updatedAt as string) || (u.updated_at as string) || new Date().toISOString(),
    } as User;
  }

  private static extractData<T = unknown>(response: unknown): T {
    if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
      return (response as Record<string, unknown>).data as T;
    }
    return response as T;
  }

  private static handleError(error: unknown, defaultMessage: string): void {
    console.error(`UserService Error: ${defaultMessage}`, error);
  }
}


