import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImportantLinksService } from '../services/important-links-service';
import { ImportantLinksNotificationService } from '../services/important-links-notification-service';
import { 
  ImportantLink, 
  ImportantLinkListResponse, 
  ImportantLinkQuery, 
  ImportantLinkStatistics, 
  ImportantLinkFormData, 
  CreateImportantLinkRequest, 
  UpdateImportantLinkRequest,
  BulkCreateImportantLinksRequest,
  BulkUpdateImportantLinksRequest,
  ReorderImportantLinksRequest,
} from '../types/important-links';

export const importantLinksKeys = {
  all: ['important-links'] as const,
  list: (query: Partial<ImportantLinkQuery> = {}) => [...importantLinksKeys.all, 'list', query] as const,
  publicList: () => [...importantLinksKeys.all, 'public'] as const,
  detail: (id: string) => [...importantLinksKeys.all, 'detail', id] as const,
  stats: () => [...importantLinksKeys.all, 'stats'] as const,
  footer: (lang?: string) => [...importantLinksKeys.all, 'footer', lang] as const,
  active: (lang?: string) => [...importantLinksKeys.all, 'active', lang] as const,
};

// ========================================
// QUERIES
// ========================================

export const useImportantLinks = (query: Partial<ImportantLinkQuery> = {}) => {
  return useQuery<ImportantLinkListResponse>({
    queryKey: importantLinksKeys.list(query),
    queryFn: () => ImportantLinksService.getAdminLinks(query),
    placeholderData: (previousData) => previousData,
  });
};

export const usePublicImportantLinks = () => {
  return useQuery<ImportantLink[]>({
    queryKey: importantLinksKeys.publicList(),
    queryFn: () => ImportantLinksService.getPublicLinks(),
  });
};

export const useImportantLink = (id: string, enabled = true) => {
  return useQuery<ImportantLink>({
    queryKey: importantLinksKeys.detail(id),
    queryFn: () => ImportantLinksService.getAdminLinkById(id),
    enabled: !!id && enabled,
  });
};

export const useImportantLinksStatistics = () => {
  return useQuery<ImportantLinkStatistics>({
    queryKey: importantLinksKeys.stats(),
    queryFn: () => ImportantLinksService.getStatistics(),
  });
};

export const useFooterLinks = (lang?: string) => {
  return useQuery({
    queryKey: importantLinksKeys.footer(lang),
    queryFn: () => ImportantLinksService.getFooterLinks(lang),
    enabled: true,
  });
};

export const useActiveImportantLinks = (lang?: string) => {
  return useQuery<ImportantLink[]>({
    queryKey: importantLinksKeys.active(lang),
    queryFn: () => ImportantLinksService.getActiveLinks(lang),
    enabled: true,
  });
};

export const useSearchImportantLinks = (searchTerm: string, query: Partial<ImportantLinkQuery> = {}) => {
  return useQuery<ImportantLinkListResponse>({
    queryKey: [...importantLinksKeys.list(query), 'search', searchTerm],
    queryFn: () => ImportantLinksService.searchAdminLinks({ ...query, q: searchTerm }),
    enabled: !!searchTerm.trim(),
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateImportantLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateImportantLinkRequest) => ImportantLinksService.createLink(payload),
    onSuccess: (link) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showLinkCreated(ImportantLinksService.getDisplayTitle(link));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create important link';
      ImportantLinksNotificationService.showLinkCreationError(errorMessage);
    },
  });
};

export const useUpdateImportantLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImportantLinkRequest }) => 
      ImportantLinksService.updateLink(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.list({}) });
      qc.invalidateQueries({ queryKey: importantLinksKeys.detail(updated.id) });
      ImportantLinksNotificationService.showLinkUpdated(ImportantLinksService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update important link';
      ImportantLinksNotificationService.showLinkUpdateError(errorMessage);
    },
  });
};

export const useDeleteImportantLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ImportantLinksService.deleteLink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showLinkDeleted('Important Link');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete important link';
      ImportantLinksNotificationService.showLinkDeletionError(errorMessage);
    },
  });
};

export const useToggleImportantLinkStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      ImportantLinksService.updateLink(id, { isActive }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      qc.invalidateQueries({ queryKey: importantLinksKeys.detail(updated.id) });
      
      if (updated.isActive) {
        ImportantLinksNotificationService.showPublishSuccess(ImportantLinksService.getDisplayTitle(updated));
      } else {
        ImportantLinksNotificationService.showUnpublishSuccess(ImportantLinksService.getDisplayTitle(updated));
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update important link status';
      ImportantLinksNotificationService.showPublishStatusError(errorMessage);
    },
  });
};

export const useReorderImportantLinks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) => 
      ImportantLinksService.reorderLinks({ orders }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showReorderSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder important links';
      ImportantLinksNotificationService.showReorderError(errorMessage);
    },
  });
};

export const useBulkCreateImportantLinks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCreateImportantLinksRequest) => ImportantLinksService.bulkCreateLinks(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showBulkOperationSuccess('created', result.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk create important links';
      ImportantLinksNotificationService.showBulkOperationError('create', errorMessage);
    },
  });
};

export const useBulkUpdateImportantLinks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateImportantLinksRequest) => ImportantLinksService.bulkUpdateLinks(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showBulkOperationSuccess('updated', result.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update important links';
      ImportantLinksNotificationService.showBulkOperationError('update', errorMessage);
    },
  });
};

export const useBulkDeleteImportantLinks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => ImportantLinksService.deleteLink(id))),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showBulkOperationSuccess('deleted', variables.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete important links';
      ImportantLinksNotificationService.showBulkOperationError('delete', errorMessage);
    },
  });
};

export const useBulkToggleImportantLinksStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) => 
      Promise.all(ids.map(id => ImportantLinksService.updateLink(id, { isActive }))),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      const action = variables.isActive ? 'published' : 'unpublished';
      ImportantLinksNotificationService.showBulkOperationSuccess(action, variables.ids.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update important link status';
      ImportantLinksNotificationService.showBulkOperationError('status update', errorMessage);
    },
  });
};

export const useImportImportantLinks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCreateImportantLinksRequest) => ImportantLinksService.importLinks(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: importantLinksKeys.all });
      ImportantLinksNotificationService.showImportSuccess(result.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import important links';
      ImportantLinksNotificationService.showImportError(errorMessage);
    },
  });
};

export const useExportImportantLinks = () => {
  return useMutation({
    mutationFn: () => ImportantLinksService.exportLinks(),
    onSuccess: (result) => {
      ImportantLinksNotificationService.showExportSuccess(result.length);
      
      // Create and download CSV file
      const csvContent = convertToCSV(result);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `important-links-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export important links';
      ImportantLinksNotificationService.showExportError(errorMessage);
    },
  });
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function convertToCSV(data: ImportantLink[]): string {
  const headers = ['ID', 'Title (English)', 'Title (Nepali)', 'URL', 'Order', 'Active', 'Created At', 'Updated At'];
  const rows = data.map(link => [
    link.id,
    link.linkTitle?.en || '',
    link.linkTitle?.ne || '',
    link.linkUrl,
    link.order,
    link.isActive ? 'Yes' : 'No',
    new Date(link.createdAt).toLocaleString(),
    new Date(link.updatedAt).toLocaleString(),
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
}
