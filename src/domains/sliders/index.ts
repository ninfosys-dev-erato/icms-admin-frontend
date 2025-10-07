// Components
export { SliderContainer } from './components/slider-container';
export { SliderForm } from './components/slider-form';
export { SliderCreateForm } from './components/slider-create-form';
export { SliderList } from './components/slider-list';
export { SliderImageUpload } from './components/slider-image-upload';
export { SliderImagePreview } from './components/slider-image-preview';
export { SliderStatistics } from './components/slider-statistics';
// Use the shared TranslatableField implementation to avoid duplication.
export { TranslatableField } from '@/components/shared/translatable-field';

// Services
export { SliderService } from './services/slider-service';
export { SliderNotificationService } from './services/slider-notification-service';

// Stores
export { useSliderStore } from './stores/slider-store';

// Types
export type {
  Slider,
  SliderMedia,
  CreateSliderRequest,
  UpdateSliderRequest,
  SliderQuery,
  SliderFormData,
  SliderStatistics as SliderStatisticsType,
  SliderAnalytics,
  PaginationInfo,
  SliderListResponse,
  BulkOperationResult,
  SliderState,
  SliderActions,
  SliderStore,
  ValidationError,
  ValidationResult,
  TranslatableEntity,
} from './types/slider';