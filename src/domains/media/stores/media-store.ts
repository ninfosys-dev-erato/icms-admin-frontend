import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Media, MediaFormData } from '../types/media';

type PanelMode = 'create' | 'edit';

export interface MediaUIStore {
  panelOpen: boolean;
  panelMode: PanelMode;
  panelMedia: Media | null;
  isSubmitting: boolean;
  selectedTabIndex: number; // 0: library, 1: uploads

  // Form state
  activeFormId: string | 'create' | null;
  formStateById: Record<string, MediaFormData>;
  createFormState: MediaFormData;
  selectedFileById: Record<string, File | null>;
  createSelectedFile: File | null;

  // Actions
  openCreatePanel: () => void;
  openEditPanel: (media: Media) => void;
  closePanel: () => void;
  setSubmitting: (val: boolean) => void;
  setSelectedTabIndex: (index: number) => void;

  updateFormField: (id: string | 'create', field: keyof MediaFormData, value: unknown) => void;
  setSelectedFile: (id: string | 'create', file: File | null) => void;
  resetFormState: (id: string | 'create') => void;
}

export const useMediaStore = create<MediaUIStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      panelMode: 'create',
      panelMedia: null,
      isSubmitting: false,
      selectedTabIndex: 0,

      activeFormId: null,
      formStateById: {},
       createFormState: {
         title: { en: '', ne: '' },
         description: { en: '', ne: '' },
         altText: { en: '', ne: '' },
         tags: [],
         folder: 'general',
         isPublic: true,
         isActive: true,
       },
      selectedFileById: {},
      createSelectedFile: null,

      openCreatePanel: () => {
        set({ panelOpen: true, panelMode: 'create', panelMedia: null, isSubmitting: false, activeFormId: 'create' });
      },

      openEditPanel: (media: Media) => {
        const toTranslatable = (val: unknown) => {
          if (val && typeof val === 'object') {
            const v: any = val as any;
            return { en: (v.en ?? '').toString(), ne: (v.ne ?? '').toString() };
          }
          return { en: (val ?? '').toString(), ne: '' };
        };
        const initial: MediaFormData = {
          title: toTranslatable(media.title),
          description: toTranslatable(media.description),
          altText: toTranslatable(media.altText),
          tags: [...(media.tags ?? [])],
          folder: media.folder,
          isPublic: !!media.isPublic,
          isActive: !!media.isActive,
        };
        set((state) => ({
          panelOpen: true,
          panelMode: 'edit',
          panelMedia: media,
          isSubmitting: false,
          activeFormId: media.id,
          formStateById: { ...state.formStateById, [media.id]: initial },
        }));
      },

      closePanel: () => set({ panelOpen: false, isSubmitting: false }),
      setSubmitting: (val) => set({ isSubmitting: val }),
      setSelectedTabIndex: (index) => set({ selectedTabIndex: index }),

      updateFormField: (id, field, value) => {
        if (id === 'create') {
          set((s) => ({ createFormState: { ...s.createFormState, [field]: value as any } }));
        } else {
          set((s) => ({
            formStateById: {
              ...s.formStateById,
              [id]: {
                ...(s.formStateById[id] ?? {
                  title: { en: '', ne: '' },
                  description: { en: '', ne: '' },
                  altText: { en: '', ne: '' },
                  tags: [],
                  folder: 'general',
                  isPublic: true,
                  isActive: true,
                }),
                [field]: value as any,
              },
            },
          }));
        }
      },

      setSelectedFile: (id, file) => {
        if (id === 'create') set({ createSelectedFile: file });
        else set((s) => ({ selectedFileById: { ...s.selectedFileById, [id]: file } }));
      },

      resetFormState: (id) => {
        if (id === 'create') {
           set({
            createFormState: {
              title: { en: '', ne: '' },
              description: { en: '', ne: '' },
              altText: { en: '', ne: '' },
              tags: [],
              folder: 'general',
              isPublic: true,
              isActive: true,
            },
            createSelectedFile: null,
          });
          return;
        }
        const media = get().panelMedia;
        const toTranslatable = (val: unknown) => {
          if (val && typeof val === 'object') {
            const v: any = val as any;
            return { en: (v.en ?? '').toString(), ne: (v.ne ?? '').toString() };
          }
          return { en: (val ?? '').toString(), ne: '' };
        };
        const resetTo: MediaFormData = media && media.id === id ? {
          title: toTranslatable(media.title),
          description: toTranslatable(media.description),
          altText: toTranslatable(media.altText),
          tags: [...(media.tags ?? [])],
          folder: media.folder,
          isPublic: !!media.isPublic,
          isActive: !!media.isActive,
        } : {
          title: { en: '', ne: '' },
          description: { en: '', ne: '' },
          altText: { en: '', ne: '' },
          tags: [],
          folder: 'general',
          isPublic: true,
          isActive: true,
        };
        set((s) => ({
          formStateById: { ...s.formStateById, [id]: resetTo },
          selectedFileById: { ...s.selectedFileById, [id]: null },
        }));
      },
    }),
    {
      name: 'media-ui-store',
      partialize: (s) => ({
        panelMode: s.panelMode,
        selectedTabIndex: s.selectedTabIndex,
        activeFormId: s.activeFormId,
        formStateById: s.formStateById,
        createFormState: s.createFormState,
      }),
    }
  )
);


