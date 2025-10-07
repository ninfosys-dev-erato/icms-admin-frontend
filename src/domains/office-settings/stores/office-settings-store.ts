import { create } from 'zustand';
import { OfficeSettingsStore, CreateOfficeSettingsRequest, UpdateOfficeSettingsRequest } from '../types/office-settings';
import { OfficeSettingsService } from '../services/office-settings-service';

export const useOfficeSettingsStore = create<OfficeSettingsStore>((set) => ({
  // State
  settings: null,
  loading: false,
  error: null,
  isEditing: false,
  isUploading: false,

  // Actions
  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await OfficeSettingsService.getSettings();
      if (settings === null) {
        // No settings found (404) - this is normal for first time setup
        set({ settings: null, loading: false, error: null });
      } else {
        set({ settings, loading: false });
      }
    } catch (error) {
      console.error('❌ Office Settings: Load failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load office settings';
      set({ error: errorMessage, loading: false });
    }
  },

  createSettings: async (data: CreateOfficeSettingsRequest) => {
    set({ loading: true, error: null });
    try {
      const settings = await OfficeSettingsService.createSettings(data);
      set({ settings, loading: false });
    } catch (error) {
      console.error('❌ Office Settings: Create failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create office settings';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateSettings: async (id: string, data: UpdateOfficeSettingsRequest) => {
    set({ loading: true, error: null });
    try {
      const settings = await OfficeSettingsService.updateSettings(id, data);
      set({ settings, loading: false });
    } catch (error) {
      console.error('❌ Office Settings: Update failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update office settings';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  upsertSettings: async (data: CreateOfficeSettingsRequest) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 Office Settings: Upserting settings...', data);
      const settings = await OfficeSettingsService.upsertSettings(data);
      console.log('✅ Office Settings: Upserted successfully:', settings);
      set({ settings, loading: false, isEditing: false });
    } catch (error) {
      console.error('❌ Office Settings: Upsert failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upsert office settings';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteSettings: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 Office Settings: Deleting settings...', id);
      await OfficeSettingsService.deleteSettings(id);
      console.log('✅ Office Settings: Deleted successfully');
      set({ settings: null, loading: false, isEditing: false });
    } catch (error) {
      console.error('❌ Office Settings: Delete failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete office settings';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  uploadBackgroundPhoto: async (id: string, file: File) => {
    set({ isUploading: true, error: null });
    try {
      console.log('🔍 Office Settings: Uploading background photo...', { id, fileName: file.name });
      const settings = await OfficeSettingsService.uploadBackgroundPhoto(id, file);
      console.log('✅ Office Settings: Background photo uploaded successfully:', settings);
      set({ settings, isUploading: false });
    } catch (error) {
      console.error('❌ Office Settings: Background photo upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload background photo';
      set({ error: errorMessage, isUploading: false });
      throw error;
    }
  },

  removeBackgroundPhoto: async (id: string) => {
    set({ isUploading: true, error: null });
    try {
      console.log('🔍 Office Settings: Removing background photo...', id);
      const settings = await OfficeSettingsService.removeBackgroundPhoto(id);
      console.log('✅ Office Settings: Background photo removed successfully:', settings);
      set({ settings, isUploading: false });
    } catch (error) {
      console.error('❌ Office Settings: Background photo removal failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove background photo';
      set({ error: errorMessage, isUploading: false });
      throw error;
    }
  },

  setEditing: (isEditing: boolean) => {
    set({ isEditing });
  },

  clearError: () => {
    set({ error: null });
  },
})); 