"use client";

import {
  Document,
  DocumentPdf,
  Download,
  Image,
  Radio,
  Video,
  View
} from "@carbon/icons-react";
import { Button, Tag, Tooltip } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { ContentAttachment } from "../../types/attachment";

interface AttachmentPreviewProps {
  attachment: ContentAttachment;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  showActions?: boolean;
  onDownload?: () => void;
  onPreview?: () => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  className = "",
  onError,
  onLoad,
  showActions = true,
  onDownload,
  onPreview,
}) => {
  const t = useTranslations("content-management");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Use presigned URL from attachment data if available, otherwise fallback to download URL
  const effectiveUrl = attachment.presignedUrl || attachment.downloadUrl;
  const isTablePreview = className.includes('table-preview');

  // Function to get file type category and icon
  const getFileTypeInfo = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return { 
        category: 'image', 
        icon: Image, 
        color: 'blue' as const,
        label: 'Image'
      };
    } else if (mimeType.startsWith('video/')) {
      return { 
        category: 'video', 
        icon: Video, 
        color: 'purple' as const,
        label: 'Video'
      };
    } else if (mimeType.startsWith('audio/')) {
      return { 
        category: 'audio', 
        icon: Radio, 
        color: 'green' as const,
        label: 'Audio'
      };
    } else if (mimeType === 'application/pdf') {
      return { 
        category: 'pdf', 
        icon: DocumentPdf, 
        color: 'red' as const,
        label: 'PDF'
      };
    } else if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword') || mimeType.includes('docx')) {
      return { 
        category: 'document', 
        icon: Document, 
        color: 'blue' as const,
        label: 'Document'
      };
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('xlsx') || mimeType.includes('csv')) {
      return { 
        category: 'spreadsheet', 
        icon: Document, 
        color: 'green' as const,
        label: 'Spreadsheet'
      };
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('pptx')) {
      return { 
        category: 'presentation', 
        icon: Document, 
        color: 'teal' as const,
        label: 'Presentation'
      };
    } else if (mimeType.startsWith('text/')) {
      return { 
        category: 'text', 
        icon: Document, 
        color: 'gray' as const,
        label: 'Text'
      };
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar') || mimeType.includes('gz')) {
      return { 
        category: 'archive', 
        icon: Document, 
        color: 'warm-gray' as const,
        label: 'Archive'
      };
    } else {
      return { 
        category: 'file', 
        icon: Document, 
        color: 'gray' as const,
        label: 'File'
      };
    }
  };

  const fileTypeInfo = getFileTypeInfo(attachment.mimeType);
  const FileIcon = fileTypeInfo.icon;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageError = () => {
    setImageLoadError(true);
    setHasError(true);
    onError?.(new Error('Failed to load image'));
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
    onLoad?.();
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else if (effectiveUrl) {
      window.open(effectiveUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (effectiveUrl) {
      window.open(effectiveUrl, '_blank');
    }
  };

  // Render table preview (compact version)
  const renderTablePreview = () => {
    // For PDFs and other viewable files, make them clickable for preview
    const isPreviewable = fileTypeInfo.category === 'pdf' || fileTypeInfo.category === 'image';
    
    return (
      <Tooltip label={`${attachment.fileName} (${fileTypeInfo.label})`}>
        <div 
          className={`table-icon-preview ${isPreviewable ? 'clickable' : ''}`} 
          data-type={fileTypeInfo.category}
          onClick={isPreviewable ? handlePreview : undefined}
        >
          <div className="table-icon-container">
            <FileIcon size={28} className="table-file-icon" />
          </div>
          {isPreviewable && (
            <div className="table-preview-overlay">
              <View size={16} />
            </div>
          )}
          <div className="table-file-type-badge" data-type={fileTypeInfo.category}>
            {fileTypeInfo.label}
          </div>
        </div>
      </Tooltip>
    );
  };

  // Render full preview (non-table version)
  const renderFullPreview = () => {
    // For all files (including images), show detailed file info with icon
    return (
      <div className="full-file-preview">
        <div className="file-icon-container">
          <FileIcon size={64} className="large-file-icon" />
        </div>
        <div className="file-details">
          <h4 className="file-title">{attachment.fileName}</h4>
          <div className="file-meta">
            <span className="file-size">{formatFileSize(attachment.fileSize)}</span>
            <Tag type={fileTypeInfo.color} size="sm" className="file-type-tag">
              {fileTypeInfo.label}
            </Tag>
          </div>
          {attachment.altText && (
            <p className="file-alt-text">{attachment.altText}</p>
          )}
          {attachment.description && (
            <p className="file-description">{attachment.description}</p>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading && !isTablePreview) {
    return (
      <div className={`attachment-preview loading ${className}`}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">
            {t("attachments.preview.loading", { default: "Loading preview..." })}
          </p>
        </div>
      </div>
    );
  }

  // Error state (non-table)
  if (hasError && !isTablePreview) {
    return (
      <div className={`attachment-preview error ${className}`}>
        <div className="error-content">
          <FileIcon size={32} className="error-icon" />
          <p className="error-text">
            {t("attachments.preview.error", { default: "Preview not available" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`attachment-preview ${className}`}>
      {isTablePreview ? renderTablePreview() : renderFullPreview()}
      
      {showActions && !isTablePreview && (
        <div className="preview-actions">
          {(fileTypeInfo.category === 'image' || fileTypeInfo.category === 'pdf') && effectiveUrl && (
            <Tooltip label={fileTypeInfo.category === 'pdf' ? t("attachments.preview.viewPdf", { default: "View PDF" }) : t("attachments.preview.view", { default: "View image" })}>
              <Button
                kind="secondary"
                size="sm"
                renderIcon={View}
                hasIconOnly
                onClick={handlePreview}
                disabled={isLoading}
              />
            </Tooltip>
          )}
          
          <Tooltip label={t("attachments.preview.download", { default: "Download file" })}>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Download}
              hasIconOnly
              onClick={handleDownload}
              disabled={isLoading}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
