import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NotificationService } from '@/services/notification-service';

interface UIState {
  // Theme and layout preferences
  isDarkMode: boolean;
  theme: 'white' | 'g10' | 'g90' | 'g100';
  sideNavExpanded: boolean;
  
  // Global UI state
  isLoading: boolean;
  loadingMessage: string;
  
  // Modal and overlay state
  activeModals: string[];
  isOverlayVisible: boolean;
  
  // Breadcrumb state
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  
  // Page state
  currentPage: string;
  pageTitle: string;
}

interface UIActions {
  // Theme actions
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  // Shell actions
  setSideNavExpanded: (expanded: boolean) => void;
  toggleSideNav: () => void;
  
  // Loading actions
  setLoading: (loading: boolean, message?: string) => void;
  clearLoading: () => void;
  
  // Notification helper actions (delegates to notification store)
  showSuccessNotification: (title: string, subtitle?: string) => void;
  showErrorNotification: (title: string, subtitle?: string) => void;
  showWarningNotification: (title: string, subtitle?: string) => void;
  showInfoNotification: (title: string, subtitle?: string) => void;
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Overlay actions
  showOverlay: () => void;
  hideOverlay: () => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;
  addBreadcrumb: (breadcrumb: UIState['breadcrumbs'][0]) => void;
  clearBreadcrumbs: () => void;
  
  // Page actions
  setCurrentPage: (page: string) => void;
  setPageTitle: (title: string) => void;
}

interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isDarkMode: false,
      theme: 'white',
      sideNavExpanded: false,
      isLoading: false,
      loadingMessage: '',
      activeModals: [],
      isOverlayVisible: false,
      breadcrumbs: [],
      currentPage: '',
      pageTitle: '',

      // Theme actions
      toggleDarkMode: () => {
        const { isDarkMode } = get();
        set({ isDarkMode: !isDarkMode });
      },

      setDarkMode: (dark: boolean) => {
        set({ isDarkMode: dark });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      // Shell actions
      setSideNavExpanded: (expanded: boolean) => {
        set({ sideNavExpanded: expanded });
      },

      toggleSideNav: () => {
        const { sideNavExpanded } = get();
        set({ sideNavExpanded: !sideNavExpanded });
      },

      // Loading actions
      setLoading: (loading: boolean, message: string = '') => {
        set({ isLoading: loading, loadingMessage: message });
      },

      clearLoading: () => {
        set({ isLoading: false, loadingMessage: '' });
      },

      // Notification helper actions (delegates to notification service)
      showSuccessNotification: (title: string, subtitle?: string) => {
        NotificationService.showSuccess(title, subtitle);
      },

      showErrorNotification: (title: string, subtitle?: string) => {
        NotificationService.showError(title, subtitle);
      },

      showWarningNotification: (title: string, subtitle?: string) => {
        NotificationService.showWarning(title, subtitle);
      },

      showInfoNotification: (title: string, subtitle?: string) => {
        NotificationService.showInfo(title, subtitle);
      },

      // Modal actions
      openModal: (modalId: string) => {
        set((state) => ({
          activeModals: [...state.activeModals, modalId],
          isOverlayVisible: true,
        }));
      },

      closeModal: (modalId: string) => {
        set((state) => {
          const newActiveModals = state.activeModals.filter((id) => id !== modalId);
          return {
            activeModals: newActiveModals,
            isOverlayVisible: newActiveModals.length > 0,
          };
        });
      },

      closeAllModals: () => {
        set({ activeModals: [], isOverlayVisible: false });
      },

      // Overlay actions
      showOverlay: () => {
        set({ isOverlayVisible: true });
      },

      hideOverlay: () => {
        set({ isOverlayVisible: false });
      },

      // Breadcrumb actions
      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      addBreadcrumb: (breadcrumb) => {
        set((state) => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb],
        }));
      },

      clearBreadcrumbs: () => {
        set({ breadcrumbs: [] });
      },

      // Page actions
      setCurrentPage: (page: string) => {
        set({ currentPage: page });
      },

      setPageTitle: (title: string) => {
        set({ pageTitle: title });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        theme: state.theme,
        breadcrumbs: state.breadcrumbs,
      }),
    }
  )
);
