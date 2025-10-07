"use client";

import React from 'react';
import { useMediaStore } from '../stores/media-store';
import { MediaUploadForm } from './media-upload-form';
import { MediaEditForm } from './media-edit-form';

export const MediaPanelForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { panelMode, panelMedia } = useMediaStore();

  if (panelMode === 'create') return <MediaUploadForm onSuccess={onSuccess} />;
  if (panelMode === 'edit' && panelMedia) return <MediaEditForm media={panelMedia} onSuccess={onSuccess} />;
  return null;
};


