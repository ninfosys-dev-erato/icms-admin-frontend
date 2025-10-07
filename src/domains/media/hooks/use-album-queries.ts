import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { albumRepository } from '../repositories/album-repository';
import type { Album, AlbumListResponse, AlbumQuery } from '../types/album';
import { MediaNotificationService } from '../services/media-notification-service';

const keys = {
  list: (q: Partial<AlbumQuery>) => ['albums', 'list', q] as const,
  item: (id: string) => ['albums', 'item', id] as const,
  media: (id: string) => ['albums', 'item', id, 'media'] as const,
};

export const useAlbums = (query: Partial<AlbumQuery> = {}) =>
  useQuery<AlbumListResponse>({
    queryKey: keys.list(query),
    queryFn: () => albumRepository.list(query),
  });

export const useAlbum = (id: string, enabled = true) =>
  useQuery<Album>({
    queryKey: keys.item(id),
    queryFn: () => albumRepository.getById(id),
    enabled: !!id && enabled,
  });

export const useAlbumMedia = (albumId: string, enabled = true) =>
  useQuery({
    queryKey: keys.media(albumId),
    queryFn: () => albumRepository.listMedia(albumId),
    enabled: !!albumId && enabled,
  });

export const useCreateAlbum = () =>
  useMutation({
    mutationFn: (data: Partial<Album>) => albumRepository.create(data),
    onSuccess: (album) => {
      MediaNotificationService.created(album.name?.en || 'Album');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

export const useUpdateAlbum = () =>
  useMutation({
    mutationFn: (params: { id: string; data: Partial<Album> }) => albumRepository.update(params.id, params.data),
    onSuccess: (album) => {
      MediaNotificationService.updated(album.name?.en || 'Album');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

export const useDeleteAlbum = () =>
  useMutation({
    mutationFn: (id: string) => albumRepository.delete(id),
    onSuccess: () => {
      MediaNotificationService.deleted('Album');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

export const useAddMediaToAlbum = () =>
  useMutation({
    mutationFn: (params: { albumId: string; mediaId: string }) => albumRepository.addMedia(params.albumId, params.mediaId),
    onSuccess: () => {
      MediaNotificationService.showSuccess('Added to album');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showError('Failed to add to album', e?.message);
    },
  });

export const useRemoveMediaFromAlbum = () =>
  useMutation({
    mutationFn: (params: { albumId: string; mediaId: string }) => albumRepository.removeMedia(params.albumId, params.mediaId),
    onSuccess: () => {
      MediaNotificationService.showSuccess('Removed from album');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showError('Failed to remove from album', e?.message);
    },
  });

export const useReorderAlbum = () =>
  useMutation({
    mutationFn: (params: { albumId: string; items: Array<{ mediaId: string; position: number }> }) => albumRepository.reorder(params.albumId, params.items),
    onSuccess: () => {
      MediaNotificationService.showSuccess('Album order updated');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

export const useBulkAddMediaToAlbum = () =>
  useMutation<{ message: string }, any, { albumId: string; mediaIds: string[] }>({
    mutationFn: (params) => albumRepository.bulkAddMedia(params.albumId, params.mediaIds),
    onSuccess: (_res, vars) => {
      const count = vars?.mediaIds?.length ?? 0;
      if (count > 0) {
        MediaNotificationService.bulk('Add', count);
      }
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any, vars) => {
      const count = vars?.mediaIds?.length ?? 0;
      // Only show a toast if this was a user-initiated mutation with actual items
      if (count > 0) {
        MediaNotificationService.showError('Bulk add failed', e?.message);
      } else if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
        console.warn('Bulk add error suppressed (no mediaIds provided)', e);
      }
    },
  });

export const useBulkRemoveMediaFromAlbum = () =>
  useMutation({
    mutationFn: (params: { albumId: string; mediaIds: string[] }) => albumRepository.bulkRemoveMedia(params.albumId, params.mediaIds),
    onSuccess: (_res, vars) => {
      MediaNotificationService.bulk('Remove', vars.mediaIds.length);
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e: any) => {
      MediaNotificationService.showError('Bulk remove failed', e?.message);
    },
  });


