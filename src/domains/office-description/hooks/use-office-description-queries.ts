import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OfficeDescriptionService } from '../services/office-description-service';
import { OfficeDescriptionService as NotificationService } from '../services/office-description-service';
import type {
  OfficeDescription,
  CreateOfficeDescriptionRequest,
  UpdateOfficeDescriptionRequest,
  OfficeDescriptionType,
} from '../types/office-description';

export const officeDescriptionKeys = {
  all: ['office-descriptions'] as const,
  list: (lang?: string) => ['office-descriptions', 'list', lang] as const,
  detail: (id: string) => ['office-descriptions', 'detail', id] as const,
  byType: (type: OfficeDescriptionType, lang?: string) => ['office-descriptions', 'type', type, lang] as const,
  admin: (lang?: string) => ['office-descriptions', 'admin', lang] as const,
  adminDetail: (id: string) => ['office-descriptions', 'admin', 'detail', id] as const,
};

// Admin queries
export const useAdminOfficeDescriptions = (lang?: string) => {
  console.log('🔍 useAdminOfficeDescriptions hook called with lang:', lang);
  
  return useQuery({
    queryKey: officeDescriptionKeys.admin(lang),
    queryFn: async () => {
      console.log('🔍 Query function executing for admin office descriptions');
      const result = await OfficeDescriptionService.getAdminDescriptions(lang);
      console.log('🔍 Query function result:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enable this query
  });
};

export const useAdminOfficeDescription = (id: string, enabled = true) => {
  return useQuery({
    queryKey: officeDescriptionKeys.adminDetail(id),
    queryFn: () => OfficeDescriptionService.getAdminDescriptionById(id),
    enabled: !!id && enabled,
  });
};

// Public queries
export const useOfficeDescriptions = (lang?: string) => {
  return useQuery({
    queryKey: officeDescriptionKeys.list(lang),
    queryFn: () => OfficeDescriptionService.getDescriptions(lang),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOfficeDescription = (id: string, enabled = true) => {
  return useQuery({
    queryKey: officeDescriptionKeys.detail(id),
    queryFn: () => OfficeDescriptionService.getDescriptionById(id),
    enabled: !!id && enabled,
  });
};

export const useOfficeDescriptionByType = (type: OfficeDescriptionType, lang?: string, enabled = true) => {
  return useQuery({
    queryKey: officeDescriptionKeys.byType(type, lang),
    queryFn: () => OfficeDescriptionService.getDescriptionByType(type, lang),
    enabled: !!type && enabled,
  });
};

// Mutations
export const useCreateOfficeDescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfficeDescriptionRequest) => OfficeDescriptionService.createDescription(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: officeDescriptionKeys.all });
    },
    onError: (error) => {
      console.error('Failed to create office description:', error);
    }
  });
};

export const useUpdateOfficeDescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfficeDescriptionRequest }) => 
      OfficeDescriptionService.updateDescription(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: officeDescriptionKeys.admin() });
      qc.invalidateQueries({ queryKey: officeDescriptionKeys.adminDetail(updated.id) });
    },
    onError: (error) => {
      console.error('Failed to update office description:', error);
    }
  });
};

export const useDeleteOfficeDescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OfficeDescriptionService.deleteDescription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: officeDescriptionKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete office description:', error);
    }
  });
};

export const useUpsertOfficeDescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: OfficeDescriptionType; data: CreateOfficeDescriptionRequest }) => 
      OfficeDescriptionService.upsertDescriptionByType(type, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: officeDescriptionKeys.all });
    },
    onError: (error) => {
      console.error('Failed to upsert office description:', error);
    }
  });
}; 