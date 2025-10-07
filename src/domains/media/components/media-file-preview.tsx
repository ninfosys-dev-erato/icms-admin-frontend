"use client";

import React, { useEffect, useState } from 'react';
import { Document, Music, Video } from '@carbon/icons-react';

interface MediaFilePreviewProps {
  file: File;
  className?: string;
}

const isImage = (type: string) => /^image\//.test(type);
const isVideo = (type: string) => /^video\//.test(type);
const isAudio = (type: string) => /^audio\//.test(type);

export const MediaFilePreview: React.FC<MediaFilePreviewProps> = ({ file, className = '' }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // If it's an image and the browser can create object URLs, use that (fast)
    if (isImage(file.type)) {
      try {
        const url = URL.createObjectURL(file);
        setSrc(url);
        return () => {
          // revoke when unmounting or file changes
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        // fallthrough to FileReader below
      }
    }

    // Some dragged files may not include a MIME type; if filename suggests an image, use FileReader fallback
    const likelyImage = /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
    if (likelyImage || isImage(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        if (!cancelled) setSrc(String(reader.result));
      };
      reader.readAsDataURL(file);
      return () => {
        cancelled = true;
        try { reader.abort(); } catch {};
      };
    }

    // nothing to preview
    return undefined;
  }, [file]);

  if (src) {
    return (
      <div className={`media-file-preview ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={file.name} className="media-file-preview__image" />
      </div>
    );
  }

  // Non-image placeholder
  const Icon = isVideo(file.type) ? Video : isAudio(file.type) ? Music : Document;
  return (
    <div className={`media-file-preview media-file-preview--placeholder ${className}`}>
      <Icon size={24} />
      <span className="media-file-preview__filename">{file.name}</span>
    </div>
  );
};

export default MediaFilePreview;


