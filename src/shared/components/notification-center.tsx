'use client';

import React from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { Notification } from '@carbon/icons-react';

export const NotificationCenter: React.FC = () => {
  // TODO: Implement notification system
  return (
    <HeaderGlobalAction
      aria-label="Notifications"
      onClick={() => {
        console.log('Notifications clicked');
      }}
    >
      <Notification />
    </HeaderGlobalAction>
  );
}; 