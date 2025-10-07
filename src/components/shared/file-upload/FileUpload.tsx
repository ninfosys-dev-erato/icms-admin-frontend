import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tile, Button, InlineLoading } from '@carbon/react';
import { TrashCan, Document, Add } from '@carbon/icons-react';
import type { UploadItem } from './types';

export interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string | string[];
  isUploading?: boolean;
  disabled?: boolean;
  className?: string;
  // optional preview renderer for each file (used for media thumbnails)
  renderPreview?: (file: File) => React.ReactNode;
  // labels to match existing attachments uploader translations
  labelTitle?: string;
  labelDescription?: string;
  buttonLabel?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  multiple = false,
  accept,
  isUploading = false,
  disabled = false,
  className,
  renderPreview,
  labelTitle = 'Upload',
  labelDescription = 'Drag and drop files or click to upload',
  buttonLabel,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = e.target.files ? Array.from(e.target.files) : [];
    if (!incoming.length) return;
    onFilesChange([...files, ...incoming]);
    if (e.target) e.target.value = '';
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const incoming = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (!incoming.length) return;
    onFilesChange([...files, ...incoming]);
  }, [files, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); }, []);

  const removeAt = useCallback((index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    onFilesChange(next);
  }, [files, onFilesChange]);

  useEffect(() => {
    return () => {
      // revoke created object URLs if any (caller responsibility if they created them)
    };
  }, []);

  return (
    <div className={className}>
      <Tile className={`file-upload-tile ${dragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <div className="file-uploader-dashed">
          <div className="file-uploader-inner">
            <div className="file-uploader-icon"><Document size={32} /></div>
            <div className="file-uploader-text">
              <div className="file-uploader-title">{labelTitle}</div>
              <div className="file-uploader-desc">{labelDescription}</div>
              <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleChange} multiple={multiple} accept={typeof accept === 'string' ? accept : Array.isArray(accept) ? accept.join(',') : undefined} />
              <div className="file-uploader-cta m--mt-1">
                <Button className="choose-files-button" kind="secondary" onClick={() => inputRef.current?.click()} renderIcon={Add} size="sm">
                  {buttonLabel || 'Choose files'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isUploading && files.length === 0 && (
          <div className="m--mt-1">
            <InlineLoading description="Uploading…" />
          </div>
        )}

        {files.length > 0 && (
          <div className="m--mt-1 shared-file-list media-upload-grid">
            {files.map((f, idx) => (
              <div className="media-upload-card shared-file-list-item" key={`${f.name}-${idx}`}>
                <div className="media-upload-card__preview">
                  {renderPreview ? renderPreview(f) : null}
                </div>
                <div className="media-upload-card__content shared-file-meta">
                  <div className="media-upload-card__title shared-file-name" title={f.name}>{f.name}</div>
                  <div className="media-upload-card__meta shared-file-size">{Math.round(f.size / 1024)} KB</div>
                </div>
                <div className="media-upload-card__actions shared-file-actions">
                  <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={() => removeAt(idx)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tile>
    </div>
  );
};

export default FileUpload;
