export enum OfficeDescriptionType {
  INTRODUCTION = 'INTRODUCTION',
  OBJECTIVE = 'OBJECTIVE',
  WORK_DETAILS = 'WORK_DETAILS',
  ORGANIZATIONAL_STRUCTURE = 'ORGANIZATIONAL_STRUCTURE',
  DIGITAL_CHARTER = 'DIGITAL_CHARTER',
  EMPLOYEE_SANCTIONS = 'EMPLOYEE_SANCTIONS'
}

export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface OfficeDescription {
  id: string;
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeDescriptionRequest {
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
}

export interface UpdateOfficeDescriptionRequest {
  officeDescriptionType?: OfficeDescriptionType;
  content?: TranslatableEntity;
}

export interface BulkCreateOfficeDescriptionRequest {
  descriptions: CreateOfficeDescriptionRequest[];
}

export interface BulkUpdateOfficeDescriptionRequest {
  descriptions: {
    id: string;
    content?: TranslatableEntity;
  }[];
}

export interface OfficeDescriptionFormData {
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
}

export interface OfficeDescriptionState {
  descriptions: OfficeDescription[];
  loading: boolean;
  error: string | null;
  editingType: OfficeDescriptionType | null;
  previewMode: boolean;
  selectedDescriptions: string[];
}

export interface OfficeDescriptionStore extends OfficeDescriptionState {
  // Actions
  loadDescriptions: (lang?: string) => Promise<void>;
  loadDescriptionByType: (type: OfficeDescriptionType, lang?: string) => Promise<OfficeDescription | null>;
  createDescription: (data: CreateOfficeDescriptionRequest) => Promise<void>;
  updateDescription: (id: string, data: UpdateOfficeDescriptionRequest) => Promise<void>;
  deleteDescription: (id: string) => Promise<void>;
  upsertDescriptionByType: (type: OfficeDescriptionType, data: CreateOfficeDescriptionRequest) => Promise<void>;
  bulkCreateDescriptions: (data: BulkCreateOfficeDescriptionRequest) => Promise<void>;
  bulkUpdateDescriptions: (data: BulkUpdateOfficeDescriptionRequest) => Promise<void>;
  setEditingType: (type: OfficeDescriptionType | null) => void;
  setPreviewMode: (mode: boolean) => void;
  setSelectedDescriptions: (ids: string[]) => void;
  clearError: () => void;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
} 