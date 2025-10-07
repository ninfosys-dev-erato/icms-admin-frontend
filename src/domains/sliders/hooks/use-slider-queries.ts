import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SliderService } from '../services/slider-service';
import { SliderNotificationService } from '../services/slider-notification-service';
import { Slider, SliderAnalytics, SliderListResponse, SliderQuery, SliderStatistics, SliderFormData, CreateSliderRequest, UpdateSliderRequest } from '../types/slider';

export const sliderKeys = {
  all: ['sliders'] as const,
  list: (query: Partial<SliderQuery> = {}) => [...sliderKeys.all, 'list', query] as const,
  publicList: () => [...sliderKeys.all, 'public'] as const,
  detail: (id: string) => [...sliderKeys.all, 'detail', id] as const,
  stats: () => [...sliderKeys.all, 'stats'] as const,
  analytics: (id: string, params?: { dateFrom?: string; dateTo?: string }) => [...sliderKeys.all, 'analytics', { id, ...params }] as const,
};

// ========================================
// QUERIES
// ========================================

export const useSliders = (query: Partial<SliderQuery> = {}) => {
  return useQuery<SliderListResponse>({
    queryKey: sliderKeys.list(query),
    queryFn: () => SliderService.getSliders(query),
    placeholderData: (previousData) => previousData,
  });
};

export const usePublicSliders = () => {
  return useQuery<Slider[]>({
    queryKey: sliderKeys.publicList(),
    queryFn: () => SliderService.getPublicSliders(),
  });
};

export const useSlider = (id: string, enabled = true) => {
  return useQuery<Slider>({
    queryKey: sliderKeys.detail(id),
    queryFn: () => SliderService.getSliderById(id),
    enabled: !!id && enabled,
  });
};

export const useSliderStatistics = () => {
  return useQuery<SliderStatistics>({
    queryKey: sliderKeys.stats(),
    queryFn: () => SliderService.getStatistics(),
  });
};

export const useSliderAnalytics = (id: string, dateFrom?: Date, dateTo?: Date) => {
  const params = { dateFrom: dateFrom?.toISOString(), dateTo: dateTo?.toISOString() };
  return useQuery<SliderAnalytics>({
    queryKey: sliderKeys.analytics(id, params),
    queryFn: () => SliderService.getSliderAnalytics(id, dateFrom, dateTo),
    enabled: !!id,
  });
};

// ========================================
// MUTATIONS
// ========================================

export const useCreateSlider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSliderRequest) => SliderService.createSlider(payload),
    onSuccess: (slider) => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showSliderCreated(SliderService.getDisplayTitle(slider));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create slider';
      SliderNotificationService.showSliderCreationError(errorMessage);
    },
  });
};

export const useUpdateSlider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSliderRequest }) => SliderService.updateSlider(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: sliderKeys.list({}) });
      qc.invalidateQueries({ queryKey: sliderKeys.detail(updated.id) });
    
      SliderNotificationService.showSliderUpdated(SliderService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update slider';
      SliderNotificationService.showSliderUpdateError(errorMessage);
    },
  });
};

export const useDeleteSlider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SliderService.deleteSlider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showSliderDeleted('Slider');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete slider';
      SliderNotificationService.showSliderDeletionError(errorMessage);
    },
  });
};

export const usePublishSlider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SliderService.publishSlider(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: sliderKeys.list({}) });
      qc.invalidateQueries({ queryKey: sliderKeys.detail(updated.id) });
      SliderNotificationService.showPublishSuccess(SliderService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish slider';
      SliderNotificationService.showSliderUpdateError(errorMessage);
    },
  });
};

export const useUnpublishSlider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SliderService.unpublishSlider(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: sliderKeys.list({}) });
      qc.invalidateQueries({ queryKey: sliderKeys.detail(updated.id) });
      SliderNotificationService.showUnpublishSuccess(SliderService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish slider';
      SliderNotificationService.showSliderUpdateError(errorMessage);
    },
  });
};

export const useBulkPublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => SliderService.bulkPublish(ids),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showBulkOperationSuccess('published', result.success || variables.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk publish sliders';
      SliderNotificationService.showSliderUpdateError(errorMessage);
    },
  });
};

export const useBulkUnpublish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => SliderService.bulkUnpublish(ids),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showBulkOperationSuccess('unpublished', result.success || variables.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk unpublish sliders';
      SliderNotificationService.showSliderUpdateError(errorMessage);
    },
  });
};

export const useBulkDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => SliderService.bulkDelete(ids),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showBulkOperationSuccess('deleted', result.success || variables.length);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete sliders';
      SliderNotificationService.showSliderDeletionError(errorMessage);
    },
  });
};

export const useReorderSliders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { id: string; position: number }[]) => SliderService.reorderSliders(orders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showReorderSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder sliders';
      SliderNotificationService.showReorderError(errorMessage);
    },
  });
};

export const useUploadSliderImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => SliderService.uploadSliderImage(id, file),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: sliderKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: sliderKeys.list({}) });
      SliderNotificationService.showImageUploadSuccess(SliderService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      SliderNotificationService.showImageUploadError(errorMessage);
    },
  });
};

export const useRemoveSliderImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SliderService.removeSliderImage(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: sliderKeys.detail(updated.id) });
      qc.invalidateQueries({ queryKey: sliderKeys.list({}) });
      SliderNotificationService.showImageRemovalSuccess(SliderService.getDisplayTitle(updated));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove image';
      SliderNotificationService.showImageUploadError(errorMessage);
    },
  });
};

export const useCreateSliderWithImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: SliderFormData }) => SliderService.createSliderWithImage(file, data),
    onSuccess: (slider) => {
      qc.invalidateQueries({ queryKey: sliderKeys.all });
      SliderNotificationService.showSliderCreated(SliderService.getDisplayTitle(slider));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create slider with image';
      SliderNotificationService.showSliderCreationError(errorMessage);
    },
  });
};


