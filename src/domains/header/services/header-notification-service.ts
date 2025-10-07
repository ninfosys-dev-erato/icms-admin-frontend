import { NotificationService } from '@/services/notification-service';

/**
 * Header-specific notification service that extends the base NotificationService
 * with domain-specific notification patterns and messaging.
 */
export class HeaderNotificationService extends NotificationService {
  /**
   * Show success notification for header creation
   */
  static showHeaderCreated(headerName?: string): string {
    const title = 'Header Created Successfully';
    const subtitle = headerName 
      ? `Header "${headerName}" has been created and configured.`
      : 'New header has been created and configured successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for header update
   */
  static showHeaderUpdated(headerName?: string): string {
    const title = 'Header Updated Successfully';
    const subtitle = headerName 
      ? `Header "${headerName}" has been updated.`
      : 'Header has been updated successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for header deletion
   */
  static showHeaderDeleted(headerName?: string): string {
    const title = 'Header Deleted Successfully';
    const subtitle = headerName 
      ? `Header "${headerName}" has been deleted.`
      : 'Header has been deleted successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for bulk operations
   */
  static showBulkOperationSuccess(operation: string, count: number): string {
    const title = `Bulk ${operation} Successful`;
    const subtitle = `${count} header${count > 1 ? 's' : ''} ${operation.toLowerCase()}${operation.endsWith('e') ? 'd' : 'ed'} successfully.`;
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show error notifications for header operations
   */
  static showHeaderCreationError(error: string): string {
    return this.showCreateError(error, 'header');
  }

  static showHeaderUpdateError(error: string): string {
    return this.showUpdateError(error, 'header');
  }

  static showHeaderDeletionError(error: string): string {
    return this.showDeleteError(error, 'header');
  }

  /**
   * Show notification for logo upload operations
   */
  static showLogoUploadSuccess(headerName?: string, logoType?: string): string {
    const title = 'Logo Uploaded Successfully';
    const subtitle = headerName 
      ? `Logo for header "${headerName}" has been uploaded${logoType ? ` to ${logoType} position` : ''}.`
      : 'Header logo has been uploaded successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  static showLogoUploadError(error: string): string {
    const title = 'Logo Upload Failed';
    const subtitle = `Failed to upload header logo: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showLogoRemovalSuccess(headerName?: string): string {
    const title = 'Logo Removed Successfully';
    const subtitle = headerName 
      ? `Logo for header "${headerName}" has been removed.`
      : 'Header logo has been removed successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show notification for reordering operations
   */
  static showReorderSuccess(): string {
    return this.showSuccess(
      'Headers Reordered Successfully',
      'Header positions have been updated.'
    );
  }

  static showReorderError(error: string): string {
    const title = 'Reorder Failed';
    const subtitle = `Failed to reorder headers: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for publish/unpublish operations
   */
  static showPublishSuccess(headerName?: string): string {
    const title = 'Header Published Successfully';
    const subtitle = headerName 
      ? `Header "${headerName}" is now live.`
      : 'Header is now published and live.';
    
    return this.showSuccess(title, subtitle);
  }

  static showUnpublishSuccess(headerName?: string): string {
    const title = 'Header Unpublished Successfully';
    const subtitle = headerName 
      ? `Header "${headerName}" is no longer live.`
      : 'Header has been unpublished.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show notification for CSS generation
   */
  static showCSSGenerationSuccess(): string {
    return this.showSuccess(
      'CSS Generated Successfully',
      'Header CSS has been generated and is ready for use.'
    );
  }

  static showCSSGenerationError(error: string): string {
    const title = 'CSS Generation Failed';
    const subtitle = `Failed to generate header CSS: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for preview operations
   */
  static showPreviewGenerated(): string {
    return this.showSuccess(
      'Preview Generated',
      'Header preview has been generated successfully.'
    );
  }

  static showPreviewError(error: string): string {
    const title = 'Preview Generation Failed';
    const subtitle = `Failed to generate header preview: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show validation error for header form
   */
  static showValidationErrors(errors: string[]): string {
    return this.showValidationError(errors);
  }

  /**
   * Show loading notification for long operations
   */
  static showLoadingHeaders(): string {
    return this.showLoading('Loading', 'headers');
  }

  static showCreatingHeader(): string {
    return this.showLoading('Creating', 'header');
  }

  static showUpdatingHeader(): string {
    return this.showLoading('Updating', 'header');
  }

  static showDeletingHeader(): string {
    return this.showLoading('Deleting', 'header');
  }

  static showGeneratingCSS(): string {
    return this.showLoading('Generating', 'CSS');
  }

  static showGeneratingPreview(): string {
    return this.showLoading('Generating', 'preview');
  }

  /**
   * Show confirmation for destructive operations
   */
  static showDeleteConfirmation(
    headerName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete header "${headerName}"? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }

  static showBulkDeleteConfirmation(
    count: number,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Bulk Deletion';
    const subtitle = `Are you sure you want to delete ${count} header${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }

  /**
   * Show notification for import/export operations
   */
  static showExportSuccess(format: string): string {
    return this.showSuccess(
      'Export Successful',
      `Headers have been exported to ${format.toUpperCase()} format.`
    );
  }

  static showExportError(error: string): string {
    const title = 'Export Failed';
    const subtitle = `Failed to export headers: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showImportSuccess(count: number): string {
    return this.showSuccess(
      'Import Successful',
      `${count} header${count > 1 ? 's' : ''} have been imported successfully.`
    );
  }

  static showImportError(error: string): string {
    const title = 'Import Failed';
    const subtitle = `Failed to import headers: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for logo configuration
   */
  static showLogoConfigurationSuccess(): string {
    return this.showSuccess(
      'Logo Configuration Updated',
      'Logo settings have been updated successfully.'
    );
  }

  static showLogoConfigurationError(error: string): string {
    const title = 'Logo Configuration Failed';
    const subtitle = `Failed to update logo configuration: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for typography updates
   */
  static showTypographyUpdateSuccess(): string {
    return this.showSuccess(
      'Typography Updated',
      'Font and text settings have been updated successfully.'
    );
  }

  static showTypographyUpdateError(error: string): string {
    const title = 'Typography Update Failed';
    const subtitle = `Failed to update typography settings: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for layout updates
   */
  static showLayoutUpdateSuccess(): string {
    return this.showSuccess(
      'Layout Updated',
      'Header layout and spacing have been updated successfully.'
    );
  }

  static showLayoutUpdateError(error: string): string {
    const title = 'Layout Update Failed';
    const subtitle = `Failed to update layout settings: ${error}`;
    
    return this.showError(title, subtitle);
  }
}
