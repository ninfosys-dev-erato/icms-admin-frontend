export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error' | 'canceled';

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number; // 0-100
  response?: any;
  error?: any;
}

export interface UseUploadOptions {
  endpoint?: string; // fallback endpoint for direct FormData uploads
  headers?: Record<string, string>;
  concurrency?: number;
}

export interface UseUploadReturn {
  uploads: UploadItem[];
  uploadFiles: (files: File[]) => void;
  cancelUpload: (id: string) => void;
  removeUpload: (id: string) => void;
}
