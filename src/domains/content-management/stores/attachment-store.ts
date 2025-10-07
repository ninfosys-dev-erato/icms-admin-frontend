import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentAttachment, AttachmentFormData } from '../types/attachment';

export interface AttachmentUIStore {
  // UI state
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelAttachment: ContentAttachment | null;
  selectedContentId: string | null;
  isSubmitting: boolean;

  // Form state
  formData: AttachmentFormData;
  selectedFiles: File[];
  isUploading: boolean;

  // Actions
  openCreatePanel: (contentId: string) => void;
  openEditPanel: (attachment: ContentAttachment) => void;
  closePanel: () => void;
  setSelectedContentId: (contentId: string | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setUploading: (isUploading: boolean) => void;
  updateFormField: (field: keyof AttachmentFormData, value: unknown) => void;
  setSelectedFiles: (files: File[]) => void;
  resetForm: () => void;
}

export const useAttachmentStore = create<AttachmentUIStore>()(
  persist(
    (set, get) => ({
      // Initial UI state
      panelOpen: false,
      panelMode: 'create',
      panelAttachment: null,
      selectedContentId: null,
      isSubmitting: false,

      // Form state
      formData: {
        altText: '',
        description: '',
        order: 0,
      },
      selectedFiles: [],
      isUploading: false,

      // Actions
      openCreatePanel: (contentId: string) => {
        set({
          panelOpen: true,
          panelMode: 'create',
          panelAttachment: null,
          selectedContentId: contentId,
          isSubmitting: false,
          isUploading: false,
          formData: {
            altText: '',
            description: '',
            order: 0,
          },
          selectedFiles: [],
        });
      },

      openEditPanel: (attachment: ContentAttachment) => {
        set({
          panelOpen: true,
          panelMode: 'edit',
          panelAttachment: attachment,
          selectedContentId: attachment.contentId,
          isSubmitting: false,
          isUploading: false,
          formData: {
            altText: attachment.altText || '',
            description: attachment.description || '',
            order: attachment.order,
          },
          selectedFiles: [],
        });
      },

      closePanel: () => {
        set({
          panelOpen: false,
          panelMode: 'create',
          panelAttachment: null,
          isSubmitting: false,
          isUploading: false,
        });
      },

      setSelectedContentId: (contentId: string | null) => {
        set({ selectedContentId: contentId });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setUploading: (isUploading: boolean) => {
        set({ isUploading });
      },

      updateFormField: (field: keyof AttachmentFormData, value: unknown) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [field]: value as any,
          },
        }));
      },

      setSelectedFiles: (files: File[]) => {
        set({ selectedFiles: files });
      },

      resetForm: () => {
        set({
          formData: {
            altText: '',
            description: '',
            order: 0,
          },
          selectedFiles: [],
        });
      },
    }),
    {
      name: 'attachment-ui-store',
      // Only persist lightweight UI flags and form data
      partialize: (state) => ({
        panelMode: state.panelMode,
        selectedContentId: state.selectedContentId,
        formData: state.formData,
      }),
    }
  )
);
