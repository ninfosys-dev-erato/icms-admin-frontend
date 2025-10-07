"use client";

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { ActionableNotification, InlineNotification } from '@carbon/react';
import './notification-provider.css';

// Make *anything* renderable for title/subtitle
function normalizeNode(input: unknown): React.ReactNode {
  if (input == null) return '';
  if (React.isValidElement(input)) return input;
  const t = typeof input;
  if (t === 'string' || t === 'number' || t === 'boolean') return String(input);

  // Handle common shapes like { message } or { title, message }
  if (t === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.message === 'string' || React.isValidElement(obj.message)) return obj.message as any;
    if (typeof obj.title === 'string' || React.isValidElement(obj.title)) return obj.title as any;

    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }

  return String(input);
}

// Helper function to convert to string for actionButtonLabel
function normalizeString(input: unknown): string | undefined {
  if (input == null) return undefined;
  const t = typeof input;
  if (t === 'string') return input as string;
  if (t === 'number' || t === 'boolean') return String(input);

  // Handle common shapes like { message } or { title, message }
  if (t === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.title === 'string') return obj.title;

    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }

  return String(input);
}

export const NotificationProvider: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleClose = (id: string) => {
    // Optional: guard against undefined ids
    if (!id) return;
    removeNotification(id);
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => {
        // Destructure but keep original object for fallbacks
        const {
          id,
          kind,
          title,
          subtitle,
          actionButtonLabel,
          onActionButtonClick,
          hideCloseButton,
          lowContrast,
        } = notification as any;

        // Validate essentials early
        if (!id || !kind || !title) {
          console.error('❌ Invalid notification object:', notification);
          return null;
        }

        // Support legacy shapes: message as string/object, or nested {title,message}
        const rawSubtitle =
          subtitle ??
          (notification as any).message ?? // legacy field
          (typeof (notification as any) === 'object' &&
            (notification as any).body) ?? // any other alias you might have used
          '';

        // Normalize to a safe ReactNode for InlineNotification
        const safeTitle = normalizeNode(title);
        const safeSubtitle = normalizeNode(rawSubtitle);
        
        // Normalize to strings for ActionableNotification
        const stringTitle = normalizeString(title);
        const stringSubtitle = normalizeString(rawSubtitle);

        // Extra diagnostics if we had to normalize an object
        if (
          (typeof rawSubtitle === 'object' && rawSubtitle !== null) ||
          (typeof title === 'object' && title !== null && !React.isValidElement(title))
        ) {
          console.warn('⚠️ Normalized non-primitive notification text:', {
            id,
            kind,
            titleType: typeof title,
            subtitleType: typeof rawSubtitle,
            rawSubtitle,
          });
        }

        // Both notification types expect strings for title and subtitle
        const commonProps = {
          kind, // ensure this matches Carbon's allowed kinds: 'error'|'info'|'warning'|'success'
          title: stringTitle,
          subtitle: stringSubtitle,
          onCloseButtonClick: () => handleClose(id),
          hideCloseButton,
          lowContrast,
          style: { marginBottom: '1rem' },
        } as const;

        if (actionButtonLabel && onActionButtonClick) {
          return (
            <div key={id} className="notification-item">
              <ActionableNotification
                {...commonProps}
                actionButtonLabel={normalizeString(actionButtonLabel)}
                onActionButtonClick={onActionButtonClick}
              />
            </div>
          );
        }

        return (
          <div key={id} className="notification-item">
            <InlineNotification {...commonProps} />
          </div>
        );
      })}
    </div>
  );
};
