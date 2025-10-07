import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user-service';
import type { User, UserListResponse, UserQuery, UserStatistics, UpdateUserRequest } from '../types/user';
import { UserNotificationService } from '../services/user-notification-service';

export const userKeys = {
  all: ['users'] as const,
  list: (query: Partial<UserQuery> = {}) => [...userKeys.all, 'list', query] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  activity: (params?: { page?: number; limit?: number }) => [...userKeys.all, 'activity', params ?? {}] as const,
};

// Queries
export const useUsers = (query: Partial<UserQuery> = {}) =>
  useQuery<UserListResponse>({
    queryKey: userKeys.list(query),
    queryFn: () => UserService.getUsers(query),
    placeholderData: (prev) => prev,
    // only include defined values in the key for proper caching like sliders
    select: (data) => data,
  });

export const useUser = (id: string, enabled = true) =>
  useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => UserService.getUserById(id),
    enabled: !!id && enabled,
  });

export const useUserStatistics = () =>
  useQuery<UserStatistics>({
    queryKey: userKeys.stats(),
    queryFn: () => UserService.getStatistics(),
  });

export const useUserActivity = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: userKeys.activity(params),
    queryFn: () => UserService.getActivity(params ?? {}),
  });

// Mutations
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof UserService.createUser>[0]) => UserService.createUser(payload),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      // Service already shows a domain notification; keep a lightweight one for compatibility
      UserNotificationService.showUserCreated(UserService.getDisplayTitle(user));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to create user';
      UserNotificationService.showUserCreationError(msg);
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => UserService.updateUser(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showUserUpdated(UserService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to update user';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showUserDeleted();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to delete user';
      UserNotificationService.showUserDeletionError(msg);
    },
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.activateUser(id),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(u.id) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showActivationSuccess(UserService.getDisplayTitle(u));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to activate user';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.deactivateUser(id),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(u.id) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showDeactivationSuccess(UserService.getDisplayTitle(u));
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to deactivate user';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => UserService.updateUserRole(id, role),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(u.id) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showRoleUpdateSuccess(UserService.getDisplayTitle(u), u.role);
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to update role';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useBulkActivateUsers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => UserService.bulkActivate(ids),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showBulkOperationSuccess('Activate', res.success || vars.length);
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Bulk activate failed';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useBulkDeactivateUsers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => UserService.bulkDeactivate(ids),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showBulkOperationSuccess('Deactivate', res.success || vars.length);
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Bulk deactivate failed';
      UserNotificationService.showUserUpdateError(msg);
    },
  });
};

export const useBulkDeleteUsers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => UserService.bulkDelete(ids),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      UserNotificationService.showBulkOperationSuccess('Delete', res.success || vars.length);
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Bulk delete failed';
      UserNotificationService.showUserDeletionError(msg);
    },
  });
};


