import { create } from 'zustand';
import type { Content, Category } from '../types/content';

interface ContentFormData {
  title: { en: string; ne: string };
  content: { en: string; ne: string };
  excerpt: { en: string; ne: string };
  slug: string;
  categoryId: string;
  status: string;
  visibility: string;
  featured: boolean;
  order: number;
  priority: number;
  seoTitle: { en: string; ne: string };
  seoDescription: { en: string; ne: string };
  seoKeywords: string[];
  tags: string[];
  featuredImageId?: string;
  authorId?: string;
  publishedAt?: string;
  expiresAt?: string;
}

interface CategoryFormData {
  name: { en: string; ne: string };
  description: { en: string; ne: string };
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

interface ContentUIState {
  // Panel state
  panelOpen: boolean;
  panelMode: 'create' | 'edit';
  activeEntity: 'content' | 'category';
  
  // Tab state
  selectedTabIndex: number;
  
  // Content panel data
  panelContent?: Content;
  panelCategory?: Category;
  
  // Form state
  isSubmitting: boolean;
  
  // Content forms
  createContentForm: ContentFormData;
  contentFormById: Record<string, ContentFormData>;
  
  // Category forms
  createCategoryForm: CategoryFormData;
  categoryFormById: Record<string, CategoryFormData>;
  
  // Actions
  openCreateContent: () => void;
  openEditContent: (content: Content) => void;
  openCreateCategory: () => void;
  openEditCategory: (category: Category) => void;
  closePanel: () => void;
  setSelectedTabIndex: (index: number) => void;
  
  // Form management
  setSubmitting: (submitting: boolean) => void;
  updateContentFormField: (formId: string | 'create', field: keyof ContentFormData, value: any) => void;
  updateCategoryFormField: (formId: string | 'create', field: keyof CategoryFormData, value: any) => void;
  resetContentForm: (formId: string | 'create') => void;
  resetCategoryForm: (formId: string | 'create') => void;
}

const defaultContentForm: ContentFormData = {
  title: { en: '', ne: '' },
  content: { en: '', ne: '' },
  excerpt: { en: '', ne: '' },
  slug: '',
  categoryId: '',
  status: 'DRAFT',
  visibility: 'public',
  featured: false,
  order: 0,
  priority: 0,
  seoTitle: { en: '', ne: '' },
  seoDescription: { en: '', ne: '' },
  seoKeywords: [],
  tags: [],
  featuredImageId: undefined,
  authorId: undefined,
  publishedAt: undefined,
  expiresAt: undefined,
};

const defaultCategoryForm: CategoryFormData = {
  name: { en: '', ne: '' },
  description: { en: '', ne: '' },
  slug: '',
  parentId: undefined,
  order: 0,
  isActive: true,
};

export const useContentUIStore = create<ContentUIState>((set, get) => ({
  // Initial state
  panelOpen: false,
  panelMode: 'create',
  activeEntity: 'content',
  isSubmitting: false,
  createContentForm: { ...defaultContentForm },
  contentFormById: {},
  createCategoryForm: { ...defaultCategoryForm },
  categoryFormById: {},
  selectedTabIndex: 0,

  // Panel actions
  openCreateContent: () => set({
    panelOpen: true,
    panelMode: 'create',
    activeEntity: 'content',
    panelContent: undefined,
    panelCategory: undefined,
  }),

  openEditContent: (content: Content) => set({
    panelOpen: true,
    panelMode: 'edit',
    activeEntity: 'content',
    panelContent: content,
    panelCategory: undefined,
  }),

  openCreateCategory: () => set({
    panelOpen: true,
    panelMode: 'create',
    activeEntity: 'category',
    panelContent: undefined,
    panelCategory: undefined,
  }),

  openEditCategory: (category: Category) => set({
    panelOpen: true,
    panelMode: 'edit',
    activeEntity: 'category',
    panelContent: undefined,
    panelCategory: category,
  }),

  closePanel: () => set({
    panelOpen: false,
    panelMode: 'create',
    activeEntity: 'content',
    panelContent: undefined,
    panelCategory: undefined,
  }),

  setSelectedTabIndex: (index: number) => set({ selectedTabIndex: index }),

  // Form management
  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  updateContentFormField: (formId: string | 'create', field: keyof ContentFormData, value: any) => {
    if (formId === 'create') {
      set((state) => ({
        createContentForm: {
          ...state.createContentForm,
          [field]: value,
        },
      }));
    } else {
      set((state) => ({
        contentFormById: {
          ...state.contentFormById,
          [formId]: {
            ...state.contentFormById[formId],
            [field]: value,
          },
        },
      }));
    }
  },

  updateCategoryFormField: (formId: string | 'create', field: keyof CategoryFormData, value: any) => {
    if (formId === 'create') {
      set((state) => ({
        createCategoryForm: {
          ...state.createCategoryForm,
          [field]: value,
        },
      }));
    } else {
      set((state) => ({
        categoryFormById: {
          ...state.categoryFormById,
          [formId]: {
            ...state.categoryFormById[formId],
            [field]: value,
          },
        },
      }));
    }
  },

  resetContentForm: (formId: string | 'create') => {
    if (formId === 'create') {
      set({ createContentForm: { ...defaultContentForm } });
    } else {
      set((state) => {
        const { [formId]: removed, ...rest } = state.contentFormById;
        return { contentFormById: rest };
      });
    }
  },

  resetCategoryForm: (formId: string | 'create') => {
    if (formId === 'create') {
      set({ createCategoryForm: { ...defaultCategoryForm } });
    } else {
      set((state) => {
        const { [formId]: removed, ...rest } = state.categoryFormById;
        return { categoryFormById: rest };
      });
    }
  },
}));
