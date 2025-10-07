import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DocumentService from '../services/document-service';
import { DocumentNotificationService } from '../services/document-notification-service';
import { 
  Document, 
  DocumentAnalytics, 
  DocumentListResponse, 
  DocumentQuery, 
  DocumentStatistics, 
  DocumentFormData, 
  CreateDocumentRequest, 
  UpdateDocumentRequest,
  BulkOperationResult,
} from '../types/document';

export const documentKeys = {
  all: ['documents'] as const,
  list: (query: Partial<DocumentQuery> = {}) => [...documentKeys.all, 'list', query] as const,
  publicList: () => [...documentKeys.all, 'public'] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  analytics: (id: string) => [...documentKeys.all, 'analytics', id] as const,
  byType: (type: string, query: Partial<DocumentQuery> = {}) => [...documentKeys.all, 'type', type, query] as const,
  byCategory: (category: string, query: Partial<DocumentQuery> = {}) => [...documentKeys.all, 'category', category, query] as const,
  versions: (id: string) => [...documentKeys.all, 'versions', id] as const,
};

// ========================================
// QUERIES
// ========================================

export const useDocuments = (query: Partial<DocumentQuery> = {}) => {
  return useQuery<DocumentListResponse>({
    queryKey: documentKeys.list(query),
    queryFn: () => DocumentService.getDocuments(query),
    placeholderData: (previousData) => previousData,
  });
};

export const usePublicDocuments = () => {
  return useQuery<DocumentListResponse>({
    queryKey: documentKeys.publicList(),
    queryFn: () => DocumentService.getPublicDocuments(),
  });
};

export const useDocument = (id: string, enabled = true) => {
  return useQuery<Document>({
    queryKey: documentKeys.detail(id),
    queryFn: () => DocumentService.getDocumentById(id),
    enabled: !!id && enabled,
  });
};

export const useDocumentStatistics = () => {
  return useQuery<DocumentStatistics>({
    queryKey: documentKeys.stats(),
    queryFn: () => DocumentService.getStatistics(),
  });
};

export const useDocumentAnalytics = (id: string) => {
  return useQuery<DocumentAnalytics>({
    queryKey: documentKeys.analytics(id),
    queryFn: () => DocumentService.getDocumentAnalytics(id),
    enabled: !!id,
  });
};

export const useDocumentsByType = (type: string, query: Partial<DocumentQuery> = {}) => {
  return useQuery<DocumentListResponse>({
    queryKey: documentKeys.byType(type, query),
    queryFn: () => DocumentService.getDocumentsByType(type as any, query),
    enabled: !!type,
  });
};

export const useDocumentsByCategory = (category: string, query: Partial<DocumentQuery> = {}) => {
  return useQuery<DocumentListResponse>({
    queryKey: documentKeys.byCategory(category, query),
    queryFn: () => DocumentService.getDocumentsByCategory(category as any, query),
    enabled: !!category,
  });
};

export const useDocumentVersions = (id: string) => {
  return useQuery<any[]>({
    queryKey: documentKeys.versions(id),
    queryFn: () => DocumentService.getDocumentVersions(id),
    enabled: !!id,
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentRequest) => DocumentService.createDocument(payload),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showDocumentCreated(DocumentService.getDisplayTitle(document));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create document';
      DocumentNotificationService.showDocumentCreationError(errorMessage);
    },
  });
};

export const useUpdateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) => 
      DocumentService.updateDocument(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: documentKeys.list({}) });
      qc.invalidateQueries({ queryKey: documentKeys.detail(updated.id) });
      DocumentNotificationService.showDocumentUpdated(DocumentService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update document';
      DocumentNotificationService.showDocumentUpdateError(errorMessage);
    },
  });
};

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DocumentService.deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showDocumentDeleted('Document');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
      DocumentNotificationService.showDocumentDeletionError(errorMessage);
    },
  });
};

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: Partial<CreateDocumentRequest> }) => 
      DocumentService.uploadDocument(file, metadata),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showDocumentUploadSuccess(DocumentService.getDisplayTitle(document));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      DocumentNotificationService.showDocumentUploadError(errorMessage);
    },
  });
};

export const useCreateDocumentVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, file, version, changeLog }: { 
      documentId: string; 
      file: File; 
      version: string; 
      changeLog?: any; 
    }) => DocumentService.createDocumentVersion(documentId, file, version, changeLog),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.detail(document.id) });
      qc.invalidateQueries({ queryKey: documentKeys.versions(document.id) });
      DocumentNotificationService.showVersionCreated(
        DocumentService.getDisplayTitle(document), 
        document.version || 'unknown'
      );
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create document version';
      DocumentNotificationService.showVersionCreationError(errorMessage);
    },
  });
};

export const useBulkUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<UpdateDocumentRequest> }) => 
      DocumentService.bulkUpdate(ids, updates),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showBulkOperationSuccess('updated', result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update documents';
      DocumentNotificationService.showBulkOperationError('Update', errorMessage);
    },
  });
};

export const useBulkDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => DocumentService.bulkDelete(ids),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showBulkOperationSuccess('deleted', result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete documents';
      DocumentNotificationService.showBulkOperationError('Delete', errorMessage);
    },
  });
};

export const useBulkPublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => DocumentService.bulkUpdate(ids, { status: 'PUBLISHED' as any }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showBulkOperationSuccess('published', result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk publish documents';
      DocumentNotificationService.showBulkOperationError('Publish', errorMessage);
    },
  });
};

export const useBulkArchive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => DocumentService.bulkUpdate(ids, { status: 'ARCHIVED' as any }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showBulkOperationSuccess('archived', result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk archive documents';
      DocumentNotificationService.showBulkOperationError('Archive', errorMessage);
    },
  });
};

export const useExportDocuments = () => {
  return useMutation({
    mutationFn: ({ query, format }: { query: DocumentQuery; format: string }) => 
      DocumentService.exportDocuments(query, format),
    onSuccess: (blob, { query, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      DocumentNotificationService.showExportSuccess(format, 0); // Count not available in blob
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export documents';
      DocumentNotificationService.showExportError(errorMessage);
    },
  });
};

export const useImportDocuments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => DocumentService.importDocuments(file),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showImportSuccess(result.success);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import documents';
      DocumentNotificationService.showImportError(errorMessage);
    },
  });
};

export const useCreateDocumentWithFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: DocumentFormData }) => 
      DocumentService.uploadDocument(file, data),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showDocumentCreated(DocumentService.getDisplayTitle(document));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create document with file';
      DocumentNotificationService.showDocumentCreationError(errorMessage);
    },
  });
};

export const usePublishDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DocumentService.updateDocument(id, { status: 'PUBLISHED' as any }),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showPublishSuccess(DocumentService.getDisplayTitle(document));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish document';
      DocumentNotificationService.showDocumentUpdateError(errorMessage);
    },
  });
};

export const useArchiveDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DocumentService.updateDocument(id, { status: 'ARCHIVED' as any }),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentKeys.all });
      DocumentNotificationService.showArchiveSuccess(DocumentService.getDisplayTitle(document));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive document';
      DocumentNotificationService.showDocumentUpdateError(errorMessage);
    },
  });
};
