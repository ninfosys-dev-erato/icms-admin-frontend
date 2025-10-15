import { NotificationService } from '@/services/notification-service';

export class HRNotificationService extends NotificationService {
  // Department
  static departmentCreated(name?: string) {
    return this.showSuccess('Department Created', name ? `"${name}" has been created.` : 'Department created successfully.');
  }
  static departmentUpdated(name?: string) {
    return this.showSuccess('Department Updated', name ? `"${name}" has been updated.` : 'Department updated successfully.');
  }
  static departmentDeleted(name?: string) {
    return this.showSuccess('Department Deleted', name ? `"${name}" has been deleted.` : 'Department deleted successfully.');
  }
  static departmentBulk(operation: string, count: number) {
    return this.showSuccess(`Departments ${operation}`, `${count} department(s) ${operation}.`);
  }

  // Employee
  static employeeCreated(name?: string) {
    return this.showSuccess('Employee Created', name ? `"${name}" has been created.` : 'Employee created successfully.');
  }
  static employeeUpdated(name?: string) {
    return this.showSuccess('Employee Updated', name ? `"${name}" has been updated.` : 'Employee updated successfully.');
  }
  static employeeDeleted(name?: string) {
    return this.showSuccess('Employee Deleted', name ? `"${name}" has been deleted.` : 'Employee deleted successfully.');
  }
  static employeeBulk(operation: string, count: number) {
    return this.showSuccess(`Employees ${operation}`, `${count} employee(s) ${operation}.`);
  }

  // Employee Photo
  // static employeePhotoUploaded(name?: string) {
  //   return this.showSuccess('Photo Uploaded', name ? `Photo for "${name}" has been uploaded successfully.` : 'Employee photo uploaded successfully.');
  // }
  static employeePhotoRemoved(name?: string) {
    return this.showSuccess('Photo Removed', name ? `Photo for "${name}" has been removed successfully.` : 'Employee photo removed successfully.');
  }
  static employeeCreatedWithPhoto(name?: string) {
    return this.showSuccess('Employee Created', name ? `"${name}" has been created with photo successfully.` : 'Employee created with photo successfully.');
  }
  static showPhotoUploadError(error: string, entity: string) {
    return this.showError(`${entity} Photo Upload Failed`, error);
  }
  static showPhotoRemovalError(error: string, entity: string) {
    return this.showError(`${entity} Photo Removal Failed`, error);
  }
}


