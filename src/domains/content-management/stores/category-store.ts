import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Category, 
  CategoryFilters, 
  PaginationInfo, 
  CategoryTree,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../types/content';

export interface CategoryUIStore {
  // Category data
  categories: Category[];
  categoryTree: CategoryTree[];
  filters: CategoryFilters;
  pagination: PaginationInfo;
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  expandedNodes: Set<string>;
  draggedCategory: Category | null;

  // Category Actions
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  setCategoryTree: (tree: CategoryTree[]) => void;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  resetFilters: () => void;
  setPagination: (pagination: PaginationInfo) => void;
  setSelectedCategory: (category: Category | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Tree Operations
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isNodeExpanded: (nodeId: string) => boolean;

  // Drag & Drop Operations
  setDraggedCategory: (category: Category | null) => void;
  moveCategory: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  reorderCategories: (orders: Array<{ id: string; order: number }>) => void;

  // UI Actions
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;

  // Utility Methods
  getCategoryById: (id: string) => Category | undefined;
  getCategoryPath: (id: string) => Category[];
  getCategoryChildren: (id: string) => Category[];
  getCategoryDescendants: (id: string) => Category[];
  getCategoryAncestors: (id: string) => Category[];
  isDescendantOf: (descendantId: string, ancestorId: string) => boolean;
  getCategoryLevel: (id: string) => number;
  getCategoryOrder: (id: string) => number;
  validateCategoryMove: (sourceId: string, targetId: string) => boolean;
}

export const useCategoryStore = create<CategoryUIStore>()(
  persist(
    (set, get) => ({
      // Category data
      categories: [],
      categoryTree: [],
      filters: {
        search: '',
        parentId: null,
        isActive: undefined,
        level: undefined,
      },
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      selectedCategory: null,
      isLoading: false,
      error: null,

      // UI state
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      expandedNodes: new Set(),
      draggedCategory: null,

      // Category Actions
      setCategories: (categories: Category[]) => set({ categories }),
      addCategory: (category: Category) => 
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id: string, updates: Partial<Category>) =>
        set((state) => ({
          categories: state.categories.map(cat => 
            cat.id === id ? { ...cat, ...updates } : cat
          )
        })),
      removeCategory: (id: string) =>
        set((state) => ({
          categories: state.categories.filter(cat => cat.id !== id)
        })),
      setCategoryTree: (tree: CategoryTree[]) => set({ categoryTree: tree }),
      setFilters: (filters: Partial<CategoryFilters>) => 
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ 
        filters: {
          search: '',
          parentId: null,
          isActive: undefined,
          level: undefined,
        }
      }),
      setPagination: (pagination: PaginationInfo) => set({ pagination }),
      setSelectedCategory: (category: Category | null) => set({ selectedCategory: category }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // Tree Operations
      expandNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          newExpanded.add(nodeId);
          return { expandedNodes: newExpanded };
        });
      },

      collapseNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          newExpanded.delete(nodeId);
          return { expandedNodes: newExpanded };
        });
      },

      expandAll: () => {
        set((state) => {
          const allIds = new Set<string>();
          const collectIds = (nodes: CategoryTree[]) => {
            nodes.forEach(node => {
              allIds.add(node.id);
              if (node.children.length > 0) {
                collectIds(node.children);
              }
            });
          };
          collectIds(state.categoryTree);
          return { expandedNodes: allIds };
        });
      },

      collapseAll: () => set({ expandedNodes: new Set() }),

      isNodeExpanded: (nodeId: string) => {
        return get().expandedNodes.has(nodeId);
      },

      // Drag & Drop Operations
      setDraggedCategory: (category: Category | null) => set({ draggedCategory: category }),

      moveCategory: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
        const state = get();
        const sourceCategory = state.categories.find(c => c.id === sourceId);
        const targetCategory = state.categories.find(c => c.id === targetId);

        if (!sourceCategory || !targetCategory) return;

        // Validate the move
        if (!get().validateCategoryMove(sourceId, targetId)) return;

        let newParentId: string | null;
        let newOrder: number;

        if (position === 'inside') {
          newParentId = targetId;
          newOrder = state.categories.filter(c => c.parentId === targetId).length + 1;
        } else {
          newParentId = targetCategory.parentId || null;
          const siblings = state.categories.filter(c => c.parentId === targetCategory.parentId);
          const targetIndex = siblings.findIndex(c => c.id === targetId);
          
          if (position === 'before') {
            newOrder = targetIndex;
          } else {
            newOrder = targetIndex + 1;
          }

          // Adjust order of other siblings
          siblings.forEach((sibling, index) => {
            if (sibling.id !== sourceId) {
              if (index >= newOrder) {
                get().updateCategory(sibling.id, { order: sibling.order + 1 });
              }
            }
          });
        }

        // Update the source category
        get().updateCategory(sourceId, { 
          parentId: newParentId, 
          order: newOrder,
          level: newParentId ? get().getCategoryLevel(newParentId) + 1 : 0
        });
      },

      reorderCategories: (orders: Array<{ id: string; order: number }>) => {
        orders.forEach(({ id, order }) => {
          get().updateCategory(id, { order });
        });
      },

      // UI Actions
      setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
      setShowEditModal: (show: boolean) => set({ showEditModal: show }),
      setShowDeleteModal: (show: boolean) => set({ showDeleteModal: show }),

      // Utility Methods
      getCategoryById: (id: string) => {
        return get().categories.find(c => c.id === id);
      },

      getCategoryPath: (id: string) => {
        const path: Category[] = [];
        const state = get();
        let currentId: string | null = id;

        while (currentId) {
          const category = state.categories.find(c => c.id === currentId);
          if (category) {
            path.unshift(category);
            currentId = category.parentId || null;
          } else {
            break;
          }
        }

        return path;
      },

      getCategoryChildren: (id: string) => {
        return get().categories.filter(c => c.parentId === id);
      },

      getCategoryDescendants: (id: string) => {
        const descendants: Category[] = [];
        const state = get();
        
        const collectDescendants = (parentId: string) => {
          const children = state.categories.filter(c => c.parentId === parentId);
          children.forEach(child => {
            descendants.push(child);
            collectDescendants(child.id);
          });
        };

        collectDescendants(id);
        return descendants;
      },

      getCategoryAncestors: (id: string) => {
        return get().getCategoryPath(id).slice(0, -1);
      },

      isDescendantOf: (descendantId: string, ancestorId: string) => {
        const ancestors = get().getCategoryAncestors(descendantId);
        return ancestors.some(ancestor => ancestor.id === ancestorId);
      },

      getCategoryLevel: (id: string) => {
        return get().getCategoryPath(id).length - 1;
      },

      getCategoryOrder: (id: string) => {
        const category = get().categories.find(c => c.id === id);
        return category?.order || 0;
      },

      validateCategoryMove: (sourceId: string, targetId: string) => {
        // Prevent moving a category into its own descendant
        if (get().isDescendantOf(targetId, sourceId)) {
          return false;
        }

        // Prevent moving a category into itself
        if (sourceId === targetId) {
          return false;
        }

        return true;
      },
    }),
    {
      name: 'content-category-store',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        expandedNodes: Array.from(state.expandedNodes),
      }),
    }
  )
); 