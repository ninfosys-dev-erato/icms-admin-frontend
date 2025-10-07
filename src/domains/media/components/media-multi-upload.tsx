"use client";

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Tile, Stack, InlineLoading } from '@carbon/react';
import { TrashCan, Image as ImageIcon, Add } from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { MediaFilePreview } from './media-file-preview';

export interface MediaMultiUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isUploading?: boolean;
  disabled?: boolean;
  accept?: string;
}

const MAX_FILES = 24;

export const MediaMultiUpload: React.FC<MediaMultiUploadProps> = ({ files, onFilesChange, isUploading = false, disabled = false, accept = 'image/*,video/*,audio/*,application/pdf' }) => {
  const t = useTranslations('media');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleAddFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const next = [...files, ...incoming].slice(0, MAX_FILES);
    onFilesChange(next);
  }, [files, onFilesChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleAddFiles(e.target.files);
    if (e.target) e.target.value = '';
  }, [handleAddFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleAddFiles(e.dataTransfer.files);
  }, [handleAddFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); }, []);

  const removeAt = useCallback((index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    onFilesChange(next);
  }, [files, onFilesChange]);

  return (
    <div className="media-multi-upload">
      {/* Dropzone */}
      <Tile className={`upload-area ${dragOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <Stack gap={4} className="upload-content">
          {isUploading && files.length === 0 ? (
            <div className="upload-loading">
              <InlineLoading description={t('image.upload.uploading', { default: 'Uploading…' } as any)} />
            </div>
          ) : (
            <>
              <ImageIcon size={32} className="upload-icon" />
              <p className="m--0 text--small">{t('form.files') as any}</p>
              <p className="m--0 text--xsmall text--muted">{t('form.validation.fileRequired', { default: 'Drag files here or choose files' } as any)}</p>
              <input ref={inputRef} type="file" multiple accept={accept} onChange={handleInputChange} disabled={disabled || isUploading} className="file-input" id="media-multi-input" />
              <Button kind="secondary" disabled={disabled || isUploading} type="button" size="sm" onClick={() => inputRef.current?.click()} renderIcon={Add}>
                {t('actions.chooseFiles', { default: 'Choose files' } as any)}
              </Button>
            </>
          )}
        </Stack>
      </Tile>

      {/* Selected files grid */}
      {files.length > 0 && (
        <div className="m--mt-1">
          <div className="media-upload-grid">
            {files.map((f, idx) => (
              <div key={`${f.name}-${idx}`} className="media-upload-card">
                <div className="media-upload-card__preview">
                  <MediaFilePreview file={f} />
                </div>
                <div className="media-upload-card__content">
                  <div className="media-upload-card__title" title={f.name}>{f.name}</div>
                  <div className="media-upload-card__meta">{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                <div className="media-upload-card__actions">
                  <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={() => removeAt(idx)}>
                    {t('actions.remove', { default: 'Remove' } as any)}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaMultiUpload;


