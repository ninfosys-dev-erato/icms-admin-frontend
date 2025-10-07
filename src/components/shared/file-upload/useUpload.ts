import { useCallback, useRef, useState } from 'react';
import { UploadItem, UseUploadOptions, UseUploadReturn } from './types';

const genId = (file: File) => `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`;

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const { endpoint = '/api/upload', headers = {}, concurrency = 3 } = options;
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const controllers = useRef<Record<string, AbortController>>({});

  const removeUpload = useCallback((id: string) => {
    setUploads((u) => u.filter((x) => x.id !== id));
    delete controllers.current[id];
  }, []);

  const cancelUpload = useCallback((id: string) => {
    const ctrl = controllers.current[id];
    if (ctrl) {
      ctrl.abort();
      setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'canceled' } : x));
    }
  }, []);

  const startUpload = useCallback(async (item: UploadItem) => {
    const id = item.id;
    const ctrl = new AbortController();
    controllers.current[id] = ctrl;
    setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'uploading', progress: 0 } : x));

    try {
      // Basic FormData POST with fetch and progress via XMLHttpRequest because fetch doesn't support progress easily
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const percent = Math.round((ev.loaded / ev.total) * 100);
            setUploads((u) => u.map((x) => x.id === id ? { ...x, progress: percent } : x));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'done', progress: 100, response: xhr.responseText } : x));
            resolve();
          } else {
            setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'error', error: xhr.responseText } : x));
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'error', error: 'Network error' } : x));
          reject(new Error('Network error'));
        };
        xhr.onabort = () => {
          setUploads((u) => u.map((x) => x.id === id ? { ...x, status: 'canceled' } : x));
          reject(new Error('Aborted'));
        };

        const fd = new FormData();
        fd.append('file', item.file);
        xhr.send(fd);
      });
    } catch (err) {
      // error already set above
    } finally {
      delete controllers.current[id];
    }
  }, [endpoint, headers]);

  const uploadFiles = useCallback((files: File[]) => {
    const items: UploadItem[] = files.map((f) => ({ id: genId(f), file: f, status: 'idle', progress: 0 }));
    setUploads((u) => [...u, ...items]);
    // Start uploads sequentially but respecting concurrency
    items.forEach((it) => void startUpload(it));
  }, [startUpload]);

  return { uploads, uploadFiles, cancelUpload, removeUpload };
}

export default useUpload;
