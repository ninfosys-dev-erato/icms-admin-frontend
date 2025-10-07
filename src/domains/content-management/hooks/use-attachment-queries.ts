import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttachmentService } from '../services/attachment-service';
import { 
  ContentAttachment, 
  CreateAttachmentDto, 
  UpdateAttachmentDto, 
  ReorderItemDto,
  AttachmentQuery, 
  AttachmentListResponse,
  AttachmentStatistics 
} from '../types/attachment';

/**
 * Attachment queries and mutations with optimistic updates
 * 
 * Key improvements:
 * - Optimistic updates for create/delete operations for instant UI feedback
 * - Proper query invalidation including presigned URL queries
 * - Rollback mechanism for failed operations
 * - Better cache management for consistent state
 */

export const attachmentKeys = {
  all: ['attachments'] as const,
  list: (query: Partial<AttachmentQuery> = {}) => [...attachmentKeys.all, 'list', query] as const,
  byContent: (contentId: string) => [...attachmentKeys.all, 'byContent', contentId] as const,
  detail: (id: string) => [...attachmentKeys.all, 'detail', id] as const,
  stats: () => [...attachmentKeys.all, 'stats'] as const,
  presignedUrl: (id: string, expiresIn?: number, operation?: string) => [...attachmentKeys.all, 'presignedUrl', id, expiresIn, operation] as const,
  withPresignedUrls: (contentId: string, expiresIn?: number) => [...attachmentKeys.all, 'withPresignedUrls', contentId, expiresIn] as const,
};

// ========================================
// QUERIES
// ========================================

export const useAttachments = (query: Partial<AttachmentQuery> = {}) => {
  return useQuery<AttachmentListResponse>({
    queryKey: attachmentKeys.list(query),
    queryFn: () => AttachmentService.getAttachments(query),
    placeholderData: (previousData) => previousData,
  });
};

export const useAttachmentsByContent = (contentId: string, enabled = true) => {
  return useQuery<ContentAttachment[]>({
    queryKey: attachmentKeys.byContent(contentId),
    queryFn: () => AttachmentService.getAttachmentsByContent(contentId),
    enabled: !!contentId && enabled,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce unnecessary requests
  });
};

export const useAttachment = (id: string, enabled = true) => {
  return useQuery<ContentAttachment>({
    queryKey: attachmentKeys.detail(id),
    queryFn: () => AttachmentService.getAttachmentById(id),
    enabled: !!id && enabled,
  });
};

export const useAttachmentStatistics = () => {
  return useQuery<AttachmentStatistics>({
    queryKey: attachmentKeys.stats(),
    queryFn: () => AttachmentService.getAttachmentStatistics(),
  });
};

export const useAttachmentPresignedUrl = (id: string, expiresIn?: number, operation?: 'get' | 'put', enabled = true) => {
  return useQuery<string | null>({
    queryKey: attachmentKeys.presignedUrl(id, expiresIn, operation),
    queryFn: async () => {
      try {
        return await AttachmentService.getPresignedUrl(id, expiresIn, operation);
      } catch (error) {
        console.warn('Failed to get presigned URL:', error);
        return null; // Return null instead of throwing
      }
    },
    enabled: !!id && enabled,
    staleTime: (expiresIn || 86400) * 1000 - 60000, // Expire 1 minute before URL expires
    retry: 1, // Only retry once
    retryDelay: 1000,
  });
};

export const useAttachmentsWithPresignedUrls = (contentId: string, expiresIn?: number, enabled = true) => {
  return useQuery<ContentAttachment[]>({
    queryKey: attachmentKeys.withPresignedUrls(contentId, expiresIn),
    queryFn: async () => {
      try {
        return await AttachmentService.getAttachmentsWithPresignedUrls(contentId, expiresIn);
      } catch (error) {
        console.warn('Failed to get attachments with presigned URLs:', error);
        // Fallback to regular attachments without presigned URLs
        return AttachmentService.getAttachmentsByContent(contentId);
      }
    },
    enabled: !!contentId && enabled,
    staleTime: (expiresIn || 86400) * 1000 - 60000, // Expire 1 minute before URL expires
    retry: 1, // Only retry once
    retryDelay: 1000,
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid flickering
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, file }: { data: CreateAttachmentDto; file: File }) => 
      AttachmentService.createAttachment(data, file),
    onMutate: async ({ data, file }) => {
      console.log('🔄 Creating attachment optimistically:', data.fileName || file.name);
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await qc.cancelQueries({ queryKey: attachmentKeys.byContent(data.contentId) });
      await qc.cancelQueries({ queryKey: attachmentKeys.withPresignedUrls(data.contentId) });
      
      // Snapshot the previous values
      const previousAttachments = qc.getQueryData<ContentAttachment[]>(
        attachmentKeys.byContent(data.contentId)
      );
      const previousWithPresigned = qc.getQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(data.contentId)
      );

      console.log('📊 Previous attachments count:', previousWithPresigned?.length || 0);

      // Create optimistic attachment
      const optimisticAttachment: ContentAttachment = {
        id: `temp-${Date.now()}`, // Temporary ID
        contentId: data.contentId,
        fileName: data.fileName || file.name,
        originalName: data.originalName || file.name,
        filePath: '',
        fileSize: file.size,
        mimeType: file.type,
        order: data.order || 0,
        altText: data.altText || '',
        description: data.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        presignedUrl: undefined, // Will be undefined initially
      };

      // Optimistically update the cache
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.byContent(data.contentId),
        (old) => {
          const updated = old ? [...old, optimisticAttachment] : [optimisticAttachment];
          console.log('✅ Updated byContent cache, new count:', updated.length);
          return updated;
        }
      );
      
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(data.contentId),
        (old) => {
          const updated = old ? [...old, optimisticAttachment] : [optimisticAttachment];
          console.log('✅ Updated withPresignedUrls cache, new count:', updated.length);
          return updated;
        }
      );

      // Return a context object with the snapshotted values
      return { previousAttachments, previousWithPresigned, contentId: data.contentId };
    },
    onSuccess: async (attachment) => {
      console.log('🎉 Attachment creation succeeded:', attachment.fileName);
      
      // First, update the regular attachments cache with the new attachment
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.byContent(attachment.contentId),
        (old) => {
          if (!old) return [attachment];
          // Replace optimistic with real attachment, or add if not found
          const hasOptimistic = old.some(item => item.id.startsWith('temp-'));
          if (hasOptimistic) {
            return old.map(item => item.id.startsWith('temp-') ? attachment : item);
          } else {
            return [...old, attachment];
          }
        }
      );

      // Force immediate update of the presigned URLs cache
      // First, get the current data to preserve other attachments
      const currentData = qc.getQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(attachment.contentId)
      );
      
      // Update with new attachment
      const updatedData = currentData ? 
        currentData.map(item => item.id.startsWith('temp-') ? attachment : item) :
        [attachment];
      
      // If no optimistic attachment was found, add the new one
      if (currentData && !currentData.some(item => item.id.startsWith('temp-'))) {
        updatedData.push(attachment);
      }

      // Force update the cache immediately
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(attachment.contentId),
        updatedData
      );

      console.log('🔄 Manually updated cache with new attachment count:', updatedData.length);
      
      // Then force a refetch to get fresh presigned URLs
      await qc.refetchQueries({ 
        queryKey: attachmentKeys.withPresignedUrls(attachment.contentId),
        exact: true 
      });
      
      // Also invalidate other related queries
      qc.invalidateQueries({ queryKey: attachmentKeys.list({}) });
      qc.invalidateQueries({ queryKey: attachmentKeys.stats() });
      
      console.log('🔄 Refetched and invalidated queries for contentId:', attachment.contentId);
    },
    onError: (error, variables, context) => {
      console.error('❌ Attachment creation error:', error);
      
      // Rollback the optimistic update if it fails
      if (context) {
        if (context.previousAttachments !== undefined) {
          qc.setQueryData(attachmentKeys.byContent(context.contentId), context.previousAttachments);
          console.log('⏪ Rolled back byContent cache');
        }
        if (context.previousWithPresigned !== undefined) {
          qc.setQueryData(attachmentKeys.withPresignedUrls(context.contentId), context.previousWithPresigned);
          console.log('⏪ Rolled back withPresignedUrls cache');
        }
      }
    },
  });
};

export const useUpdateAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttachmentDto }) => 
      AttachmentService.updateAttachment(id, data),
    onSuccess: (updated) => {
      // Update the specific attachment in the cache
      qc.setQueryData(attachmentKeys.detail(updated.id), updated);
      
      // Invalidate and refetch all related queries
      qc.invalidateQueries({ queryKey: attachmentKeys.byContent(updated.contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.withPresignedUrls(updated.contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.list({}) });
    },
    onError: (error) => {
      console.error('Attachment update error:', error);
    },
  });
};

export const useDeleteAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AttachmentService.deleteAttachment(id),
    onMutate: async (deletedId) => {
      console.log('🗑️ Deleting attachment optimistically:', deletedId);
      
      // First, try to find the attachment in any of the cached queries to get its contentId
      let contentId: string | null = null;
      
      // Check detail cache first
      const detailAttachment = qc.getQueryData<ContentAttachment>(attachmentKeys.detail(deletedId));
      if (detailAttachment) {
        contentId = detailAttachment.contentId;
        console.log('📍 Found contentId from detail cache:', contentId);
      }
      
      // If not found, search through all cached content queries
      if (!contentId) {
        const queryCache = qc.getQueryCache();
        const queries = queryCache.getAll();
        
        for (const query of queries) {
          const queryKey = query.queryKey;
          if (queryKey[0] === 'attachments' && (queryKey[1] === 'byContent' || queryKey[1] === 'withPresignedUrls')) {
            const attachments = query.state.data as ContentAttachment[] | undefined;
            if (attachments) {
              const attachment = attachments.find(att => att.id === deletedId);
              if (attachment) {
                contentId = attachment.contentId;
                console.log('📍 Found contentId from query cache:', contentId, 'query:', queryKey);
                break;
              }
            }
          }
        }
      }
      
      if (!contentId) {
        console.warn('⚠️ Could not find contentId for attachment', deletedId);
        return { deletedId, contentId: null, snapshots: {} };
      }

      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: attachmentKeys.byContent(contentId) });
      await qc.cancelQueries({ queryKey: attachmentKeys.withPresignedUrls(contentId) });
      
      // Snapshot the previous values
      const previousAttachments = qc.getQueryData<ContentAttachment[]>(
        attachmentKeys.byContent(contentId)
      );
      const previousWithPresigned = qc.getQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(contentId)
      );

      console.log('📊 Previous attachments count (withPresigned):', previousWithPresigned?.length || 0);

      // Optimistically remove the attachment
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.byContent(contentId),
        (old) => {
          const updated = old?.filter(attachment => attachment.id !== deletedId) || [];
          console.log('✅ Updated byContent cache after delete, new count:', updated.length);
          return updated;
        }
      );
      
      qc.setQueryData<ContentAttachment[]>(
        attachmentKeys.withPresignedUrls(contentId),
        (old) => {
          const updated = old?.filter(attachment => attachment.id !== deletedId) || [];
          console.log('✅ Updated withPresignedUrls cache after delete, new count:', updated.length);
          return updated;
        }
      );

      return { 
        deletedId, 
        contentId, 
        snapshots: {
          previousAttachments,
          previousWithPresigned
        }
      };
    },
    onSuccess: async (_, deletedId, context) => {
      console.log('🎉 Attachment deletion succeeded:', deletedId);
      
      if (context?.contentId) {
        // Force immediate update of both caches
        qc.setQueryData<ContentAttachment[]>(
          attachmentKeys.byContent(context.contentId),
          (old) => old?.filter(attachment => attachment.id !== deletedId) || []
        );

        qc.setQueryData<ContentAttachment[]>(
          attachmentKeys.withPresignedUrls(context.contentId),
          (old) => old?.filter(attachment => attachment.id !== deletedId) || []
        );

        console.log('🔄 Manually removed attachment from cache');
        
        // Force immediate refetch of the presigned URLs query
        await qc.refetchQueries({ 
          queryKey: attachmentKeys.withPresignedUrls(context.contentId),
          exact: true 
        });
        
        // Also invalidate other related queries
        qc.invalidateQueries({ queryKey: attachmentKeys.byContent(context.contentId) });
        console.log('🔄 Refetched and invalidated queries for contentId:', context.contentId);
      }
      qc.invalidateQueries({ queryKey: attachmentKeys.list({}) });
      qc.invalidateQueries({ queryKey: attachmentKeys.stats() });
      // Remove the individual attachment cache as well
      qc.removeQueries({ queryKey: attachmentKeys.detail(deletedId) });
      console.log('🗑️ Removed detail cache for:', deletedId);
    },
    onError: (error, deletedId, context) => {
      console.error('❌ Attachment deletion error:', error);
      
      // Rollback the optimistic update if it fails
      if (context?.contentId && context.snapshots) {
        if (context.snapshots.previousAttachments !== undefined) {
          qc.setQueryData(attachmentKeys.byContent(context.contentId), context.snapshots.previousAttachments);
          console.log('⏪ Rolled back byContent cache');
        }
        if (context.snapshots.previousWithPresigned !== undefined) {
          qc.setQueryData(attachmentKeys.withPresignedUrls(context.contentId), context.snapshots.previousWithPresigned);
          console.log('⏪ Rolled back withPresignedUrls cache');
        }
      }
    },
  });
};

export const useReorderAttachments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, orders }: { contentId: string; orders: ReorderItemDto[] }) => 
      AttachmentService.reorderAttachments(contentId, orders),
    onSuccess: (_, { contentId }) => {
      qc.invalidateQueries({ queryKey: attachmentKeys.byContent(contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.withPresignedUrls(contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.list({}) });
    },
    onError: (error) => {
      console.error('Attachment reorder error:', error);
    },
  });
};

export const useBulkDeleteAttachments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => AttachmentService.bulkDeleteAttachments(ids),
    onSuccess: () => {
      // Since we don't know which content IDs were affected, invalidate all queries
      qc.invalidateQueries({ queryKey: attachmentKeys.all });
    },
    onError: (error) => {
      console.error('Bulk attachment deletion error:', error);
    },
  });
};

export const useDownloadAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AttachmentService.downloadAttachment(id),
    onSuccess: (blob, id) => {
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from content disposition or use ID
      const attachment = qc.getQueryData<ContentAttachment>(attachmentKeys.detail(id));
      const filename = attachment?.fileName || `attachment-${id}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Attachment download error:', error);
    },
  });
};

// ========================================
// UTILITY HOOKS
// ========================================

export const useAttachmentQueries = () => {
  return {
    // Queries
    useAttachments,
    useAttachmentsByContent,
    useAttachment,
    useAttachmentStatistics,
    
    // Mutations
    useCreateAttachment,
    useUpdateAttachment,
    useDeleteAttachment,
    useReorderAttachments,
    useBulkDeleteAttachments,
    useDownloadAttachment,
  };
};

// Helper hook to manage attachment operations for a specific content
export const useAttachmentOperations = (contentId: string) => {
  const createMutation = useCreateAttachment();
  const updateMutation = useUpdateAttachment();
  const deleteMutation = useDeleteAttachment();
  const downloadMutation = useDownloadAttachment();
  
  // Get attachments with presigned URLs (the main query used by UI components)
  const attachmentsQuery = useAttachmentsWithPresignedUrls(contentId, 86400, !!contentId);

  const isLoading = attachmentsQuery.isLoading;
  const isMutating = createMutation.isPending || updateMutation.isPending || 
                   deleteMutation.isPending || downloadMutation.isPending;
  
  return {
    // Data
    attachments: attachmentsQuery.data || [],
    isLoading,
    isMutating,
    error: attachmentsQuery.error,
    
    // Actions
    createAttachment: createMutation.mutate,
    createAttachmentAsync: createMutation.mutateAsync,
    updateAttachment: updateMutation.mutate,
    updateAttachmentAsync: updateMutation.mutateAsync,
    deleteAttachment: deleteMutation.mutate,
    deleteAttachmentAsync: deleteMutation.mutateAsync,
    downloadAttachment: downloadMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDownloading: downloadMutation.isPending,
    
    // Refetch
    refetch: attachmentsQuery.refetch,
  };
};

// Simpler version with just immediate invalidation (fallback approach)
export const useSimpleCreateAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, file }: { data: CreateAttachmentDto; file: File }) => 
      AttachmentService.createAttachment(data, file),
    onSuccess: (attachment) => {
      console.log('🎉 Simple attachment creation succeeded:', attachment.fileName);
      // Immediately invalidate all related queries
      qc.invalidateQueries({ queryKey: attachmentKeys.byContent(attachment.contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.withPresignedUrls(attachment.contentId) });
      qc.invalidateQueries({ queryKey: attachmentKeys.list({}) });
      qc.invalidateQueries({ queryKey: attachmentKeys.stats() });
    },
    onError: (error) => {
      console.error('❌ Simple attachment creation error:', error);
    },
  });
};

export const useSimpleDeleteAttachment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AttachmentService.deleteAttachment(id),
    onSuccess: (_, deletedId) => {
      console.log('🎉 Simple attachment deletion succeeded:', deletedId);
      // Invalidate all attachment queries to be safe
      qc.invalidateQueries({ queryKey: attachmentKeys.all });
      qc.removeQueries({ queryKey: attachmentKeys.detail(deletedId) });
    },
    onError: (error) => {
      console.error('❌ Simple attachment deletion error:', error);
    },
  });
};
