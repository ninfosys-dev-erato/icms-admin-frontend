import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Content, Category } from '../types/content';

type PanelMode = 'create' | 'edit';
type ActiveEntity = 'content' | 'category';

interface CategoryFormState {
  name: { en: string; ne: string };
  slug: string;
  description: { en: string; ne: string };
  parentId?: string | null;
  order: number;
  isActive: boolean;
}

interface ContentFormData {
  title: { en: string; ne: string };
  slug: string;
  excerpt: { en: string; ne: string };
  content: { en: string; ne: string };
  categoryId: string;
  tags: string[];
  priority: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'public' | 'private' | 'role-based';
  featured: boolean;
  order: number;
  featuredImageId?: string;
  additionalMedia: string[];
  attachments: string[];
  authorId: string;
  seoTitle: { en: string; ne: string };
  seoDescription: { en: string; ne: string };
  seoKeywords: string[];
  publishedAt?: string;
  expiresAt?: string;
}

export interface ContentUIStore {
  // UI state for IBM Products SidePanel
  panelOpen: boolean;
  panelMode: PanelMode;
  activeEntity: ActiveEntity;
  panelContent: Content | null;
  panelCategory: Category | null;
  isEditing: boolean;
  isSubmitting: boolean;
  
  // Persistent tab state
  selectedTabIndex: number; // 0: content, 1: categories
  
  // Form state management
  activeFormId: string | 'create' | null;
  // Persisted form fields (exclude any File objects)
  formStateById: Record<string, ContentFormData>;
  createFormState: ContentFormData;
  // Category form states
  categoryFormById: Record<string, CategoryFormState>;
  createCategoryForm: CategoryFormState;
  // Non-persisted selected files
  selectedFileById: Record<string, File | null>;
  createSelectedFile: File | null;

  // UI Actions
  openCreateContentPanel: () => void;
  openEditContentPanel: (content: Content) => void;
  openCreateCategoryPanel: () => void;
  openEditCategoryPanel: (category: Category) => void;
  closePanel: () => void;
  setEditing: (isEditing: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSelectedTabIndex: (index: number) => void;

  // Form Actions
  initializeEditForm: (content: Content) => void;
  resetCreateForm: () => void;
  updateContentFormField: (
    id: string | 'create',
    field: keyof ContentFormData,
    value: unknown
  ) => void;
  updateCategoryFormField: (
    id: string | 'create',
    field: keyof CategoryFormState,
    value: unknown
  ) => void;
  setSelectedFile: (id: string | 'create', file: File | null) => void;
  resetContentFormState: (id: string | 'create') => void;
  resetCategoryFormState: (id: string | 'create') => void;
}

const defaultContentForm: ContentFormData = {
  title: { en: '', ne: '' },
  slug: '',
  excerpt: { en: '', ne: '' },
  content: { en: '', ne: '' },
  categoryId: '',
  tags: [],
  priority: 1,
  status: 'DRAFT',
  visibility: 'public',
  featured: false,
  order: 1,
  featuredImageId: undefined,
  additionalMedia: [],
  attachments: [],
  authorId: '',
  seoTitle: { en: '', ne: '' },
  seoDescription: { en: '', ne: '' },
  seoKeywords: [],
  publishedAt: undefined,
  expiresAt: undefined,
};

const defaultCategoryForm: CategoryFormState = {
  name: { en: '', ne: '' },
  slug: '',
  description: { en: '', ne: '' },
  parentId: null,
  order: 1,
  isActive: true,
};

export const useContentStore = create<ContentUIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      panelOpen: false,
      panelMode: 'create',
      activeEntity: 'content',
      panelContent: null,
      panelCategory: null,
      isEditing: false,
      isSubmitting: false,
      selectedTabIndex: 0,
      activeFormId: null,
      formStateById: {},
      createFormState: { ...defaultContentForm },
      categoryFormById: {},
      createCategoryForm: { ...defaultCategoryForm },
      selectedFileById: {},
      createSelectedFile: null,

      // UI Actions
      openCreateContentPanel: () => set({
        panelOpen: true,
        panelMode: 'create',
        activeEntity: 'content',
        panelContent: null,
        panelCategory: null,
        isEditing: false,
        activeFormId: 'create',
      }),

      openEditContentPanel: (content: Content) => set({
        panelOpen: true,
        panelMode: 'edit',
        activeEntity: 'content',
        panelContent: content,
        panelCategory: null,
        isEditing: true,
        activeFormId: content.id,
      }),

      openCreateCategoryPanel: () => set({
        panelOpen: true,
        panelMode: 'create',
        activeEntity: 'category',
        panelContent: null,
        panelCategory: null,
        isEditing: false,
        activeFormId: 'create',
        createCategoryForm: { ...defaultCategoryForm },
        categoryFormById: {}, // Clear any existing category forms
      }),

      openEditCategoryPanel: (category: Category) => set({
        panelOpen: true,
        panelMode: 'edit',
        activeEntity: 'category',
        panelContent: null,
        panelCategory: category,
        isEditing: true,
        activeFormId: category.id,
      }),

      closePanel: () => set({
        panelOpen: false,
        panelMode: 'create',
        activeEntity: 'content',
        panelContent: null,
        panelCategory: null,
        isEditing: false,
        activeFormId: null,
      }),

      setEditing: (isEditing: boolean) => set({ isEditing }),
      setSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
      setSelectedTabIndex: (index: number) => set({ selectedTabIndex: index }),

      // Form Actions
      initializeEditForm: (content: Content) => {
        const formData: ContentFormData = {
          title: content.title || { en: '', ne: '' },
          slug: content.slug || '',
          excerpt: content.excerpt || { en: '', ne: '' },
          content: content.content || { en: '', ne: '' },
          categoryId: content.categoryId || '',
          tags: content.tags || [],
          priority: content.priority || 1,
          status: content.status || 'DRAFT',
          visibility: content.visibility || 'public',
          featured: content.featured || false,
          order: content.order || 1,
          featuredImageId: content.featuredImageId,
          additionalMedia: content.additionalMedia || [],
          attachments: content.attachments?.map(att => att.id) || [],
          authorId: content.authorId || '',
          seoTitle: content.seoTitle || { en: '', ne: '' },
          seoDescription: content.seoDescription || { en: '', ne: '' },
          seoKeywords: content.seoKeywords || [],
          publishedAt: content.publishedAt || undefined,
          expiresAt: content.expiresAt || undefined,
        };

        set(state => ({
          formStateById: {
            ...state.formStateById,
            [content.id]: formData,
          },
          activeFormId: content.id,
        }));
      },

      resetCreateForm: () => set({
        createFormState: { ...defaultContentForm },
        createSelectedFile: null,
      }),

      updateContentFormField: (
        id: string | 'create',
        field: keyof ContentFormData,
        value: unknown
      ) => {
        if (id === 'create') {
          set(state => ({
            createFormState: {
              ...state.createFormState,
              [field]: value,
            },
          }));
        } else {
          set(state => ({
            formStateById: {
              ...state.formStateById,
              [id]: {
                ...(state.formStateById[id] ?? defaultContentForm),
                [field]: value,
              },
            },
          }));
        }
      },

      updateCategoryFormField: (
        id: string | 'create',
        field: keyof CategoryFormState,
        value: unknown
      ) => {
        console.log('🔍 Updating category form field:', { id, field, value });
        if (id === 'create') {
          set(state => ({
            createCategoryForm: {
              ...state.createCategoryForm,
              [field]: value,
            },
          }));
        } else {
          set(state => ({
            categoryFormById: {
              ...state.categoryFormById,
              [id]: {
                ...(state.categoryFormById[id] ?? defaultCategoryForm),
                [field]: value,
              },
            },
          }));
        }
      },

      setSelectedFile: (id: string | 'create', file: File | null) => {
        if (id === 'create') {
          set({ createSelectedFile: file });
        } else {
          set(state => ({
            selectedFileById: {
              ...state.selectedFileById,
              [id]: file,
            },
          }));
        }
      },

      resetContentFormState: (id: string | 'create') => {
        if (id === 'create') {
          set({ createFormState: { ...defaultContentForm } });
        } else {
          set(state => {
            const newFormStateById = { ...state.formStateById };
            delete newFormStateById[id];
            return { formStateById: newFormStateById };
          });
        }
      },

      resetCategoryFormState: (id: string | 'create') => {
        if (id === 'create') {
          set({ createCategoryForm: { ...defaultCategoryForm } });
        } else {
          set(state => {
            const newCategoryFormById = { ...state.categoryFormById };
            delete newCategoryFormById[id];
            return { categoryFormById: newCategoryFormById };
          });
        }
      },
    }),
    {
      name: 'content-ui-store',
      // Only persist pure form fields and lightweight UI flags
      partialize: (state) => ({
        panelMode: state.panelMode,
        activeEntity: state.activeEntity,
        isEditing: state.isEditing,
        selectedTabIndex: state.selectedTabIndex,
        activeFormId: state.activeFormId,
        formStateById: state.formStateById,
        createFormState: state.createFormState,
        categoryFormById: state.categoryFormById,
        createCategoryForm: state.createCategoryForm,
      }),
    }
  )
); 