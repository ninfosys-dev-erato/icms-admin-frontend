import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeaderService } from '../services/header-service';
import { HeaderNotificationService } from '../services/header-notification-service';
import { useMediaItem } from '../../media/hooks/use-media-queries';
import { 
  HeaderConfig, 
  HeaderListResponse, 
  HeaderQuery, 
  HeaderSearchQuery,
  HeaderStatistics, 
  HeaderFormData, 
  CreateHeaderRequest, 
  UpdateHeaderRequest,
  LogoUploadData,
  HeaderPreview
} from '../types/header';

export const headerKeys = {
  all: ['headers'] as const,
  list: (query: Partial<HeaderQuery> = {}) => [...headerKeys.all, 'list', query] as const,
  publicList: () => [...headerKeys.all, 'public'] as const,
  detail: (id: string) => [...headerKeys.all, 'detail', id] as const,
  stats: () => [...headerKeys.all, 'stats'] as const,
  preview: () => [...headerKeys.all, 'preview'] as const,
  css: (id: string) => [...headerKeys.all, 'css', id] as const,
};

// ========================================
// QUERIES
// ========================================

export const useHeaders = (query: Partial<HeaderQuery> = {}) => {
  return useQuery<{
    data: HeaderConfig[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: headerKeys.list(query),
    queryFn: () => HeaderService.getHeaders(query),
    placeholderData: (previousData) => previousData,
  });
};

export const useHeader = (id: string, enabled = true) => {
  return useQuery<HeaderConfig>({
    queryKey: headerKeys.detail(id),
    queryFn: () => HeaderService.getHeaderById(id),
    enabled: !!id && enabled,
  });
};

export const useHeaderWithLogoMedia = (id: string, enabled = true) => {
  return useQuery<HeaderConfig>({
    queryKey: [...headerKeys.detail(id), 'withLogoMedia'],
    queryFn: () => HeaderService.getHeaderByIdWithLogoMedia(id),
    enabled: !!id && enabled,
  });
};

export const useHeaderStatistics = () => {
  return useQuery<HeaderStatistics>({
    queryKey: headerKeys.stats(),
    queryFn: () => HeaderService.getStatistics(),
  });
};

export const useHeaderCSS = (id: string, enabled = true) => {
  return useQuery<{ css: string }>({
    queryKey: headerKeys.css(id),
    queryFn: () => HeaderService.generateCSS(id),
    enabled: !!id && enabled,
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateHeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHeaderRequest) => HeaderService.createHeader(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: headerKeys.all });
      HeaderNotificationService.showHeaderCreated('Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create header';
      HeaderNotificationService.showHeaderCreationError(errorMessage);
    },
  });
};

export const useCreateHeaderWithLogos = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      headerData, 
      leftLogoFile, 
      rightLogoFile 
    }: { 
      headerData: HeaderFormData; 
      leftLogoFile?: File; 
      rightLogoFile?: File; 
    }) => HeaderService.createHeaderWithLogos(headerData, leftLogoFile, rightLogoFile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: headerKeys.all });
      HeaderNotificationService.showHeaderCreated('Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create header with logos';
      HeaderNotificationService.showHeaderCreationError(errorMessage);
    },
  });
};

export const useUpdateHeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHeaderRequest }) => HeaderService.updateHeader(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
    
      HeaderNotificationService.showHeaderUpdated(updated.name?.en || 'Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update header';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

export const useDeleteHeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HeaderService.deleteHeader(id),
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      qc.invalidateQueries({ queryKey: headerKeys.detail(id) });
      HeaderNotificationService.showHeaderDeleted('Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete header';
      HeaderNotificationService.showHeaderDeletionError(errorMessage);
    },
  });
};

export const usePublishHeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HeaderService.publishHeader(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
      HeaderNotificationService.showPublishSuccess(updated.name?.en || 'Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish header';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

export const useUnpublishHeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HeaderService.unpublishHeader(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
      HeaderNotificationService.showUnpublishSuccess(updated.name?.en || 'Header');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish header';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

export const useBulkPublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => HeaderService.bulkPublish(ids),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showBulkOperationSuccess('published', result.results.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk publish headers';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

export const useBulkUnpublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => HeaderService.bulkUnpublish(ids),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showBulkOperationSuccess('unpublished', result.results.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk unpublish headers';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

export const useBulkDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => HeaderService.bulkDelete(ids),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showBulkOperationSuccess('deleted', result.results.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete headers';
      HeaderNotificationService.showHeaderDeletionError(errorMessage);
    },
  });
};

export const useReorderHeaders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) => HeaderService.reorderHeaders(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: headerKeys.all });
      HeaderNotificationService.showReorderSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder headers';
      HeaderNotificationService.showReorderError(errorMessage);
    },
  });
};

// ========================================
// LOGO MANAGEMENT WITH BACKBLAZE
// ========================================

export const useUploadLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, logoType, file, logoData }: { id: string; logoType: 'left' | 'right'; file: File; logoData: LogoUploadData }) => 
      HeaderService.uploadLogo(id, logoType, file, logoData),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showLogoUploadSuccess(HeaderService.getDisplayName(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      HeaderNotificationService.showLogoUploadError(errorMessage);
    },
  });
};

export const useUpdateLogoMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, logoType, logoData }: { id: string; logoType: 'left' | 'right'; logoData: LogoUploadData }) => 
      HeaderService.updateLogoMetadata(id, logoType, logoData),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showLogoConfigurationSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update logo metadata';
      HeaderNotificationService.showLogoConfigurationError(errorMessage);
    },
  });
};

export const useRemoveLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, logoType }: { id: string; logoType: 'left' | 'right' }) => 
      HeaderService.removeLogo(id, logoType),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: headerKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: headerKeys.list({}) });
      HeaderNotificationService.showLogoRemovalSuccess(HeaderService.getDisplayName(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove logo';
      HeaderNotificationService.showLogoUploadError(errorMessage);
    },
  });
};

// ========================================
// CSS & PREVIEW OPERATIONS
// ========================================

export const useGenerateCSS = () => {
  return useMutation({
    mutationFn: (id: string) => HeaderService.generateCSS(id),
    onSuccess: () => {
      HeaderNotificationService.showCSSGenerationSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate CSS';
      HeaderNotificationService.showCSSGenerationError(errorMessage);
    },
  });
};

export const usePreviewHeader = () => {
  return useMutation({
    mutationFn: (data: CreateHeaderRequest | UpdateHeaderRequest) => HeaderService.previewHeader(data),
    onSuccess: () => {
      HeaderNotificationService.showPreviewGenerated();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate preview';
      HeaderNotificationService.showPreviewError(errorMessage);
    },
  });
};

// ========================================
// IMPORT/EXPORT OPERATIONS
// ========================================

export const useExportHeaders = () => {
  return useMutation({
    mutationFn: ({ format, query }: { format: 'json' | 'csv' | 'pdf'; query?: HeaderQuery }) => 
      HeaderService.exportHeaders(format, query),
    onSuccess: (_, { format }) => {
      HeaderNotificationService.showExportSuccess(format);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export headers';
      HeaderNotificationService.showExportError(errorMessage);
    },
  });
};

export const useImportHeaders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => HeaderService.importHeaders(file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: headerKeys.all });
      HeaderNotificationService.showImportSuccess(result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import headers';
      HeaderNotificationService.showImportError(errorMessage);
    },
  });
};

// ========================================
// SEARCH OPERATIONS
// ========================================

export const useSearchHeaders = () => {
  return useMutation({
    mutationFn: ({ searchTerm, query }: { searchTerm: string; query?: HeaderQuery }) => 
      HeaderService.searchHeaders(searchTerm, query),
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search headers';
      HeaderNotificationService.showHeaderUpdateError(errorMessage);
    },
  });
};

// ========================================
// LOGO MEDIA QUERIES
// ========================================

export const useLogoMedia = (mediaId?: string) => {
  return useMediaItem(mediaId || '', !!mediaId);
};
