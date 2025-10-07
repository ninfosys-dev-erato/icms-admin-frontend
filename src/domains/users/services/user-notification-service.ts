import { NotificationService } from '@/services/notification-service';

/**
 * User-specific notification service mirroring the slider notification patterns
 */
export class UserNotificationService extends NotificationService {
  // CRUD
  static showUserCreated(userTitle?: string): string {
    const title = 'User Created Successfully';
    const subtitle = userTitle
      ? `User "${userTitle}" has been created.`
      : 'New user has been created successfully.';
    return this.showSuccess(title, subtitle);
  }

  static showUserUpdated(userTitle?: string): string {
    const title = 'User Updated Successfully';
    const subtitle = userTitle
      ? `User "${userTitle}" has been updated.`
      : 'User has been updated successfully.';
    return this.showSuccess(title, subtitle);
  }

  static showUserDeleted(userTitle?: string): string {
    const title = 'User Deleted Successfully';
    const subtitle = userTitle
      ? `User "${userTitle}" has been deleted.`
      : 'User has been deleted successfully.';
    return this.showSuccess(title, subtitle);
  }

  // Bulk
  static showBulkOperationSuccess(operation: string, count: number): string {
    const title = `Bulk ${operation} Successful`;
    const subtitle = `${count} user${count > 1 ? 's' : ''} ${operation.toLowerCase()}${operation.endsWith('e') ? 'd' : 'ed'} successfully.`;
    return this.showSuccess(title, subtitle);
  }

  // Status & Role
  static showActivationSuccess(userTitle?: string): string {
    return this.showSuccess('User Activated', userTitle ? `${userTitle} is now active.` : 'User is now active.');
  }

  static showDeactivationSuccess(userTitle?: string): string {
    return this.showInfo('User Deactivated', userTitle ? `${userTitle} is now inactive.` : 'User has been deactivated.');
  }

  static showRoleUpdateSuccess(userTitle?: string, role?: string): string {
    const subtitle = userTitle && role ? `${userTitle} is now ${role}.` : 'Role updated successfully.';
    return this.showSuccess('Role Updated', subtitle);
  }

  // Errors
  static showUserCreationError(error: string): string {
    return this.showCreateError(error, 'user');
  }

  static showUserUpdateError(error: string): string {
    return this.showUpdateError(error, 'user');
  }

  static showUserDeletionError(error: string): string {
    return this.showDeleteError(error, 'user');
  }

  static showValidationErrors(errors: string[]): string {
    return this.showValidationError(errors);
  }
}


