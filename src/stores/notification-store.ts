import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotificationKind = 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle?: string;
  caption?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  hideCloseButton?: boolean;
  lowContrast?: boolean;
  inline?: boolean;
  timeout?: number; // Auto-dismiss after timeout (ms)
  timestamp: number;
  isRead: boolean;
  isPersistent?: boolean; // Whether notification should survive page reloads
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  defaultTimeout: number;
}

interface NotificationActions {
  // Core notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  // Convenience methods for common notification types (for backward compatibility)
  showSuccess: (title: string, subtitle?: string, options?: Partial<Notification>) => string;
  showError: (title: string, subtitle?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, subtitle?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, subtitle?: string, options?: Partial<Notification>) => string;
  
  // Configuration
  setMaxNotifications: (max: number) => void;
  setDefaultTimeout: (timeout: number) => void;
  
  // Auto-dismiss management (internal use)
  scheduleAutoDismiss: (id: string, timeout: number) => void;
  cancelAutoDismiss: (id: string) => void;
}

interface NotificationStore extends NotificationState, NotificationActions {}

// Keep track of auto-dismiss timeouts
const autoDismissTimeouts = new Map<string, NodeJS.Timeout>();

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => {
      return {
        // Initial state
        notifications: [],
        maxNotifications: 5,
        defaultTimeout: 4000, // 4 seconds

        // Core actions
        addNotification: (notification) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
              return 'ssr-skip';
            }
            
            const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newNotification: Notification = {
              ...notification,
              id,
              timestamp: Date.now(),
              isRead: false,
            };

            set((state) => {
              let updatedNotifications = [...state.notifications, newNotification];
              
              // Limit the number of notifications
              if (updatedNotifications.length > state.maxNotifications) {
                // Remove oldest non-persistent notifications first
                const persistentNotifications = updatedNotifications.filter(n => n.isPersistent);
                const nonPersistentNotifications = updatedNotifications.filter(n => !n.isPersistent);
                
                if (nonPersistentNotifications.length > 0) {
                  nonPersistentNotifications.shift(); // Remove oldest
                  updatedNotifications = [...persistentNotifications, ...nonPersistentNotifications];
                } else if (updatedNotifications.length > state.maxNotifications) {
                  updatedNotifications.shift(); // Remove oldest even if persistent
                }
              }

              return { notifications: updatedNotifications };
            });

            // Schedule auto-dismiss if timeout is specified
            const timeout = notification.timeout ?? get().defaultTimeout;
            if (timeout > 0) {
              get().scheduleAutoDismiss(id, timeout);
            }

            return id;
          } catch (error) {
            console.error('❌ NotificationStore: Error in addNotification:', error);
            throw error;
          }
        },

        removeNotification: (id) => {
          // Cancel auto-dismiss if scheduled
          get().cancelAutoDismiss(id);
          
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        clearAllNotifications: () => {
          // Cancel all auto-dismiss timeouts
          autoDismissTimeouts.forEach((timeout) => clearTimeout(timeout));
          autoDismissTimeouts.clear();
          
          set({ notifications: [] });
        },

        markAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          }));
        },

        markAllAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          }));
        },

        // Convenience methods
        showSuccess: (title, subtitle, options = {}) => {
          const result = get().addNotification({
            kind: 'success',
            title,
            subtitle,
            ...options,
          });
          return result;
        },

        showError: (title, subtitle, options = {}) => {
          const result = get().addNotification({
            kind: 'error',
            title,
            subtitle,
            isPersistent: true, // Errors should be persistent by default
            timeout: 0, // Don't auto-dismiss errors by default
            ...options,
          });
          return result;
        },

        showWarning: (title, subtitle, options = {}) => {
          return get().addNotification({
            kind: 'warning',
            title,
            subtitle,
            ...options,
          });
        },

        showInfo: (title, subtitle, options = {}) => {
          return get().addNotification({
            kind: 'info',
            title,
            subtitle,
            ...options,
          });
        },

        // Configuration
        setMaxNotifications: (max) => {
          set({ maxNotifications: max });
        },

        setDefaultTimeout: (timeout) => {
          set({ defaultTimeout: timeout });
        },

        // Auto-dismiss management (internal use)
        scheduleAutoDismiss: (id, timeout) => {
          // Cancel existing timeout if any
          get().cancelAutoDismiss(id);
          
          const timeoutId = setTimeout(() => {
            get().removeNotification(id);
            autoDismissTimeouts.delete(id);
          }, timeout);
          
          autoDismissTimeouts.set(id, timeoutId);
        },

        cancelAutoDismiss: (id) => {
          const timeoutId = autoDismissTimeouts.get(id);
          if (timeoutId) {
            clearTimeout(timeoutId);
            autoDismissTimeouts.delete(id);
          }
        },
      };
    },
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => {
        // Check if localStorage is available (browser environment)
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage;
        }
        // Return a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        // Only persist notifications marked as persistent
        notifications: state.notifications.filter(n => n.isPersistent),
        maxNotifications: state.maxNotifications,
        defaultTimeout: state.defaultTimeout,
      }),
    }
  )
);
