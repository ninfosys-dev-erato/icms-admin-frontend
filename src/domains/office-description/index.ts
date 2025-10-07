// Components
export { OfficeDescriptionContainer } from './components/office-description-container';
export { OfficeDescriptionForm } from './components/office-description-form';
export { OfficeDescriptionList } from './components/office-description-list';
export { OfficeDescriptionCard } from './components/office-description-card';
export { TranslatableField } from './components/translatable-field';

// Hooks
export { 
  useAdminOfficeDescriptions,
  useAdminOfficeDescription,
  useOfficeDescriptions,
  useOfficeDescription,
  useOfficeDescriptionByType,
  useCreateOfficeDescription,
  useUpdateOfficeDescription,
  useDeleteOfficeDescription,
  useUpsertOfficeDescription
} from './hooks/use-office-description-queries';

// Store
export { useOfficeDescriptionUIStore } from './stores/office-description-ui-store';

// Types
export type { 
  OfficeDescription, 
  OfficeDescriptionType, 
  TranslatableEntity,
  CreateOfficeDescriptionRequest,
  UpdateOfficeDescriptionRequest
} from './types/office-description'; 