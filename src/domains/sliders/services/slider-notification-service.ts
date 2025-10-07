import { NotificationService } from '@/services/notification-service';

/**
 * Slider-specific notification service that extends the base NotificationService
 * with domain-specific notification patterns and messaging.
 */
export class SliderNotificationService extends NotificationService {
  /**
   * Show success notification for slider creation
   */
  static showSliderCreated(sliderTitle?: string): string {
    const title = 'Slider Created Successfully';
    const subtitle = sliderTitle 
      ? `Slider "${sliderTitle}" has been created and added to the gallery.`
      : 'New slider has been created and added to the gallery.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for slider update
   */
  static showSliderUpdated(sliderTitle?: string): string {
    const title = 'Slider Updated Successfully';
    const subtitle = sliderTitle 
      ? `Slider "${sliderTitle}" has been updated.`
      : 'Slider has been updated successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for slider deletion
   */
  static showSliderDeleted(sliderTitle?: string): string {
    const title = 'Slider Deleted Successfully';
    const subtitle = sliderTitle 
      ? `Slider "${sliderTitle}" has been deleted.`
      : 'Slider has been deleted successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show success notification for bulk operations
   */
  static showBulkOperationSuccess(operation: string, count: number): string {
    const title = `Bulk ${operation} Successful`;
    const subtitle = `${count} slider${count > 1 ? 's' : ''} ${operation.toLowerCase()}${operation.endsWith('e') ? 'd' : 'ed'} successfully.`;
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show error notifications for slider operations
   */
  static showSliderCreationError(error: string): string {
    return this.showCreateError(error, 'slider');
  }

  static showSliderUpdateError(error: string): string {
    return this.showUpdateError(error, 'slider');
  }

  static showSliderDeletionError(error: string): string {
    return this.showDeleteError(error, 'slider');
  }

  /**
   * Show notification for image upload operations
   */
  static showImageUploadSuccess(sliderTitle?: string): string {
    const title = 'Image Uploaded Successfully';
    const subtitle = sliderTitle 
      ? `Image for slider "${sliderTitle}" has been uploaded.`
      : 'Slider image has been uploaded successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  static showImageUploadError(error: string): string {
    const title = 'Image Upload Failed';
    const subtitle = `Failed to upload slider image: ${error}`;
    
    return this.showError(title, subtitle);
  }

  static showImageRemovalSuccess(sliderTitle?: string): string {
    const title = 'Image Removed Successfully';
    const subtitle = sliderTitle 
      ? `Image for slider "${sliderTitle}" has been removed.`
      : 'Slider image has been removed successfully.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show notification for reordering operations
   */
  static showReorderSuccess(): string {
    return this.showSuccess(
      'Sliders Reordered Successfully',
      'Slider positions have been updated.'
    );
  }

  static showReorderError(error: string): string {
    const title = 'Reorder Failed';
    const subtitle = `Failed to reorder sliders: ${error}`;
    
    return this.showError(title, subtitle);
  }

  /**
   * Show notification for publish/unpublish operations
   */
  static showPublishSuccess(sliderTitle?: string): string {
    const title = 'Slider Published Successfully';
    const subtitle = sliderTitle 
      ? `Slider "${sliderTitle}" is now live.`
      : 'Slider is now published and live.';
    
    return this.showSuccess(title, subtitle);
  }

  static showUnpublishSuccess(sliderTitle?: string): string {
    const title = 'Slider Unpublished Successfully';
    const subtitle = sliderTitle 
      ? `Slider "${sliderTitle}" is no longer live.`
      : 'Slider has been unpublished.';
    
    return this.showSuccess(title, subtitle);
  }

  /**
   * Show validation error for slider form
   */
  static showValidationErrors(errors: string[]): string {
    return this.showValidationError(errors);
  }

  /**
   * Show loading notification for long operations
   */
  static showLoadingSliders(): string {
    return this.showLoading('Loading', 'sliders');
  }

  static showCreatingSlider(): string {
    return this.showLoading('Creating', 'slider');
  }

  static showUpdatingSlider(): string {
    return this.showLoading('Updating', 'slider');
  }

  static showDeletingSlider(): string {
    return this.showLoading('Deleting', 'slider');
  }

  /**
   * Show confirmation for destructive operations
   */
  static showDeleteConfirmation(
    sliderTitle: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete slider "${sliderTitle}"? This action cannot be undone.`;
    
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
    const subtitle = `Are you sure you want to delete ${count} slider${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, {
      kind: 'warning',
    });
  }
}
