import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Slider, SliderFormData } from '../types/slider';

export interface SliderUIStore {
  // UI state for IBM Products SidePanel
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelSlider: Slider | null;
  isEditing: boolean;
  isSubmitting: boolean;

  // Form state management
  activeFormId: string | 'create' | null;
  // Persisted form fields (exclude any File objects)
  formStateById: Record<string, SliderFormData>;
  createFormState: SliderFormData;
  // Non-persisted selected files
  selectedFileById: Record<string, File | null>;
  createSelectedFile: File | null;

  // UI Actions
  openCreatePanel: () => void;
  openEditPanel: (slider: Slider) => void;
  closePanel: () => void;
  setEditing: (isEditing: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;

  // Form Actions
  initializeEditForm: (slider: Slider) => void;
  resetCreateForm: () => void;
  updateFormField: (
    id: string | 'create',
    field: keyof SliderFormData,
    value: unknown
  ) => void;
  setSelectedFile: (id: string | 'create', file: File | null) => void;
  resetFormState: (id: string | 'create') => void;
}

export const useSliderStore = create<SliderUIStore>()(
  persist(
    (set, get) => ({
      // Initial UI state
      panelOpen: false,
      panelMode: 'create',
      panelSlider: null,
      isEditing: false,
      isSubmitting: false,

      // Form state
      activeFormId: null,
      formStateById: {},
      createFormState: {
        title: { en: '', ne: '' },
        position: 1,
        displayTime: 5000,
        isActive: true,
      },
      selectedFileById: {},
      createSelectedFile: null,

      // UI Actions
      openCreatePanel: () => {
        // Reset create form to defaults when opening
        set({
          panelOpen: true,
          panelMode: 'create',
          panelSlider: null,
          isEditing: false,
          isSubmitting: false,
          activeFormId: 'create',
        });
      },

      openEditPanel: (slider: Slider) => {
        // Always initialize from the provided slider to avoid leaking previous state
        const initial: SliderFormData = {
          title: slider.title ?? { en: '', ne: '' },
          position: slider.position,
          displayTime: slider.displayTime,
          isActive: slider.isActive,
        };
        set((state) => ({
          panelOpen: true,
          panelMode: 'edit',
          panelSlider: slider,
          isEditing: true,
          isSubmitting: false,
          activeFormId: slider.id,
          formStateById: { ...state.formStateById, [slider.id]: initial },
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
      initializeEditForm: (slider: Slider) => {
        const initial: SliderFormData = {
          title: slider.title ?? { en: '', ne: '' },
          position: slider.position,
          displayTime: slider.displayTime,
          isActive: slider.isActive,
        };
        set((state) => ({
          formStateById: { ...state.formStateById, [slider.id]: initial },
          activeFormId: slider.id,
        }));
      },

      resetCreateForm: () => {
        set({
          createFormState: {
            title: { en: '', ne: '' },
            position: 1,
            displayTime: 5000,
            isActive: true,
          },
          createSelectedFile: null,
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
                  title: { en: '', ne: '' },
                  position: 1,
                  displayTime: 5000,
                  isActive: true,
                }),
                [field]: value as any,
              },
            },
          }));
        }
      },

      setSelectedFile: (id, file) => {
        if (id === 'create') {
          set({ createSelectedFile: file });
        } else {
          set((state) => ({
            selectedFileById: { ...state.selectedFileById, [id]: file },
          }));
        }
      },

      resetFormState: (id) => {
        if (id === 'create') {
          get().resetCreateForm();
        } else {
          const slider = get().panelSlider;
          // If we have current slider data, reset from it; else reset to defaults
          const resetTo: SliderFormData = slider && slider.id === id
            ? {
                title: slider.title ?? { en: '', ne: '' },
                position: slider.position,
                displayTime: slider.displayTime,
                isActive: slider.isActive,
              }
            : {
                title: { en: '', ne: '' },
                position: 1,
                displayTime: 5000,
                isActive: true,
              };

          set((state) => ({
            formStateById: { ...state.formStateById, [id]: resetTo },
            selectedFileById: { ...state.selectedFileById, [id]: null },
          }));
        }
      },
    }),
    {
      name: 'slider-ui-store',
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