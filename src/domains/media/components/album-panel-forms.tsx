"use client";

import React from 'react';
import { useAlbumStore } from '../stores/album-store';
import { AlbumCreateForm } from './album-create-form';
import { AlbumEditForm } from './album-edit-form';

export const AlbumPanelForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { panelMode, panelAlbum } = useAlbumStore();
  if (panelMode === 'create') return <AlbumCreateForm onSuccess={onSuccess} />;
  if (panelMode === 'edit' && panelAlbum) return <AlbumEditForm album={panelAlbum} onSuccess={onSuccess} />;
  return null;
};


