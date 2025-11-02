import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OfficeDescription, OfficeDescriptionType, TranslatableEntity } from '../types/office-description';

export interface OfficeDescriptionFormData {
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
}

export interface OfficeDescriptionUIStore {
  // Side panel UI state
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelDescription: OfficeDescription | null;
  isSubmitting: boolean;

  // Form state management (persisted)
  activeFormId: string | 'create' | null;
  formStateById: Record<string, OfficeDescriptionFormData>;
  createFormState: OfficeDescriptionFormData;

  // Actions
  openCreatePanel: (initialType?: OfficeDescriptionType | null) => void;
  openEditPanel: (description: OfficeDescription) => void;
  closePanel: () => void;
  setSubmitting: (isSubmitting: boolean) => void;

  initializeEditForm: (description: OfficeDescription) => void;
  resetCreateForm: () => void;
  updateFormField: (
    id: string | 'create',
    field: keyof OfficeDescriptionFormData,
    value: unknown
  ) => void;
  resetFormState: (id: string | 'create') => void;
}

export const useOfficeDescriptionUIStore = create<OfficeDescriptionUIStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      panelMode: 'create',
      panelDescription: null,
      isSubmitting: false,

      activeFormId: null,
      formStateById: {},
      createFormState: {
        officeDescriptionType: 'INTRODUCTION' as OfficeDescriptionType,
        content: { en: '', ne: '' },
      },

      openCreatePanel: (initialType) => {
        set((state) => ({
          panelOpen: true,
          panelMode: 'create',
          panelDescription: null,
          isSubmitting: false,
          activeFormId: 'create',
          // Initialize type if provided, otherwise preserve existing state
          createFormState: {
            officeDescriptionType: (initialType ?? state.createFormState.officeDescriptionType) as OfficeDescriptionType,
            content: state.createFormState.content,
          },
        }));
      },

      openEditPanel: (description) => {
        const initial: OfficeDescriptionFormData = {
          officeDescriptionType: description.officeDescriptionType,
          content: description.content ?? { en: '', ne: '' },
        };
        set((state) => ({
          panelOpen: true,
          panelMode: 'edit',
          panelDescription: description,
          isSubmitting: false,
          activeFormId: description.id,
          formStateById: { 
            ...state.formStateById, 
            [description.id]: initial 
          },
        }));
      },

      closePanel: () => {
        // If the panel was in create mode, reset the create form so that
        // previously entered data does not persist when the panel is reopened.
        try {
          const mode = get().panelMode;
          if (mode === 'create') {
            get().resetCreateForm();
          }
        } catch (e) {
          // swallow any errors during close
          console.error('Error while resetting create form on closePanel', e);
        }
        set({ panelOpen: false, isSubmitting: false, panelDescription: null, activeFormId: null });
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      initializeEditForm: (description) => {
        const initial: OfficeDescriptionFormData = {
          officeDescriptionType: description.officeDescriptionType,
          content: description.content ?? { en: '', ne: '' },
        };
        set((state) => ({
          formStateById: { ...state.formStateById, [description.id]: initial },
          activeFormId: description.id,
        }));
      },

      resetCreateForm: () => {
        set({
          createFormState: {
            officeDescriptionType: 'INTRODUCTION' as OfficeDescriptionType,
            content: { en: '', ne: '' },
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
                  officeDescriptionType: 'INTRODUCTION' as OfficeDescriptionType,
                  content: { en: '', ne: '' },
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
          const description = get().panelDescription;
          const resetTo: OfficeDescriptionFormData = description && description.id === id
            ? {
                officeDescriptionType: description.officeDescriptionType,
                content: description.content ?? { en: '', ne: '' },
              }
            : {
                officeDescriptionType: 'INTRODUCTION' as OfficeDescriptionType,
                content: { en: '', ne: '' },
              };

          set((state) => ({
            formStateById: { ...state.formStateById, [id]: resetTo },
          }));
        }
      },
    }),
    {
      name: 'office-description-ui-store',
      partialize: (state) => ({
        panelMode: state.panelMode,
        activeFormId: state.activeFormId,
        formStateById: state.formStateById,
        // Persist only the selected type for the create form but not the content
        createFormState: {
          officeDescriptionType: state.createFormState.officeDescriptionType,
          content: { en: '', ne: '' },
        },
      }),
    }
  )
);


