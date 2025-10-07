import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Album } from '../types/album';

type PanelMode = 'create' | 'edit';

interface AlbumFormState {
  name: { en: string; ne: string };
  description: { en: string; ne: string };
  isActive: boolean;
}

export interface AlbumUIStore {
  panelOpen: boolean;
  panelMode: PanelMode;
  panelAlbum: Album | null;
  isSubmitting: boolean;

  activeFormId: string | 'create' | null;
  formStateById: Record<string, AlbumFormState>;
  createFormState: AlbumFormState;

  openCreatePanel: () => void;
  openEditPanel: (album: Album) => void;
  closePanel: () => void;
  setSubmitting: (val: boolean) => void;

  updateFormField: (id: string | 'create', field: keyof AlbumFormState, value: unknown) => void;
  resetFormState: (id: string | 'create') => void;
}

export const useAlbumStore = create<AlbumUIStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      panelMode: 'create',
      panelAlbum: null,
      isSubmitting: false,

      activeFormId: null,
      formStateById: {},
      createFormState: {
        name: { en: '', ne: '' },
        description: { en: '', ne: '' },
        isActive: true,
      },

      openCreatePanel: () => set({ panelOpen: true, panelMode: 'create', panelAlbum: null, isSubmitting: false, activeFormId: 'create' }),

      openEditPanel: (album: Album) => set((s) => ({
        panelOpen: true,
        panelMode: 'edit',
        panelAlbum: album,
        isSubmitting: false,
        activeFormId: album.id,
        formStateById: {
          ...s.formStateById,
          [album.id]: {
            name: album.name,
            description: album.description ?? { en: '', ne: '' },
            isActive: album.isActive,
          },
        },
      })),

      closePanel: () => set({ panelOpen: false, isSubmitting: false }),
      setSubmitting: (val) => set({ isSubmitting: val }),

      updateFormField: (id, field, value) => {
        if (id === 'create') set((s) => ({ createFormState: { ...s.createFormState, [field]: value as any } }));
        else set((s) => ({ formStateById: { ...s.formStateById, [id]: { ...(s.formStateById[id] ?? s.createFormState), [field]: value as any } } }));
      },

      resetFormState: (id) => {
        if (id === 'create') set({ createFormState: { name: { en: '', ne: '' }, description: { en: '', ne: '' }, isActive: true } });
        else {
          const album = get().panelAlbum;
          const resetTo: AlbumFormState = album && album.id === id ? { name: album.name, description: album.description ?? { en: '', ne: '' }, isActive: album.isActive } : { name: { en: '', ne: '' }, description: { en: '', ne: '' }, isActive: true };
          set((s) => ({ formStateById: { ...s.formStateById, [id]: resetTo } }));
        }
      },
    }),
    { name: 'album-ui-store', partialize: (s) => ({ panelMode: s.panelMode, activeFormId: s.activeFormId, formStateById: s.formStateById, createFormState: s.createFormState }) }
  )
);


