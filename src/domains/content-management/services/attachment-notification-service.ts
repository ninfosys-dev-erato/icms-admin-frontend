import { NotificationService } from '@/services/notification-service';

/**
 * Attachment-specific notification service that extends the base NotificationService
 * with domain-specific notification patterns and messaging.
 */
export class AttachmentNotificationService extends NotificationService {
  /**
   * Show success notification for attachment upload
   */
  static showAttachmentUploaded(fileName?: string): string {
    const title = 'File Uploaded Successfully';
    const subtitle = fileName 
      ? `File "${fileName}" has been uploaded successfully.`
      : 'File has been uploaded successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for multiple attachments upload
   */
  static showMultipleAttachmentsUploaded(count: number): string {
    const title = 'Files Uploaded Successfully';
    const subtitle = `${count} file${count > 1 ? 's have' : ' has'} been uploaded successfully.`;
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for attachment update
   */
  static showAttachmentUpdated(fileName?: string): string {
    const title = 'File Updated Successfully';
    const subtitle = fileName 
      ? `File "${fileName}" has been updated.`
      : 'File has been updated successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for attachment deletion
   */
  static showAttachmentDeleted(fileName?: string): string {
    const title = 'File Deleted Successfully';
    const subtitle = fileName 
      ? `File "${fileName}" has been deleted.`
      : 'File has been deleted successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for attachment download
   */
  static showAttachmentDownloaded(fileName?: string): string {
    const title = 'File Downloaded';
    const subtitle = fileName 
      ? `File "${fileName}" is being downloaded.`
      : 'File download started.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show error notifications for attachment operations
   */
  static showAttachmentUploadError(error: string, fileName?: string): string {
    const title = 'Upload Failed';
    const subtitle = fileName 
      ? `Failed to upload "${fileName}": ${error}`
      : `Upload failed: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showAttachmentUpdateError(error: string, fileName?: string): string {
    const title = 'Update Failed';
    const subtitle = fileName 
      ? `Failed to update "${fileName}": ${error}`
      : `Update failed: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showAttachmentDeletionError(error: string, fileName?: string): string {
    const title = 'Delete Failed';
    const subtitle = fileName 
      ? `Failed to delete "${fileName}": ${error}`
      : `Delete failed: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showAttachmentDownloadError(error: string, fileName?: string): string {
    const title = 'Download Failed';
    const subtitle = fileName 
      ? `Failed to download "${fileName}": ${error}`
      : `Download failed: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show validation error for file uploads
   */
  static showFileValidationError(fileName: string, error: string): string {
    const title = 'File Validation Error';
    const subtitle = `"${fileName}": ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show loading notifications
   */
  static showUploadingFile(fileName?: string): string {
    const title = 'Uploading File';
    const subtitle = fileName 
      ? `Uploading "${fileName}"...`
      : 'Uploading file...';
    
    return this.showInfo(title, subtitle, {
      hideCloseButton: true,
      timeout: 0,
    });
  }

  static showUploadingMultipleFiles(count: number): string {
    const title = 'Uploading Files';
    const subtitle = `Uploading ${count} file${count > 1 ? 's' : ''}...`;
    
    return this.showInfo(title, subtitle, {
      hideCloseButton: true,
      timeout: 0,
    });
  }

  /**
   * Show confirmation for destructive operations
   */
  static showDeleteConfirmation(
    fileName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete "${fileName}"? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }

  /**
   * Content selection reminder
   */
  static showSelectContentFirst(): string {
    const title = 'Select Content First';
    const subtitle = 'Please select a content item before uploading attachments.';
    
    return this.showWarning(title, subtitle);
  }
}