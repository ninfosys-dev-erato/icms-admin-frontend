import { useNotificationStore, type Notification, type NotificationKind } from '@/stores/notification-store';

/**
 * Service layer for managing notifications across the application.
 * This abstraction provides a clean interface for notification operations
 * and centralizes notification logic away from stores and components.
 */
export class NotificationService {
  /**
   * Get the current notification store instance
   * This is private to ensure external access goes through service methods
   */
  private static getStore() {
    return useNotificationStore.getState();
  }

  /**
   * Display a success notification
   */
  static showSuccess(title: string, subtitle?: string, options?: Partial<Notification>): string {
    return this.getStore().showSuccess(title, subtitle, options);
  }

  /**
   * Display an error notification
   */
  static showError(title: string, subtitle?: string, options?: Partial<Notification>): string {
    return this.getStore().showError(title, subtitle, options);
  }

  /**
   * Display a warning notification
   */
  static showWarning(title: string, subtitle?: string, options?: Partial<Notification>): string {
    return this.getStore().showWarning(title, subtitle, options);
  }

  /**
   * Display an info notification
   */
  static showInfo(title: string, subtitle?: string, options?: Partial<Notification>): string {
    return this.getStore().showInfo(title, subtitle, options);
  }

  /**
   * Add a custom notification with full control over properties
   */
  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): string {
    return this.getStore().addNotification(notification);
  }

  /**
   * Remove a specific notification by ID
   */
  static removeNotification(id: string): void {
    this.getStore().removeNotification(id);
  }

  /**
   * Clear all notifications
   */
  static clearAllNotifications(): void {
    this.getStore().clearAllNotifications();
  }

  /**
   * Mark a notification as read
   */
  static markAsRead(id: string): void {
    this.getStore().markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(): void {
    this.getStore().markAllAsRead();
  }

  /**
   * Get all current notifications
   */
  static getAllNotifications(): Notification[] {
    return this.getStore().notifications;
  }

  /**
   * Get unread notifications count
   */
  static getUnreadCount(): number {
    return this.getStore().notifications.filter(n => !n.isRead).length;
  }

  /**
   * Configure notification settings
   */
  static setMaxNotifications(max: number): void {
    this.getStore().setMaxNotifications(max);
  }

  static setDefaultTimeout(timeout: number): void {
    this.getStore().setDefaultTimeout(timeout);
  }

  /**
   * Create an actionable notification with a callback
   */
  static showActionableNotification(
    kind: NotificationKind,
    title: string,
    subtitle: string,
    actionLabel: string,
    onAction: () => void,
    options?: Partial<Notification>
  ): string {
    return this.addNotification({
      kind,
      title,
      subtitle,
      actionButtonLabel: actionLabel,
      onActionButtonClick: onAction,
      timeout: 0, // Don't auto-dismiss actionable notifications
      ...options,
    });
  }

  /**
   * Show a confirmation notification with Yes/No actions
   */
  static showConfirmation(
    title: string,
    subtitle: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: Partial<Notification>,
    actionLabel: string = 'Confirm'
  ): string {
    // Use provided kind from options if present, otherwise default to 'warning'
    const kind = options?.kind ?? 'warning';

    return this.showActionableNotification(
      kind,
      title,
      subtitle,
      actionLabel,
      () => {
        onConfirm();
        // Automatically remove this notification after action
        setTimeout(() => this.clearAllNotifications(), 100);
      },
      {
        isPersistent: true,
        hideCloseButton: false,
        ...options,
      }
    );
  }

  /**
   * Show operation status notifications with consistent styling
   */
  static showOperationSuccess(operation: string, item?: string): string {
    const title = `${operation} Successful`;
    const subtitle = item 
      ? `${item} has been ${operation.toLowerCase()} successfully.`
      : `Operation completed successfully.`;
    
    return this.showSuccess(title, subtitle);
  }

  static showOperationError(operation: string, error: string, item?: string): string {
    const title = `${operation} Failed`;
    const subtitle = item 
      ? `Failed to ${operation.toLowerCase()} ${item}: ${error}`
      : `Operation failed: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show loading notification (should be paired with completion/error)
   */
  static showLoading(operation: string, item?: string): string {
    const title = `${operation} in Progress`;
    const subtitle = item 
      ? `${operation} ${item}...`
      : `Please wait...`;
    
    return this.showInfo(title, subtitle, {
      hideCloseButton: true,
      timeout: 0, // Don't auto-dismiss loading notifications
    });
  }

  /**
   * Utility methods for common notification patterns
   */
  static showSaveSuccess(itemName?: string): string {
    return this.showOperationSuccess('Save', itemName);
  }

  static showSaveError(error: string, itemName?: string): string {
    return this.showOperationError('Save', error, itemName);
  }

  static showDeleteSuccess(itemName?: string): string {
    return this.showOperationSuccess('Delete', itemName);
  }

  static showDeleteError(error: string, itemName?: string): string {
    return this.showOperationError('Delete', error, itemName);
  }

  static showCreateSuccess(itemName?: string): string {
    return this.showOperationSuccess('Create', itemName);
  }

  static showCreateError(error: string, itemName?: string): string {
    return this.showOperationError('Create', error, itemName);
  }

  static showUpdateSuccess(itemName?: string): string {
    return this.showOperationSuccess('Update', itemName);
  }

  static showUpdateError(error: string, itemName?: string): string {
    return this.showOperationError('Update', error, itemName);
  }

  /**
   * Network and API related notifications
   */
  static showNetworkError(): string {
    return this.showError(
      'Network Error',
      'Please check your internet connection and try again.',
      { isPersistent: true }
    );
  }

  static showUnauthorizedError(): string {
    return this.showError(
      'Authentication Required',
      'Please log in to continue.',
      { isPersistent: true }
    );
  }

  static showPermissionError(): string {
    return this.showError(
      'Permission Denied',
      'You do not have permission to perform this action.',
      { isPersistent: true }
    );
  }

  /**
   * Validation error notifications
   */
  static showValidationError(errors: string[] | string): string {
    const errorList = Array.isArray(errors) ? errors.join(', ') : errors;
    return this.showError(
      'Validation Error',
      `Please correct the following: ${errorList}`
    );
  }
}

/**
 * Convenience hook for components that need reactive access to notifications
 * This should be used sparingly - prefer using the service methods above
 */
export const useNotifications = () => {
  const store = useNotificationStore();
  return {
    notifications: store.notifications,
    unreadCount: store.notifications.filter(n => !n.isRead).length,
    // Use store methods directly instead of static service methods
    showSuccess: store.showSuccess,
    showError: store.showError,
    showWarning: store.showWarning,
    showInfo: store.showInfo,
    clearAll: store.clearAllNotifications,
  };
};
