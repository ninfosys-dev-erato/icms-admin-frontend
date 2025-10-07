'use client';

import React from 'react';
import { Loading } from '@carbon/react';
import { useUIStore } from '@/stores/ui-store';

export const GlobalLoading: React.FC = () => {
  const { isLoading, loadingMessage } = useUIStore();

  if (!isLoading) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '200px',
        }}
      >
        <Loading description={loadingMessage || 'Loading...'} />
        {loadingMessage && (
          <p style={{ margin: 0, textAlign: 'center' }}>{loadingMessage}</p>
        )}
      </div>
    </div>
  );
};
