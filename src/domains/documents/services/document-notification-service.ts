import { NotificationService } from '@/services/notification-service';

export class DocumentNotificationService {
  /**
   * Show success notification for document creation
   */
  static showDocumentCreated(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Created',
      `"${documentTitle}" has been created successfully.`
    );
  }

  /**
   * Show error notification for document creation failure
   */
  static showDocumentCreationError(errorMessage: string): void {
    NotificationService.showError(
      'Document Creation Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for document update
   */
  static showDocumentUpdated(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Updated',
      `"${documentTitle}" has been updated successfully.`
    );
  }

  /**
   * Show error notification for document update failure
   */
  static showDocumentUpdateError(errorMessage: string): void {
    NotificationService.showError(
      'Document Update Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for document deletion
   */
  static showDocumentDeleted(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Deleted',
      `"${documentTitle}" has been deleted successfully.`
    );
  }

  /**
   * Show error notification for document deletion failure
   */
  static showDocumentDeletionError(errorMessage: string): void {
    NotificationService.showError(
      'Document Deletion Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for document upload
   */
  static showDocumentUploadSuccess(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Uploaded',
      `"${documentTitle}" has been uploaded successfully.`
    );
  }

  /**
   * Show error notification for document upload failure
   */
  static showDocumentUploadError(errorMessage: string): void {
    NotificationService.showError(
      'Document Upload Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for document version creation
   */
  static showVersionCreated(documentTitle: string, version: string): void {
    NotificationService.showSuccess(
      'Version Created',
      `Version ${version} of "${documentTitle}" has been created successfully.`
    );
  }

  /**
   * Show error notification for version creation failure
   */
  static showVersionCreationError(errorMessage: string): void {
    NotificationService.showError(
      'Version Creation Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for bulk operations
   */
  static showBulkOperationSuccess(operation: string, count: number): void {
    NotificationService.showSuccess(
      'Bulk Operation Completed',
      `Successfully ${operation} ${count} document${count !== 1 ? 's' : ''}.`
    );
  }

  /**
   * Show error notification for bulk operations
   */
  static showBulkOperationError(operation: string, errorMessage: string): void {
    NotificationService.showError(
      `Bulk ${operation} Failed`,
      errorMessage
    );
  }

  /**
   * Show success notification for document publishing
   */
  static showPublishSuccess(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Published',
      `"${documentTitle}" has been published successfully.`
    );
  }

  /**
   * Show success notification for document archiving
   */
  static showArchiveSuccess(documentTitle: string): void {
    NotificationService.showSuccess(
      'Document Archived',
      `"${documentTitle}" has been archived successfully.`
    );
  }

  /**
   * Show success notification for document export
   */
  static showExportSuccess(format: string, count: number): void {
    NotificationService.showSuccess(
      'Export Completed',
      `Successfully exported ${count} document${count !== 1 ? 's' : ''} in ${format.toUpperCase()} format.`
    );
  }

  /**
   * Show error notification for document export failure
   */
  static showExportError(errorMessage: string): void {
    NotificationService.showError(
      'Export Failed',
      errorMessage
    );
  }

  /**
   * Show success notification for document import
   */
  static showImportSuccess(count: number): void {
    NotificationService.showSuccess(
      'Import Completed',
      `Successfully imported ${count} document${count !== 1 ? 's' : ''}.`
    );
  }

  /**
   * Show error notification for document import failure
   */
  static showImportError(errorMessage: string): void {
    NotificationService.showError(
      'Import Failed',
      errorMessage
    );
  }

  /**
   * Show warning notification for file validation
   */
  static showFileValidationWarning(message: string): void {
    NotificationService.showWarning(
      'File Validation Warning',
      message
    );
  }

  /**
   * Show info notification for document operations
   */
  static showDocumentInfo(title: string, message: string): void {
    NotificationService.showInfo(
      title,
      message
    );
  }
}
