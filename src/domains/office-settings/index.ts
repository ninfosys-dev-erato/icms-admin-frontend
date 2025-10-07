// Components
export { OfficeSettingsContainer } from './components/office-settings-container';
export { OfficeSettingsForm } from './components/office-settings-form';
// Re-export shared TranslatableField
export { TranslatableField } from '@/components/shared/translatable-field';
export { BackgroundPhotoUpload } from './components/background-photo-upload';
export { BackgroundPhotoPreview } from './components/background-photo-preview';

// Store
export { useOfficeSettingsStore } from './stores/office-settings-store';

// Service
export { OfficeSettingsService } from './services/office-settings-service';

// Types
export type {
  OfficeSettings,
  CreateOfficeSettingsRequest,
  UpdateOfficeSettingsRequest,
  OfficeSettingsSeo,
  OfficeSettingsFormData,
  TranslatableEntity,
  OfficeSettingsState,
  OfficeSettingsActions,
  OfficeSettingsStore,
} from './types/office-settings'; 