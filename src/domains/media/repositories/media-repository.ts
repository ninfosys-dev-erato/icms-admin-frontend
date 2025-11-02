import { httpClient } from '@/lib/api/http-client';
import type {
  Media,
  MediaListResponse,
  MediaQuery,
  MediaLibrarySummary,
  MediaStatistics,
  PresignedUrlResponse,
} from '../types/media';

export interface MediaRepository {
  getMedia(params?: Partial<MediaQuery>): Promise<MediaListResponse>;
  getPublicMedia(params?: Partial<MediaQuery>): Promise<MediaListResponse>;
  getPublicGalleryMedia(params?: Partial<MediaQuery>): Promise<MediaListResponse>;
  search(params: Partial<MediaQuery> & { search: string }): Promise<MediaListResponse>;

  getById(id: string): Promise<Media>;
  upload(file: File, form: Partial<Media>): Promise<Media>;
  bulkUpload(files: File[], form: Partial<Media>): Promise<{ uploaded: Media[]; failed: Array<{ originalName: string; error: string }>; }>; 
  update(id: string, data: Partial<Media>): Promise<Media>;
  replaceFile(id: string, file: File, form?: Partial<Media>): Promise<Media>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<{ success: boolean; processed: number; succeeded: number; failed: number }>; 

  getLibrary(): Promise<MediaLibrarySummary>;
  getStatistics(): Promise<MediaStatistics>;
  getPresignedUrl(id: string, expiresIn?: number): Promise<PresignedUrlResponse>;
}

class MediaRepositoryImpl implements MediaRepository {
  private readonly BASE_URL = '/media';
  private normalizeErrorMessage(msg?: string | string[]): string {
    if (Array.isArray(msg)) return msg.join(', ');
    return msg || '';
  }

  async getMedia(params: Partial<MediaQuery> = {}): Promise<MediaListResponse> {
    const res = await httpClient.get<MediaListResponse>(`${this.BASE_URL}`, { params });
    if (!res.success) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to load media');

    // Backend may return either:
    // 1) data: MediaListResponse { data: Media[]; pagination: { ... } }
    // 2) data: Media[] and pagination at root alongside data
    const root: any = res;
    const payload = root?.data;

    if (Array.isArray(payload)) {
      return {
        data: payload as Media[],
        pagination: root?.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? payload.length,
          total: root?.meta?.total ?? payload.length,
          totalPages: root?.meta?.totalPages ?? 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    if (payload?.data && payload?.pagination) {
      return payload as MediaListResponse;
    }

    throw new Error('Unexpected media list response shape');
  }

  async getPublicMedia(params: Partial<MediaQuery> = {}): Promise<MediaListResponse> {
    const res = await httpClient.get<MediaListResponse>(`${this.BASE_URL}/public`, { params });
    if (!res.success) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to load public media');

    const root: any = res;
    const payload = root?.data;

    if (Array.isArray(payload)) {
      return {
        data: payload as Media[],
        pagination: root?.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? payload.length,
          total: root?.meta?.total ?? payload.length,
          totalPages: root?.meta?.totalPages ?? 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    if (payload?.data && payload?.pagination) {
      return payload as MediaListResponse;
    }

    throw new Error('Unexpected public media list response shape');
  }

  async getPublicGalleryMedia(params: Partial<MediaQuery> = {}): Promise<MediaListResponse> {
    // Specific endpoint that returns only gallery media
    const res = await httpClient.get<MediaListResponse>(`${this.BASE_URL}/public/gallery`, { params });
    if (!res.success) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to load public gallery media');

    const root: any = res;
    const payload = root?.data;

    if (Array.isArray(payload)) {
      return {
        data: payload as Media[],
        pagination: root?.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? payload.length,
          total: root?.meta?.total ?? payload.length,
          totalPages: root?.meta?.totalPages ?? 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    if (payload?.data && payload?.pagination) {
      return payload as MediaListResponse;
    }

    throw new Error('Unexpected public gallery media list response shape');
  }

  async search(params: Partial<MediaQuery> & { search: string }): Promise<MediaListResponse> {
    // Backend expects 'query' param for /media/search endpoint
    const { search, ...rest } = params as any;
    const res = await httpClient.get<MediaListResponse>(`${this.BASE_URL}/search`, { params: { ...rest, query: search } });
    if (!res.success) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to search media');

    const root: any = res;
    const payload = root?.data;

    if (Array.isArray(payload)) {
      return {
        data: payload as Media[],
        pagination: root?.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? payload.length,
          total: root?.meta?.total ?? payload.length,
          totalPages: root?.meta?.totalPages ?? 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    if (payload?.data && payload?.pagination) {
      return payload as MediaListResponse;
    }

    throw new Error('Unexpected search media list response shape');
  }

  async getById(id: string): Promise<Media> {
    const res = await httpClient.get<Media>(`${this.BASE_URL}/${id}`);
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Media not found');
    return res.data;
  }

  async upload(file: File, form: Partial<Media>): Promise<Media> {
    const fd = new FormData();
    // Backend supports either 'file' or 'image' field
    fd.append('file', file);
    fd.append('originalName', file.name);
    // Add common alias keys some backends expect
    fd.append('originalname', file.name);
    fd.append('fileName', file.name);
    fd.append('size', String(file.size));
    fd.append('fileSize', String(file.size));
    fd.append('mimetype', file.type);
    fd.append('mimeType', file.type);
    fd.append('contentType', file.type);
    if (form.folder) fd.append('folder', String(form.folder));
    // Support translatable fields from admin UI; backend may accept either combined or split fields
    const titleAny: any = (form as any).title;
    const descAny: any = (form as any).description;
    const altAny: any = (form as any).altText;
    if (titleAny && typeof titleAny === 'object') {
      if (titleAny.en) fd.append('titleEn', String(titleAny.en));
      if (titleAny.ne) fd.append('titleNe', String(titleAny.ne));
      if (titleAny.en || titleAny.ne) fd.append('title', String(titleAny.en || titleAny.ne));
    } else if ((form as any).title) {
      fd.append('title', String((form as any).title as string));
    }
    if (descAny && typeof descAny === 'object') {
      if (descAny.en) fd.append('descriptionEn', String(descAny.en));
      if (descAny.ne) fd.append('descriptionNe', String(descAny.ne));
      if (descAny.en || descAny.ne) fd.append('description', String(descAny.en || descAny.ne));
    } else if ((form as any).description) {
      fd.append('description', String((form as any).description as string));
    }
    if (altAny && typeof altAny === 'object') {
      if (altAny.en) fd.append('altTextEn', String(altAny.en));
      if (altAny.ne) fd.append('altTextNe', String(altAny.ne));
      if (altAny.en || altAny.ne) fd.append('altText', String(altAny.en || altAny.ne));
    } else if ((form as any).altText) {
      fd.append('altText', String((form as any).altText as string));
    }
    if (Array.isArray(form.tags)) form.tags.forEach((t) => fd.append('tags', t));
    if (typeof form.isPublic === 'boolean') fd.append('isPublic', String(form.isPublic));

    const res = await httpClient.post<Media>(`${this.BASE_URL}/upload`, fd, {
      // let http client drop content-type for FormData boundary
      timeout: 60_000,
    });
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to upload');
    return res.data;
  }

  async bulkUpload(files: File[], form: Partial<Media>): Promise<{ uploaded: Media[]; failed: Array<{ originalName: string; error: string }>; }> {
    const fd = new FormData();
    files.forEach((f) => {
      fd.append('files', f);
      // Provide per-file metadata; many backends validate these
      fd.append('originalName', f.name);
      fd.append('originalname', f.name);
      fd.append('fileName', f.name);
      fd.append('size', String(f.size));
      fd.append('fileSize', String(f.size));
      fd.append('mimetype', f.type);
      fd.append('mimeType', f.type);
      fd.append('contentType', f.type);
    });
    if (form.folder) fd.append('folder', String(form.folder));
    const titleAny2: any = (form as any).title;
    const descAny2: any = (form as any).description;
    const altAny2: any = (form as any).altText;
    if (titleAny2 && typeof titleAny2 === 'object') {
      if (titleAny2.en) fd.append('titleEn', String(titleAny2.en));
      if (titleAny2.ne) fd.append('titleNe', String(titleAny2.ne));
      if (titleAny2.en || titleAny2.ne) fd.append('title', String(titleAny2.en || titleAny2.ne));
    } else if ((form as any).title) {
      fd.append('title', String((form as any).title as string));
    }
    if (descAny2 && typeof descAny2 === 'object') {
      if (descAny2.en) fd.append('descriptionEn', String(descAny2.en));
      if (descAny2.ne) fd.append('descriptionNe', String(descAny2.ne));
      if (descAny2.en || descAny2.ne) fd.append('description', String(descAny2.en || descAny2.ne));
    } else if ((form as any).description) {
      fd.append('description', String((form as any).description as string));
    }
    if (altAny2 && typeof altAny2 === 'object') {
      if (altAny2.en) fd.append('altTextEn', String(altAny2.en));
      if (altAny2.ne) fd.append('altTextNe', String(altAny2.ne));
      if (altAny2.en || altAny2.ne) fd.append('altText', String(altAny2.en || altAny2.ne));
    } else if ((form as any).altText) {
      fd.append('altText', String((form as any).altText as string));
    }
    if (Array.isArray(form.tags)) form.tags.forEach((t) => fd.append('tags', t));
    if (typeof form.isPublic === 'boolean') fd.append('isPublic', String(form.isPublic));

    const res = await httpClient.post<{
      uploaded: Media[];
      failed: Array<{ originalName: string; error: string }>;
    }>(`${this.BASE_URL}/bulk-upload`, fd, { timeout: 60_000 });
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to bulk upload');
    return res.data;
  }

  async update(id: string, data: Partial<Media>): Promise<Media> {
    // Send nested translatable objects to match backend contract and avoid stale overwrites
    const payload: any = { ...data };

    const normalizeTranslatable = (val: any) => {
      if (val && typeof val === 'object') {
        return {
          en: (val.en ?? '').toString(),
          ne: (val.ne ?? '').toString(),
        };
      }
      return val;
    };

    if ('title' in payload) payload.title = normalizeTranslatable(payload.title);
    if ('description' in payload) payload.description = normalizeTranslatable(payload.description);
    if ('altText' in payload) payload.altText = normalizeTranslatable(payload.altText);

    // Ensure no flat alias keys sneak in that could confuse backend
    delete payload.titleEn;
    delete payload.titleNe;
    delete payload.descriptionEn;
    delete payload.descriptionNe;
    delete payload.altTextEn;
    delete payload.altTextNe;

    const res = await httpClient.put<Media>(`${this.BASE_URL}/${id}`, payload);
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to update media');
    return res.data;
  }

  async replaceFile(id: string, file: File, form: Partial<Media> = {}): Promise<Media> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('originalName', file.name);
    fd.append('size', String(file.size));
    fd.append('mimetype', file.type);
    if (form.folder) fd.append('folder', String(form.folder));
    if (form.title) fd.append('title', String(form.title));
    if (form.description) fd.append('description', String(form.description));
    if (form.altText) fd.append('altText', String(form.altText));
    if (Array.isArray(form.tags)) form.tags.forEach((t) => fd.append('tags', t));
    if (typeof form.isPublic === 'boolean') fd.append('isPublic', String(form.isPublic));

    const res = await httpClient.put<Media>(`${this.BASE_URL}/${id}/file`, fd, { timeout: 60_000 });
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to replace media file');
    return res.data;
  }

  async delete(id: string): Promise<void> {
    const res = await httpClient.delete(`${this.BASE_URL}/${id}`);
    if (!res.success) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to delete media');
  }

  async bulkDelete(ids: string[]): Promise<{ success: boolean; processed: number; succeeded: number; failed: number }> {
    const res = await httpClient.post<{ success: boolean; processed: number; succeeded: number; failed: number }>(`${this.BASE_URL}/bulk-delete`, { ids });
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to bulk delete');
    return res.data;
  }

  async getLibrary(): Promise<MediaLibrarySummary> {
    const res = await httpClient.get<MediaLibrarySummary>(`${this.BASE_URL}/library`);
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to load library');
    return res.data;
  }

  async getStatistics(): Promise<MediaStatistics> {
    const res = await httpClient.get<MediaStatistics>(`${this.BASE_URL}/statistics`);
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to load statistics');
    return res.data;
  }

  async getPresignedUrl(id: string, expiresIn?: number): Promise<PresignedUrlResponse> {
    const res = await httpClient.get<PresignedUrlResponse>(`${this.BASE_URL}/${id}/presigned-url`, { params: expiresIn ? { expiresIn } : undefined });
    if (!res.success || !res.data) throw new Error(this.normalizeErrorMessage(res.error?.message) || 'Failed to get presigned URL');
    return res.data;
  }
}

export const mediaRepository: MediaRepository = new MediaRepositoryImpl();


