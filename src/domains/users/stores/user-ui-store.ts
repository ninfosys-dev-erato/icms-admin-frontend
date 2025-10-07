import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserQuery, UserFormData } from '../types/user';

export interface UserUIStore {
  // Panel/UI
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  panelUser: User | null;
  isSubmitting: boolean;

  // Filters
  currentQuery: UserQuery;

  // Selection for bulk
  selectedIds: string[];

  // Form State (persisted)
  activeFormId: string | 'create' | null;
  formStateById: Record<string, UserFormData>;
  createFormState: UserFormData;

  // Actions
  openCreatePanel: () => void;
  openEditPanel: (user: User) => void;
  closePanel: () => void;
  setSubmitting: (submitting: boolean) => void;
  setQuery: (query: Partial<UserQuery>) => void;
  resetQuery: () => void;
  setSelected: (ids: string[]) => void;
  clearSelected: () => void;

  // Form actions
  initializeEditForm: (user: User) => void;
  resetCreateForm: () => void;
  updateFormField: (id: string | 'create', field: keyof UserFormData, value: unknown) => void;
  resetFormState: (id: string | 'create') => void;
}

const defaultQuery: UserQuery = {
  page: 1,
  limit: 12,
  role: 'ALL',
  status: 'ALL',
  order: 'desc',
};

const defaultCreateForm: UserFormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'VIEWER',
  isActive: true,
};

export const useUserUIStore = create<UserUIStore>()(
  persist(
    (set, get) => ({
      panelOpen: false,
      panelMode: 'create',
      panelUser: null,
      isSubmitting: false,
      currentQuery: defaultQuery,
      selectedIds: [],
      activeFormId: null,
      formStateById: {},
      createFormState: defaultCreateForm,

      // Do NOT reset createFormState here so unsaved values persist (reset happens via explicit Reset action)
      openCreatePanel: () => set({ panelOpen: true, panelMode: 'create', panelUser: null, isSubmitting: false, activeFormId: 'create' }),
      openEditPanel: (user) => set((state) => {
        const existing = state.formStateById[user.id];
        const initial: UserFormData = existing ?? {
          email: user.email,
          password: '',
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.status === 'ACTIVE',
        };
        return {
          panelOpen: true,
          panelMode: 'edit',
          panelUser: user,
          isSubmitting: false,
          activeFormId: user.id,
          formStateById: { ...state.formStateById, [user.id]: initial },
        };
      }),
      closePanel: () => set({ panelOpen: false, panelUser: null, isSubmitting: false }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setQuery: (query) => set({ currentQuery: { ...get().currentQuery, ...query } }),
      resetQuery: () => set({ currentQuery: defaultQuery }),
      setSelected: (ids) => set({ selectedIds: ids }),
      clearSelected: () => set({ selectedIds: [] }),

      initializeEditForm: (user) => set((state) => {
        // Only initialize if we don't have persisted edits for this user
        if (state.formStateById[user.id]) {
          return { activeFormId: user.id } as Partial<UserUIStore>;
        }
        const initial: UserFormData = {
          email: user.email,
          password: '',
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.status === 'ACTIVE',
        };
        return {
          activeFormId: user.id,
          formStateById: { ...state.formStateById, [user.id]: initial },
        };
      }),
      resetCreateForm: () => set({ createFormState: defaultCreateForm }),
      updateFormField: (id, field, value) => {
        if (id === 'create') {
          set((state) => ({ createFormState: { ...state.createFormState, [field]: value as never } }));
        } else {
          set((state) => ({
            formStateById: {
              ...state.formStateById,
              [id]: {
                ...(state.formStateById[id] ?? defaultCreateForm),
                [field]: value as never,
              },
            },
          }));
        }
      },
      resetFormState: (id) => {
        if (id === 'create') {
          set({ createFormState: defaultCreateForm });
        } else {
          const user = get().panelUser;
          const resetTo: UserFormData = user && user.id === id
            ? {
                email: user.email,
                password: '',
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.status === 'ACTIVE',
              }
            : defaultCreateForm;
          set((state) => ({
            formStateById: { ...state.formStateById, [id]: resetTo },
          }));
        }
      },
    }),
    {
      name: 'user-ui-store',
      partialize: (s) => ({
        panelMode: s.panelMode,
        currentQuery: s.currentQuery,
        createFormState: s.createFormState,
        formStateById: s.formStateById,
        activeFormId: s.activeFormId,
      }),
    }
  )
);


