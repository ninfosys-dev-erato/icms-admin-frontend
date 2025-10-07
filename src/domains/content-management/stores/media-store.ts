import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaRepository } from '../repositories/media-repository';
import { NotificationService } from '@/services/notification-service';
import type { 
  MediaFile, 
  MediaFilters, 
  PaginationInfo, 
  UploadItem, 
  PresignedUrlCache,
  UploadOptions,
  MediaMetadata,
  BackblazeUploadStatus
} from '../types/content';

export interface MediaUIStore {
  // Media data
  mediaFiles: MediaFile[];
  filters: MediaFilters;
  pagination: PaginationInfo;
  selectedMedia: MediaFile[];
  isLoading: boolean;
  error: string | null;

  // Upload management
  uploadQueue: UploadItem[];
  activeUploads: Map<string, UploadItem>;
  uploadProgress: Map<string, number>;
  failedUploads: Map<string, string>;

  // Presigned URL management
  presignedUrlCache: Map<string, PresignedUrlCache>;
  urlRefreshQueue: Set<string>;

  // UI state
  isUploading: boolean;
  showUploadModal: boolean;
  showMediaLibrary: boolean;
  selectedMediaIds: Set<string>;

  // Media Actions
  setMediaFiles: (mediaFiles: MediaFile[]) => void;
  addMediaFile: (mediaFile: MediaFile) => void;
  updateMediaFile: (id: string, updates: Partial<MediaFile>) => void;
  removeMediaFile: (id: string) => void;
  setFilters: (filters: Partial<MediaFilters>) => void;
  resetFilters: () => void;
  setPagination: (pagination: PaginationInfo) => void;
  setSelectedMedia: (media: MediaFile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Upload Actions
  addToUploadQueue: (files: File[], options?: UploadOptions) => UploadItem[];
  removeFromUploadQueue: (uploadId: string) => void;
  clearUploadQueue: () => void;
  startUpload: (uploadId: string) => Promise<void>;
  pauseUpload: (uploadId: string) => void;
  resumeUpload: (uploadId: string) => Promise<void>;
  cancelUpload: (uploadId: string) => void;
  retryFailedUpload: (uploadId: string) => Promise<void>;
  updateUploadProgress: (uploadId: string, progress: number) => void;
  setUploadError: (uploadId: string, error: string) => void;
  completeUpload: (uploadId: string, mediaFile: MediaFile) => void;

  // Presigned URL Actions
  getPresignedUrl: (mediaId: string, operation: 'get' | 'put') => Promise<string>;
  refreshPresignedUrl: (mediaId: string) => Promise<void>;
  cachePresignedUrl: (mediaId: string, url: string, operation: 'get' | 'put', expiresAt: number) => void;
  clearExpiredUrls: () => void;
  isUrlExpired: (mediaId: string, operation: 'get' | 'put') => boolean;

  // Media Operations
  deleteMedia: (id: string) => Promise<void>;
  bulkDeleteMedia: (ids: string[]) => Promise<void>;
  updateMediaMetadata: (id: string, metadata: Partial<MediaMetadata>) => Promise<void>;
  moveMediaToCategory: (ids: string[], category: string) => Promise<void>;
  addMediaTags: (ids: string[], tags: string[]) => Promise<void>;
  removeMediaTags: (ids: string[], tags: string[]) => Promise<void>;

  // UI Actions
  setIsUploading: (isUploading: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowMediaLibrary: (show: boolean) => void;
  toggleMediaSelection: (mediaId: string) => void;
  clearMediaSelection: () => void;
  selectAllMedia: () => void;
  deselectAllMedia: () => void;

  // Backblaze B2 specific
  getBackblazeUploadStatus: (uploadId: string) => BackblazeUploadStatus | null;
  setBackblazeUploadStatus: (uploadId: string, status: BackblazeUploadStatus) => void;
  clearBackblazeUploadStatus: (uploadId: string) => void;
}

export const useMediaStore = create<MediaUIStore>()(
  persist(
    (set, get) => ({
      // Media data
      mediaFiles: [],
      filters: {
        search: '',
        category: '',
        mimeType: '',
        fileSizeMin: undefined,
        fileSizeMax: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        tags: [],
        isPublic: undefined,
        uploadedBy: '',
      },
      pagination: {
        page: 1,
        limit: 24,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      selectedMedia: [],
      isLoading: false,
      error: null,

      // Upload management
      uploadQueue: [],
      activeUploads: new Map(),
      uploadProgress: new Map(),
      failedUploads: new Map(),

      // Presigned URL management
      presignedUrlCache: new Map(),
      urlRefreshQueue: new Set(),

      // UI state
      isUploading: false,
      showUploadModal: false,
      showMediaLibrary: false,
      selectedMediaIds: new Set(),

      // Media Actions
      setMediaFiles: (mediaFiles: MediaFile[]) => set({ mediaFiles }),
      addMediaFile: (mediaFile: MediaFile) => 
        set((state) => ({ mediaFiles: [...state.mediaFiles, mediaFile] })),
      updateMediaFile: (id: string, updates: Partial<MediaFile>) =>
        set((state) => ({
          mediaFiles: state.mediaFiles.map(file => 
            file.id === id ? { ...file, ...updates } : file
          )
        })),
      removeMediaFile: (id: string) =>
        set((state) => ({
          mediaFiles: state.mediaFiles.filter(file => file.id !== id)
        })),
      setFilters: (filters: Partial<MediaFilters>) => 
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ 
        filters: {
          search: '',
          category: '',
          mimeType: '',
          fileSizeMin: undefined,
          fileSizeMax: undefined,
          dateFrom: undefined,
          dateTo: undefined,
          tags: [],
          isPublic: undefined,
          uploadedBy: '',
        }
      }),
      setPagination: (pagination: PaginationInfo) => set({ pagination }),
      setSelectedMedia: (media: MediaFile[]) => set({ selectedMedia: media }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // Upload Actions
      addToUploadQueue: (files: File[]) => {
        const newUploads: UploadItem[] = files.map(file => ({
          id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          status: 'pending',
          progress: 0,
          retryCount: 0,
          startedAt: Date.now(),
        }));

        set((state) => ({
          uploadQueue: [...state.uploadQueue, ...newUploads]
        }));

        // Kick off uploads immediately, one by one
        NotificationService.showInfo(
          newUploads.length > 1 ? 'Uploading attachments…' : 'Uploading attachment…'
        );
        newUploads.forEach(u => {
          // Fire-and-forget; progress is tracked in store
          get().startUpload(u.id);
        });
        return newUploads;
      },

      removeFromUploadQueue: (uploadId: string) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter(upload => upload.id !== uploadId)
        }));
      },

      clearUploadQueue: () => set({ uploadQueue: [] }),

      startUpload: async (uploadId: string) => {
        const upload = get().uploadQueue.find(u => u.id === uploadId);
        if (!upload) return;

        set((state) => ({
          uploadQueue: state.uploadQueue.map(u => 
            u.id === uploadId ? { ...u, status: 'uploading' } : u
          ),
          activeUploads: new Map(state.activeUploads).set(uploadId, upload),
          isUploading: true,
        }));

        try {
          // Start the actual upload process using MediaRepository
          const mediaFile = await MediaRepository.uploadMedia(upload.file, {
            category: 'content-attachments',
            isPublic: false,
            onProgress: (progress) => {
              get().updateUploadProgress(uploadId, progress);
            },
            onComplete: (mediaFile: MediaFile) => {
              get().completeUpload(uploadId, mediaFile);
            },
            onError: (error: string) => {
              get().setUploadError(uploadId, error);
            }
          });

          // Complete the upload
          get().completeUpload(uploadId, mediaFile);
          NotificationService.showSuccess('Attachment uploaded');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          get().setUploadError(uploadId, errorMessage);
          NotificationService.showError('Attachment upload failed', errorMessage);
        }
      },

      pauseUpload: (uploadId: string) => {
        set((state) => {
          const newActiveUploads = new Map(state.activeUploads);
          newActiveUploads.delete(uploadId);
          return {
            uploadQueue: state.uploadQueue.map(u => 
              u.id === uploadId ? { ...u, status: 'pending' } : u
            ),
            activeUploads: newActiveUploads,
          };
        });
      },

      resumeUpload: async (uploadId: string) => {
        await get().startUpload(uploadId);
      },

      cancelUpload: (uploadId: string) => {
        set((state) => {
          const newActiveUploads = new Map(state.activeUploads);
          const newUploadProgress = new Map(state.uploadProgress);
          newActiveUploads.delete(uploadId);
          newUploadProgress.delete(uploadId);
          return {
            uploadQueue: state.uploadQueue.map(u => 
              u.id === uploadId ? { ...u, status: 'cancelled' } : u
            ),
            activeUploads: newActiveUploads,
            uploadProgress: newUploadProgress,
          };
        });
      },

      retryFailedUpload: async (uploadId: string) => {
        const upload = get().uploadQueue.find(u => u.id === uploadId);
        if (!upload) return;

        set((state) => {
          const newFailedUploads = new Map(state.failedUploads);
          newFailedUploads.delete(uploadId);
          return {
            uploadQueue: state.uploadQueue.map(u => 
              u.id === uploadId ? { ...u, status: 'pending', error: undefined, retryCount: u.retryCount + 1 } : u
            ),
            failedUploads: newFailedUploads,
          };
        });

        await get().startUpload(uploadId);
      },

      updateUploadProgress: (uploadId: string, progress: number) => {
        set((state) => ({
          uploadProgress: new Map(state.uploadProgress).set(uploadId, progress),
          uploadQueue: state.uploadQueue.map(u => 
            u.id === uploadId ? { ...u, progress } : u
          ),
        }));
      },

      setUploadError: (uploadId: string, error: string) => {
        set((state) => {
          const newActiveUploads = new Map(state.activeUploads);
          const newFailedUploads = new Map(state.failedUploads);
          newActiveUploads.delete(uploadId);
          newFailedUploads.set(uploadId, error);
          return {
            uploadQueue: state.uploadQueue.map(u => 
              u.id === uploadId ? { ...u, status: 'failed', error } : u
            ),
            activeUploads: newActiveUploads,
            failedUploads: newFailedUploads,
          };
        });
      },

      completeUpload: (uploadId: string, mediaFile: MediaFile) => {
        set((state) => {
          const newActiveUploads = new Map(state.activeUploads);
          const newUploadProgress = new Map(state.uploadProgress);
          newActiveUploads.delete(uploadId);
          newUploadProgress.delete(uploadId);
          return {
            uploadQueue: state.uploadQueue.filter(u => u.id !== uploadId),
            activeUploads: newActiveUploads,
            uploadProgress: newUploadProgress,
            mediaFiles: [...state.mediaFiles, mediaFile],
            isUploading: state.uploadQueue.length > 0 || newActiveUploads.size > 0,
          };
        });
      },

      // Presigned URL Actions
      getPresignedUrl: async (mediaId: string, operation: 'get' | 'put') => {
        const cache = get().presignedUrlCache;
        const cacheKey = `${mediaId}_${operation}`;
        const cached = cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
          return cached.url;
        }

        // If expired or not cached, fetch new URL
        // This would integrate with your API service
        const newUrl = await fetch(`/api/v1/media/${mediaId}/presigned-url`, {
          method: 'POST',
          body: JSON.stringify({ operation }),
        }).then(res => res.json());

        get().cachePresignedUrl(mediaId, newUrl.url, operation, newUrl.expiresAt);
        return newUrl.url;
      },

      refreshPresignedUrl: async (mediaId: string) => {
        const cache = get().presignedUrlCache;
        const getKey = `${mediaId}_get`;
        const putKey = `${mediaId}_put`;

        cache.delete(getKey);
        cache.delete(putKey);

        // Fetch new URLs
        await Promise.all([
          get().getPresignedUrl(mediaId, 'get'),
          get().getPresignedUrl(mediaId, 'put'),
        ]);
      },

      cachePresignedUrl: (mediaId: string, url: string, operation: 'get' | 'put', expiresAt: number) => {
        set((state) => {
          const newCache = new Map(state.presignedUrlCache);
          newCache.set(`${mediaId}_${operation}`, { url, expiresAt, operation });
          return { presignedUrlCache: newCache };
        });
      },

      clearExpiredUrls: () => {
        const now = Date.now();
        set((state) => {
          const newCache = new Map(state.presignedUrlCache);
          for (const [key, value] of newCache.entries()) {
            if (value.expiresAt <= now) {
              newCache.delete(key);
            }
          }
          return { presignedUrlCache: newCache };
        });
      },

      isUrlExpired: (mediaId: string, operation: 'get' | 'put') => {
        const cache = get().presignedUrlCache;
        const cacheKey = `${mediaId}_${operation}`;
        const cached = cache.get(cacheKey);
        return !cached || cached.expiresAt <= Date.now();
      },

      // Media Operations
      deleteMedia: async (id: string) => {
        // This would integrate with your API service
        await fetch(`/api/v1/media/${id}`, { method: 'DELETE' });
        get().removeMediaFile(id);
      },

      bulkDeleteMedia: async (ids: string[]) => {
        // This would integrate with your API service
        await fetch('/api/v1/media/bulk-delete', {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });
        
        ids.forEach(id => get().removeMediaFile(id));
      },

      updateMediaMetadata: async (id: string, metadata: Partial<MediaMetadata>) => {
        // This would integrate with your API service
        await fetch(`/api/v1/media/${id}/metadata`, {
          method: 'PUT',
          body: JSON.stringify(metadata),
        });
        
        get().updateMediaFile(id, { metadata: { ...get().mediaFiles.find(f => f.id === id)?.metadata, ...metadata } });
      },

      moveMediaToCategory: async (ids: string[], category: string) => {
        // This would integrate with your API service
        await fetch('/api/v1/media/bulk-update', {
          method: 'PUT',
          body: JSON.stringify({ ids, category }),
        });
        
        ids.forEach(id => get().updateMediaFile(id, { category }));
      },

      addMediaTags: async (ids: string[], tags: string[]) => {
        // This would integrate with your API service
        await fetch('/api/v1/media/bulk-update', {
          method: 'PUT',
          body: JSON.stringify({ ids, tags: { action: 'add', values: tags } }),
        });
        
        ids.forEach(id => {
          const currentTags = get().mediaFiles.find(f => f.id === id)?.tags || [];
          const newTags = [...new Set([...currentTags, ...tags])];
          get().updateMediaFile(id, { tags: newTags });
        });
      },

      removeMediaTags: async (ids: string[], tags: string[]) => {
        // This would integrate with your API service
        await fetch('/api/v1/media/bulk-update', {
          method: 'PUT',
          body: JSON.stringify({ ids, tags: { action: 'remove', values: tags } }),
        });
        
        ids.forEach(id => {
          const currentTags = get().mediaFiles.find(f => f.id === id)?.tags || [];
          const newTags = currentTags.filter(tag => !tags.includes(tag));
          get().updateMediaFile(id, { tags: newTags });
        });
      },

      // UI Actions
      setIsUploading: (isUploading: boolean) => set({ isUploading }),
      setShowUploadModal: (show: boolean) => set({ showUploadModal: show }),
      setShowMediaLibrary: (show: boolean) => set({ showMediaLibrary: show }),
      toggleMediaSelection: (mediaId: string) => {
        set((state) => {
          const newSelection = new Set(state.selectedMediaIds);
          if (newSelection.has(mediaId)) {
            newSelection.delete(mediaId);
          } else {
            newSelection.add(mediaId);
          }
          return { selectedMediaIds: newSelection };
        });
      },
      clearMediaSelection: () => set({ selectedMediaIds: new Set() }),
      selectAllMedia: () => {
        set((state) => ({
          selectedMediaIds: new Set(state.mediaFiles.map(f => f.id))
        }));
      },
      deselectAllMedia: () => set({ selectedMediaIds: new Set() }),

      // Backblaze B2 specific
      getBackblazeUploadStatus: () => {
        // This would return the current upload status from the store
        return null;
      },

      setBackblazeUploadStatus: () => {
        // Reserved for future Backblaze multipart integration
      },

      clearBackblazeUploadStatus: () => {
        // Reserved for future Backblaze multipart integration
      },
    }),
    {
      name: 'content-media-store',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        presignedUrlCache: Array.from(state.presignedUrlCache.entries()),
      }),
    }
  )
); 