import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Document,
  DocumentQuery,
  DocumentFormData,
  DocumentStatistics,
  DocumentStore as DocumentStoreType,
  DocumentCategory,
  DocumentStatus,
} from '../types/document';

const initialFormState: DocumentFormData = {
  title: { en: '', ne: '' },
  description: { en: '', ne: '' },
  category: DocumentCategory.OFFICIAL,
  status: DocumentStatus.DRAFT,
  documentNumber: '',
  version: '1.0',
  publishDate: undefined,
  expiryDate: undefined,
  tags: [],
  isPublic: true,
  requiresAuth: false,
  order: 0,
  isActive: true,
};

export const useDocumentStore = create<DocumentStoreType>()(
  devtools(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      documents: [],
      currentDocument: null,
      loading: false,
      error: null,
      isEditing: false,
      isUploading: false,
      pagination: null,
      statistics: null,
      
      // UI state for panel
      panelOpen: false,
      panelMode: 'create',
      panelDocument: null,
      
      // Query state and request tracking
      currentQuery: {},
      hasLoaded: false,
      
      // Form state management
      createFormState: { ...initialFormState },
      formStateById: {},
      activeFormId: null,
      isSubmitting: false,
      
      // File management
      selectedFile: null,
      selectedFileById: {},

      // ========================================
      // ACTIONS
      // ========================================

      // List operations
      loadDocuments: async (query?: DocumentQuery) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
          // For now, just update the query state
          set({ currentQuery: query || {}, hasLoaded: true });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load documents' });
        } finally {
          set({ loading: false });
        }
      },

      searchDocuments: async (searchTerm: string, query?: DocumentQuery) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
          set({ currentQuery: { ...query, search: searchTerm } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to search documents' });
        } finally {
          set({ loading: false });
        }
      },

      loadPublicDocuments: async () => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load public documents' });
        } finally {
          set({ loading: false });
        }
      },

      // CRUD operations
      getDocumentById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to get document' });
        } finally {
          set({ loading: false });
        }
      },

      createDocument: async (data: any) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create document' });
        } finally {
          set({ loading: false });
        }
      },

      updateDocument: async (id: string, data: any) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update document' });
        } finally {
          set({ loading: false });
        }
      },

      deleteDocument: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete document' });
        } finally {
          set({ loading: false });
        }
      },

      // File operations
      uploadDocument: async (file: File, metadata?: any) => {
        set({ isUploading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to upload document' });
        } finally {
          set({ isUploading: false });
        }
      },

      createDocumentVersion: async (documentId: string, file: File, version: string, changeLog?: any) => {
        set({ isUploading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create document version' });
        } finally {
          set({ isUploading: false });
        }
      },

      // Bulk operations
      bulkUpdate: async (ids: string[], updates: any) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk update documents' });
        } finally {
          set({ loading: false });
        }
      },

      bulkDelete: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk delete documents' });
        } finally {
          set({ loading: false });
        }
      },

      bulkPublish: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk publish documents' });
        } finally {
          set({ loading: false });
        }
      },

      bulkArchive: async (ids: string[]) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to bulk archive documents' });
        } finally {
          set({ loading: false });
        }
      },

      // Status operations
      publishDocument: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to publish document' });
        } finally {
          set({ loading: false });
        }
      },

      archiveDocument: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to archive document' });
        } finally {
          set({ loading: false });
        }
      },

      // Analytics
      loadStatistics: async () => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load statistics' });
        } finally {
          set({ loading: false });
        }
      },

      getDocumentAnalytics: async (id: string) => {
        set({ loading: true, error: null });
        try {
          // This would typically call the service
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to get document analytics' });
        } finally {
          set({ loading: false });
        }
      },

      // State management
      setCurrentDocument: (document: Document | null) => {
        set({ currentDocument: document });
      },

      setEditing: (isEditing: boolean) => {
        set({ isEditing });
      },

      clearError: () => {
        set({ error: null });
      },

      // Panel management
      openCreatePanel: () => {
        set({ 
          panelOpen: true, 
          panelMode: 'create', 
          panelDocument: null,
          createFormState: { ...initialFormState },
          selectedFile: null,
        });
      },

      openEditPanel: (document: Document) => {
        set({ 
          panelOpen: true, 
          panelMode: 'edit', 
          panelDocument: document,
          selectedFile: null,
        });
        get().initializeEditForm(document);
      },

      closePanel: () => {
        set({ 
          panelOpen: false, 
          panelMode: 'create', 
          panelDocument: null,
          isSubmitting: false,
        });
      },

      // Form management
      updateFormField: (formType: 'create' | 'edit', field: keyof DocumentFormData, value: unknown) => {
        if (formType === 'create') {
          set((state) => ({
            createFormState: {
              ...state.createFormState,
              [field]: value,
            },
          }));
        }
      },

      updateFormFieldById: (id: string, field: keyof DocumentFormData, value: unknown) => {
        set((state) => ({
          formStateById: {
            ...state.formStateById,
            [id]: {
              ...state.formStateById[id],
              [field]: value,
            },
          },
        }));
      },

      initializeEditForm: (document: Document) => {
        const formData: DocumentFormData = {
          title: document.title || { en: '', ne: '' },
          description: document.description || { en: '', ne: '' },
          category: document.category,
          status: document.status,
          documentNumber: document.documentNumber || '',
          version: document.version || '1.0',
          publishDate: document.publishDate ? new Date(document.publishDate) : undefined,
          expiryDate: document.expiryDate ? new Date(document.expiryDate) : undefined,
          tags: document.tags || [],
          isPublic: document.isPublic,
          requiresAuth: document.requiresAuth,
          order: document.order,
          isActive: document.isActive,
        };

        set((state) => ({
          formStateById: {
            ...state.formStateById,
            [document.id]: formData,
          },
          activeFormId: document.id,
        }));
      },

      resetCreateForm: () => {
        set({ 
          createFormState: { ...initialFormState },
          selectedFile: null,
        });
      },

      resetFormState: (id: string) => {
        set((state) => {
          const newFormStateById = { ...state.formStateById };
          delete newFormStateById[id];
          return { formStateById: newFormStateById };
        });
      },

      setSubmitting: (submitting: boolean) => {
        set({ isSubmitting: submitting });
      },

      // File management
      setSelectedFile: (formType: 'create' | 'edit', file: File | null) => {
        if (formType === 'create') {
          set({ selectedFile: file });
        }
      },

      setSelectedFileById: (id: string, file: File | null) => {
        set((state) => ({
          selectedFileById: {
            ...state.selectedFileById,
            [id]: file,
          },
        }));
      },

      // internal control
      _requestSeq: 0,
    }),
    {
      name: 'document-store',
    }
  )
);
