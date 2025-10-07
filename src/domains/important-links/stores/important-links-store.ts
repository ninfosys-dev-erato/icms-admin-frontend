import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImportantLink, ImportantLinkFormData } from '../types/important-links';

export interface ImportantLinksUIStore {
  // UI state for IBM Products SidePanel
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelLink: ImportantLink | null;
  isEditing: boolean;
  isSubmitting: boolean;

  // Form state management
  activeFormId: string | 'create' | null;
  // Persisted form fields
  formStateById: Record<string, ImportantLinkFormData>;
  createFormState: ImportantLinkFormData;

  // UI Actions
  openCreatePanel: () => void;
  openEditPanel: (link: ImportantLink) => void;
  closePanel: () => void;
  setEditing: (isEditing: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;

  // Form Actions
  initializeEditForm: (link: ImportantLink) => void;
  resetCreateForm: () => void;
  updateFormField: (
    id: string | 'create',
    field: keyof ImportantLinkFormData,
    value: unknown
  ) => void;
  resetFormState: (id: string | 'create') => void;
}

export const useImportantLinksStore = create<ImportantLinksUIStore>()(
  persist(
    (set, get) => ({
      // Initial UI state
      panelOpen: false,
      panelMode: 'create',
      panelLink: null,
      isEditing: false,
      isSubmitting: false,

      // Form state
      activeFormId: null,
      formStateById: {},
      createFormState: {
        linkTitle: { en: '', ne: '' },
        linkUrl: '',
        order: 1,
        isActive: true,
      },

      // UI Actions
      openCreatePanel: () => {
        // Reset create form to defaults when opening
        set({
          panelOpen: true,
          panelMode: 'create',
          panelLink: null,
          isEditing: false,
          isSubmitting: false,
          activeFormId: 'create',
        });
      },

      openEditPanel: (link: ImportantLink) => {
        // Always initialize from the provided link to avoid leaking previous state
        const initial: ImportantLinkFormData = {
          linkTitle: link.linkTitle ?? { en: '', ne: '' },
          linkUrl: link.linkUrl,
          order: link.order,
          isActive: link.isActive,
        };
        set((state) => ({
          panelOpen: true,
          panelMode: 'edit',
          panelLink: link,
          isEditing: true,
          isSubmitting: false,
          activeFormId: link.id,
          formStateById: { ...state.formStateById, [link.id]: initial },
        }));
      },

      closePanel: () => {
        set({ panelOpen: false, isEditing: false, isSubmitting: false });
      },

      setEditing: (isEditing: boolean) => {
        set({ isEditing });
      },

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      // Form Actions
      initializeEditForm: (link: ImportantLink) => {
        const initial: ImportantLinkFormData = {
          linkTitle: link.linkTitle ?? { en: '', ne: '' },
          linkUrl: link.linkUrl,
          order: link.order,
          isActive: link.isActive,
        };
        set((state) => ({
          formStateById: { ...state.formStateById, [link.id]: initial },
          activeFormId: link.id,
        }));
      },

      resetCreateForm: () => {
        set({
          createFormState: {
            linkTitle: { en: '', ne: '' },
            linkUrl: '',
            order: 1,
            isActive: true,
          },
        });
      },

      updateFormField: (id, field, value) => {
        if (id === 'create') {
          set((state) => ({
            createFormState: { ...state.createFormState, [field]: value as any },
          }));
        } else {
          set((state) => ({
            formStateById: {
              ...state.formStateById,
              [id]: {
                ...(state.formStateById[id] ?? {
                  linkTitle: { en: '', ne: '' },
                  linkUrl: '',
                  order: 1,
                  isActive: true,
                }),
                [field]: value as any,
              },
            },
          }));
        }
      },

      resetFormState: (id) => {
        if (id === 'create') {
          get().resetCreateForm();
        } else {
          const link = get().panelLink;
          // If we have current link data, reset from it; else reset to defaults
          const resetTo: ImportantLinkFormData = link && link.id === id
            ? {
                linkTitle: link.linkTitle ?? { en: '', ne: '' },
                linkUrl: link.linkUrl,
                order: link.order,
                isActive: link.isActive,
              }
            : {
                linkTitle: { en: '', ne: '' },
                linkUrl: '',
                order: 1,
                isActive: true,
              };

          set((state) => ({
            formStateById: { ...state.formStateById, [id]: resetTo },
          }));
        }
      },
    }),
    {
      name: 'important-links-ui-store',
      // Only persist pure form fields and lightweight UI flags
      partialize: (state) => ({
        panelMode: state.panelMode,
        isEditing: state.isEditing,
        activeFormId: state.activeFormId,
        formStateById: state.formStateById,
        createFormState: state.createFormState,
      }),
    }
  )
);
