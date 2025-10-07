import { NotificationService } from '@/services/notification-service';
import { ImportantLink } from '../types/important-links';
import { ImportantLinksService } from './important-links-service';

/**
 * Service responsible for showing notifications related to Important Links operations.
 * Centralizes all notification logic for consistent user feedback.
 */
export class ImportantLinksNotificationService {
  // ========================================
  // SUCCESS NOTIFICATIONS
  // ========================================

  /**
   * Show success notification when important link is created
   */
  static showLinkCreated(title: string): void {
    NotificationService.showSuccess({
      title: 'Important Link Created',
      message: `"${title}" has been created successfully.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important link is updated
   */
  static showLinkUpdated(title: string): void {
    NotificationService.showSuccess({
      title: 'Important Link Updated',
      message: `"${title}" has been updated successfully.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important link is deleted
   */
  static showLinkDeleted(title: string): void {
    NotificationService.showSuccess({
      title: 'Important Link Deleted',
      message: `"${title}" has been deleted successfully.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important link is published
   */
  static showPublishSuccess(title: string): void {
    NotificationService.showSuccess({
      title: 'Important Link Published',
      message: `"${title}" is now publicly visible.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important link is unpublished
   */
  static showUnpublishSuccess(title: string): void {
    NotificationService.showSuccess({
      title: 'Important Link Unpublished',
      message: `"${title}" is no longer publicly visible.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important links are reordered
   */
  static showReorderSuccess(): void {
    NotificationService.showSuccess({
      title: 'Order Updated',
      message: 'Important links have been reordered successfully.',
      duration: 5000,
    });
  }

  /**
   * Show success notification for bulk operations
   */
  static showBulkOperationSuccess(operation: string, count: number): void {
    const operationText = operation.charAt(0).toUpperCase() + operation.slice(1);
    NotificationService.showSuccess({
      title: 'Bulk Operation Completed',
      message: `${count} important links have been ${operation} successfully.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important links are imported
   */
  static showImportSuccess(count: number): void {
    NotificationService.showSuccess({
      title: 'Import Completed',
      message: `${count} important links have been imported successfully.`,
      duration: 5000,
    });
  }

  /**
   * Show success notification when important links are exported
   */
  static showExportSuccess(count: number): void {
    NotificationService.showSuccess({
      title: 'Export Completed',
      message: `${count} important links have been exported successfully.`,
      duration: 5000,
    });
  }

  // ========================================
  // ERROR NOTIFICATIONS
  // ========================================

  /**
   * Show error notification when important link creation fails
   */
  static showLinkCreationError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Creation Failed',
      message: `Failed to create important link: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when important link update fails
   */
  static showLinkUpdateError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Update Failed',
      message: `Failed to update important link: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when important link deletion fails
   */
  static showLinkDeletionError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Deletion Failed',
      message: `Failed to delete important link: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when important link publish/unpublish fails
   */
  static showPublishStatusError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Status Update Failed',
      message: `Failed to update important link status: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when reordering fails
   */
  static showReorderError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Reorder Failed',
      message: `Failed to reorder important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when bulk operations fail
   */
  static showBulkOperationError(operation: string, errorMessage: string): void {
    const operationText = operation.charAt(0).toUpperCase() + operation.slice(1);
    NotificationService.showError({
      title: `Bulk ${operationText} Failed`,
      message: `Failed to ${operation} important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when import fails
   */
  static showImportError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Import Failed',
      message: `Failed to import important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when export fails
   */
  static showExportError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Export Failed',
      message: `Failed to export important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when fetching important links fails
   */
  static showFetchError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Fetch Failed',
      message: `Failed to fetch important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  /**
   * Show error notification when search fails
   */
  static showSearchError(errorMessage: string): void {
    NotificationService.showError({
      title: 'Search Failed',
      message: `Failed to search important links: ${errorMessage}`,
      duration: 8000,
    });
  }

  // ========================================
  // WARNING NOTIFICATIONS
  // ========================================

  /**
   * Show warning notification when important link has validation issues
   */
  static showValidationWarning(errors: string[]): void {
    const errorList = errors.slice(0, 3).join(', ');
    const moreText = errors.length > 3 ? ` and ${errors.length - 3} more issues` : '';
    
    NotificationService.showWarning({
      title: 'Validation Issues',
      message: `Please fix the following issues: ${errorList}${moreText}`,
      duration: 10000,
    });
  }

  /**
   * Show warning notification when bulk operation has partial failures
   */
  static showPartialBulkOperationWarning(operation: string, success: number, failed: number): void {
    const operationText = operation.charAt(0).toUpperCase() + operation.slice(1);
    NotificationService.showWarning({
      title: `Partial ${operationText} Success`,
      message: `${success} important links were ${operation} successfully, but ${failed} failed.`,
      duration: 10000,
    });
  }

  // ========================================
  // INFO NOTIFICATIONS
  // ========================================

  /**
   * Show info notification when important link is being processed
   */
  static showProcessingInfo(title: string): void {
    NotificationService.showInfo({
      title: 'Processing',
      message: `"${title}" is being processed. This may take a moment.`,
      duration: 3000,
    });
  }

  /**
   * Show info notification when bulk operation is in progress
   */
  static showBulkOperationInProgress(operation: string, count: number): void {
    const operationText = operation.charAt(0).toUpperCase() + operation.slice(1);
    NotificationService.showInfo({
      title: `${operationText} in Progress`,
      message: `Processing ${count} important links. Please wait...`,
      duration: 3000,
    });
  }
}
