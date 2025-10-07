import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { mediaRepository } from '../repositories/media-repository';
import type { Media, MediaListResponse, MediaQuery, MediaLibrarySummary, MediaStatistics } from '../types/media';
import { MediaNotificationService } from '../services/media-notification-service';

const keys = {
  list: (q: Partial<MediaQuery>) => ['media', 'list', q] as const,
  publicGalleryList: (q: Partial<MediaQuery>) => ['media', 'public-gallery', q] as const,
  library: ['media', 'library'] as const,
  stats: ['media', 'stats'] as const,
  item: (id: string) => ['media', 'item', id] as const,
};

export const useMedia = (query: Partial<MediaQuery> = {}) =>
  useQuery({
    queryKey: keys.list(query),
    queryFn: () => mediaRepository.getMedia(query),
  });

export const usePublicMedia = (query: Partial<MediaQuery> = {}) =>
  useQuery({
    queryKey: keys.list({ ...query, isPublic: true }),
    queryFn: () => mediaRepository.getPublicMedia(query),
  });

export const usePublicGalleryMedia = (query: Partial<MediaQuery> = {}) =>
  useQuery({
    queryKey: keys.publicGalleryList(query),
    queryFn: () => mediaRepository.getPublicGalleryMedia(query),
  });

export const useMediaItem = (id: string, enabled = true) =>
  useQuery({
    queryKey: keys.item(id),
    queryFn: () => mediaRepository.getById(id),
    enabled: !!id && enabled,
  });

export const useMediaLibrary = () =>
  useQuery<MediaLibrarySummary>({
    queryKey: keys.library,
    queryFn: () => mediaRepository.getLibrary(),
  });

export const useMediaStatistics = () =>
  useQuery<MediaStatistics>({
    queryKey: keys.stats,
    queryFn: () => mediaRepository.getStatistics(),
  });

export const useUploadMedia = () =>
  useMutation({
    mutationFn: async (params: { file: File; form: Partial<Media> }) => {
      MediaNotificationService.uploadStarted();
      return mediaRepository.upload(params.file, params.form);
    },
    onSuccess: (media) => {
      MediaNotificationService.created(media);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.uploadFailed(e?.message || 'Upload failed');
    },
  });

export const useBulkUploadMedia = () =>
  useMutation({
    mutationFn: async (params: { files: File[]; form: Partial<Media> }) => {
      MediaNotificationService.uploadStarted(params.files.length);
      return mediaRepository.bulkUpload(params.files, params.form);
    },
    onSuccess: (res) => {
      MediaNotificationService.bulk('Upload', res.uploaded.length);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.uploadFailed(e?.message || 'Bulk upload failed');
    },
  });

export const useUpdateMedia = () =>
  useMutation({
    mutationFn: (params: { id: string; data: Partial<Media> }) => mediaRepository.update(params.id, params.data),
    onSuccess: (media) => {
      MediaNotificationService.updated(media);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showUpdateError(e?.message || 'Update failed', 'media');
    },
  });

export const useReplaceMediaFile = () =>
  useMutation({
    mutationFn: (params: { id: string; file: File; form?: Partial<Media> }) => mediaRepository.replaceFile(params.id, params.file, params.form),
    onSuccess: (media) => {
      MediaNotificationService.updated(media);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showUpdateError(e?.message || 'Replace failed', 'media');
    },
  });

export const useDeleteMedia = () =>
  useMutation({
    mutationFn: (id: string) => mediaRepository.delete(id),
    onSuccess: () => {
      MediaNotificationService.deleted('media');
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showDeleteError(e?.message || 'Delete failed', 'media');
    },
  });

export const useBulkDeleteMedia = () =>
  useMutation({
    mutationFn: (ids: string[]) => mediaRepository.bulkDelete(ids),
    onSuccess: (res) => {
      MediaNotificationService.bulk('Delete', res.succeeded);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showDeleteError(e?.message || 'Bulk delete failed', 'media');
    },
  });


