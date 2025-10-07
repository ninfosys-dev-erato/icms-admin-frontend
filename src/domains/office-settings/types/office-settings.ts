export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface OfficeSettings {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhotoId?: string;
  backgroundPhoto?: string; // Keep for backward compatibility and display
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeSettingsRequest {
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhotoId?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
}

export interface UpdateOfficeSettingsRequest {
  directorate?: TranslatableEntity;
  officeName?: TranslatableEntity;
  officeAddress?: TranslatableEntity;
  backgroundPhotoId?: string;
  email?: string;
  phoneNumber?: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
}

export interface OfficeSettingsSeo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface OfficeSettingsFormData {
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  email: string;
  phoneNumber: TranslatableEntity;
  website?: string;
  xLink?: string;
  youtube?: string;
  mapIframe?: string;
}

export interface OfficeSettingsState {
  settings: OfficeSettings | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  isUploading: boolean;
}

export interface OfficeSettingsActions {
  loadSettings: () => Promise<void>;
  createSettings: (data: CreateOfficeSettingsRequest) => Promise<void>;
  updateSettings: (id: string, data: UpdateOfficeSettingsRequest) => Promise<void>;
  upsertSettings: (data: CreateOfficeSettingsRequest) => Promise<void>;
  deleteSettings: (id: string) => Promise<void>;
  uploadBackgroundPhoto: (id: string, file: File) => Promise<void>;
  removeBackgroundPhoto: (id: string) => Promise<void>;
  setEditing: (isEditing: boolean) => void;
  clearError: () => void;
}

export type OfficeSettingsStore = OfficeSettingsState & OfficeSettingsActions; 