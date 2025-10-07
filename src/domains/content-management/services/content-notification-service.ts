import { NotificationService } from '@/services/notification-service';

/**
 * Content-specific notification service that extends the base NotificationService
 * with domain-specific notification patterns and messaging.
 */
export class ContentNotificationService extends NotificationService {
  /**
   * Show success notification for content creation
   */
  static showContentCreated(contentTitle?: string): string {
    const title = 'Content Created Successfully';
    const subtitle = contentTitle 
      ? `Content "${contentTitle}" has been created and added to the system.`
      : 'New content has been created and added to the system.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for content update
   */
  static showContentUpdated(contentTitle?: string): string {
    const title = 'Content Updated Successfully';
    const subtitle = contentTitle 
      ? `Content "${contentTitle}" has been updated.`
      : 'Content has been updated successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for content deletion
   */
  static showContentDeleted(contentTitle?: string): string {
    const title = 'Content Deleted Successfully';
    const subtitle = contentTitle 
      ? `Content "${contentTitle}" has been deleted.`
      : 'Content has been deleted successfully.';
    
    return this.showSuccess(title, subtitle);
  }


  /**
   * Show success notification for bulk operations
   */
  static showBulkOperationSuccess(operation: string, count: number): string {
    const title = `Bulk ${operation} Successful`;
    const subtitle = `${count} content item${count > 1 ? 's' : ''} ${operation.toLowerCase()}${operation.endsWith('e') ? 'd' : 'ed'} successfully.`;
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show error notifications for content operations
   */
  static showContentCreationError(error: string): string {
    return this.showCreateError(error, 'content');
  }

  static showContentUpdateError(error: string): string {
    return this.showUpdateError(error, 'content');
  }

  static showContentDeletionError(error: string): string {
    return this.showDeleteError(error, 'content');
  }


  /**
   * Show notification for publish/unpublish operations
   */
  static showPublishSuccess(contentTitle?: string): string {
    const title = 'Content Published Successfully';
    const subtitle = contentTitle 
      ? `Content "${contentTitle}" is now live.`
      : 'Content is now published and live.';
    
    return this.showSuccess(title, subtitle);
  }

  static showUnpublishSuccess(contentTitle?: string): string {
    const title = 'Content Unpublished Successfully';
    const subtitle = contentTitle 
      ? `Content "${contentTitle}" is no longer live.`
      : 'Content has been unpublished.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show validation error for content form
   */
  static showValidationErrors(errors: string[]): string {
    return this.showValidationError(errors);
  }

  /**
   * Show loading notification for long operations
   */
  static showLoadingContents(): string {
    return this.showLoading('Loading', 'contents');
  }

  static showCreatingContent(): string {
    return this.showLoading('Creating', 'content');
  }

  static showUpdatingContent(): string {
    return this.showLoading('Updating', 'content');
  }

  static showDeletingContent(): string {
    return this.showLoading('Deleting', 'content');
  }


  /**
   * Show confirmation for destructive operations
   */
  static showDeleteConfirmation(
    contentTitle: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete content "${contentTitle}"? This action cannot be undone.`;
    
    // Use 'error' kind to render a red/danger style and label the action as 'Delete'
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'error',
    }, 'Delete');
  }

  static showBulkDeleteConfirmation(
    count: number,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Bulk Deletion';
    const subtitle = `Are you sure you want to delete ${count} content item${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }


  // ========================================
  // CATEGORY NOTIFICATIONS
  // ========================================

  /**
   * Show success notification for category creation
   */
  static showCategoryCreated(categoryName?: string): string {
    const title = 'Category Created Successfully';
    const subtitle = categoryName 
      ? `Category "${categoryName}" has been created and added to the system.`
      : 'New category has been created and added to the system.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for category update
   */
  static showCategoryUpdated(categoryName?: string): string {
    const title = 'Category Updated Successfully';
    const subtitle = categoryName 
      ? `Category "${categoryName}" has been updated.`
      : 'Category has been updated successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for category deletion
   */
  static showCategoryDeleted(categoryName?: string): string {
    const title = 'Category Deleted Successfully';
    const subtitle = categoryName 
      ? `Category "${categoryName}" has been deleted.`
      : 'Category has been deleted successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show error notifications for category operations
   */
  static showCategoryCreationError(error: string): string {
    return this.showCreateError(error, 'category');
  }

  static showCategoryUpdateError(error: string): string {
    return this.showUpdateError(error, 'category');
  }

  static showCategoryDeletionError(error: string): string {
    console.log('🔥 ContentNotificationService.showCategoryDeletionError called with:', error);
    
    // Handle specific backend error for categories with content
    if (error.includes('Cannot delete category with content')) {
      console.log('🔥 Showing specific "cannot delete" error notification');
      const title = 'Cannot Delete Category';
      const subtitle = 'This category cannot be deleted because it contains content. Please move or delete all content in this category first, then try again.';
      return this.showError(title, subtitle);
    }
    
    console.log('🔥 Showing generic delete error notification');
    return this.showDeleteError(error, 'category');
  }

  /**
   * Show confirmation for category deletion
   */
  static showCategoryDeleteConfirmation(
    categoryName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete category "${categoryName}"? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }
}