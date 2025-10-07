"use client";

import React from 'react';
import { Button, ButtonSet } from '@carbon/react';
import { NotificationService, useNotifications } from '@/services/notification-service';
import { SliderNotificationService } from '@/domains/sliders/services/slider-notification-service';
import { useUIStore } from '@/stores/ui-store';

/**
 * Example component demonstrating how to use the Carbon notification system
 * This file serves as documentation and examples for developers
 */
export const NotificationExamples: React.FC = () => {
  const { notifications, unreadCount, clearAll } = useNotifications();
  
  const { 
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification 
  } = useUIStore();

  const handleBasicSuccess = () => {
    NotificationService.showSuccess('Operation Successful', 'Your changes have been saved successfully.');
  };

  const handleBasicError = () => {
    NotificationService.showError('Operation Failed', 'There was an error processing your request.');
  };

  const handleBasicWarning = () => {
    NotificationService.showWarning('Warning', 'Please review your input before proceeding.');
  };

  const handleBasicInfo = () => {
    NotificationService.showInfo('Information', 'This is an informational message.');
  };

  const handleActionableNotification = () => {
    NotificationService.showActionableNotification(
      'warning',
      'Unsaved Changes',
      'You have unsaved changes that will be lost.',
      'Save Changes',
      () => {
        console.log('Save action clicked');
        NotificationService.showSuccess('Changes Saved', 'Your changes have been saved successfully.');
      }
    );
  };

  const handlePersistentNotification = () => {
    NotificationService.addNotification({
      kind: 'error',
      title: 'Critical Error',
      subtitle: 'A critical error has occurred that requires attention.',
      isPersistent: true,
      timeout: 0, // Never auto-dismiss
      lowContrast: false,
    });
  };

  const handleInlineNotification = () => {
    NotificationService.addNotification({
      kind: 'info',
      title: 'Quick Tip',
      subtitle: 'This is an inline notification example.',
      inline: true,
      timeout: 3000,
    });
  };

  const handleViaUIStore = () => {
    // Example of using the UI store convenience methods
    showSuccessNotification('UI Store Success', 'This notification was triggered via the UI store.');
  };

  const handleCustomTimeout = () => {
    NotificationService.addNotification({
      kind: 'success',
      title: 'Quick Message',
      subtitle: 'This notification will disappear in 2 seconds.',
      timeout: 2000,
    });
  };

  const handleNoCloseButton = () => {
    NotificationService.addNotification({
      kind: 'info',
      title: 'Auto-Dismiss Only',
      subtitle: 'This notification has no close button and will auto-dismiss.',
      hideCloseButton: true,
      timeout: 4000,
    });
  };

  const handleSliderNotifications = () => {
    // Example of domain-specific notifications
    SliderNotificationService.showSliderCreated('My New Slider');
  };

  // Test function to verify close functionality
  const handleTestCloseableNotification = () => {
    const id = NotificationService.addNotification({
      kind: 'info',
      title: 'Test Closeable Notification',
      subtitle: 'This notification should be closeable. Try clicking the X button.',
      timeout: 0, // No auto-dismiss
      hideCloseButton: false,
    });
    console.log('Created test notification with ID:', id);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h2>Carbon Notification System Examples</h2>
      <p>Click the buttons below to see different types of notifications:</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Basic Notifications</h3>
        <ButtonSet>
          <Button onClick={handleBasicSuccess} kind="primary">
            Success Notification
          </Button>
          <Button onClick={handleBasicError} kind="danger">
            Error Notification
          </Button>
          <Button onClick={handleBasicWarning} kind="tertiary">
            Warning Notification
          </Button>
          <Button onClick={handleBasicInfo} kind="secondary">
            Info Notification
          </Button>
        </ButtonSet>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Advanced Notifications</h3>
        <ButtonSet>
          <Button onClick={handleActionableNotification}>
            Actionable Notification
          </Button>
          <Button onClick={handlePersistentNotification}>
            Persistent Notification
          </Button>
          <Button onClick={handleInlineNotification}>
            Inline Notification
          </Button>
        </ButtonSet>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Customization Examples</h3>
        <ButtonSet>
          <Button onClick={handleViaUIStore}>
            Via UI Store
          </Button>
          <Button onClick={handleCustomTimeout}>
            Custom Timeout (2s)
          </Button>
          <Button onClick={handleNoCloseButton}>
            No Close Button
          </Button>
        </ButtonSet>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Testing & Debugging</h3>
        <ButtonSet>
          <Button onClick={handleTestCloseableNotification} kind="secondary">
            Test Closeable Notification
          </Button>
          <Button onClick={clearAll} kind="danger--tertiary">
            Clear All Notifications ({notifications.length})
          </Button>
          <Button onClick={handleSliderNotifications}>
            Domain-Specific Notification
          </Button>
        </ButtonSet>
        
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Current notifications:</strong> {notifications.length} | <strong>Unread:</strong> {unreadCount}</p>
          <p><strong>Debug:</strong> Check console for notification IDs and close events</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f4f4f4', borderRadius: '4px' }}>
        <h3>Usage Examples in Code:</h3>
        <pre style={{ fontSize: '12px', lineHeight: '1.4' }}>
{`// ✅ PREFERRED: Direct service usage
import { NotificationService } from '@/services/notification-service';

// Simple success notification
NotificationService.showSuccess('Success!', 'Operation completed successfully.');

// Error notification (automatically persistent)
NotificationService.showError('Error!', 'Something went wrong.');

// Advanced notification with action
NotificationService.showActionableNotification(
  'warning',
  'Confirm Action',
  'Are you sure you want to proceed?',
  'Confirm',
  () => performAction()
);

// Domain-specific notifications
import { SliderNotificationService } from '@/domains/sliders/services/slider-notification-service';

SliderNotificationService.showSliderCreated('My Slider');
SliderNotificationService.showSliderUpdated('My Slider');

// ✅ Reactive access for components
import { useNotifications } from '@/services/notification-service';

const { notifications, unreadCount, clearAll } = useNotifications();

// ⚠️ Legacy: UI store convenience methods (still works)
import { useUIStore } from '@/stores/ui-store';

const { showSuccessNotification } = useUIStore();
showSuccessNotification('Success', 'Data saved successfully');`}
        </pre>
      </div>
    </div>
  );
};

export default NotificationExamples;
