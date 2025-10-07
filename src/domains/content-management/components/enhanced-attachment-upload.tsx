"use client";

import { Document as DocumentIcon, TrashCan } from "@carbon/icons-react";
import { Button, InlineLoading, InlineNotification, Stack, Tile } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { AttachmentService } from "../services/attachment-service";
import "../styles/content-management.css";

interface EnhancedAttachmentUploadProps {
  currentFile?: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  showHeader?: boolean;
  allowRemove?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface ValidationError {
  message: string;
}

export const EnhancedAttachmentUpload: React.FC<EnhancedAttachmentUploadProps> = ({
  currentFile,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  showPreview = true,
  showHeader = false,
  allowRemove = true,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = [
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Archives
    '.zip', '.rar', '.7z',
    // Audio
    '.mp3', '.wav', '.ogg', '.mp4',
    // Video
    '.mp4', '.avi', '.mov', '.wmv', '.flv'
  ],
}) => {
  const t = useTranslations("content-management.attachments");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  // File validation using AttachmentService
  const validateFile = (file: File): boolean => {
    const validation = AttachmentService.validateFile(file);
    if (!validation.isValid) {
      setValidationError({ message: validation.error || 'Invalid file' });
      return false;
    }
    
    // Additional size validation
    if (maxFileSize && file.size > maxFileSize) {
      setValidationError({ 
        message: `File size exceeds maximum limit of ${AttachmentService.formatFileSize(maxFileSize)}.` 
      });
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (validateFile(file)) {
          onUpload(file);
        }
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file && validateFile(file)) {
          onUpload(file);
        }
      }
    },
    [onUpload]
  );

  const getFileIcon = (fileType: string) => {
    return AttachmentService.getFileIcon(fileType);
  };

  const getFileTypeLabel = (fileType: string) => {
    return AttachmentService.getFileTypeLabel(fileType);
  };

  return (
    <div className="enhanced-attachment-upload">
      {showHeader && (
        <Stack gap={3}>
          <h3>{t("upload.title", { default: "Upload Attachment" })}</h3>
          <p className="text-secondary">
            {t("upload.subtitle", { default: "Drag and drop files or click to browse" })}
          </p>
        </Stack>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <div className="validation-error">
          <InlineNotification
            kind="error"
            title={t("upload.validationError", { default: "File Validation Error" })}
            subtitle={validationError.message}
            hideCloseButton
            className="notification-mb-1"
          />
        </div>
      )}

      {currentFile && showPreview ? (
        <Stack gap={4}>
          <div className="file-preview">
            <div className="file-icon">
              {getFileIcon(currentFile.type)}
            </div>
            <div className="file-info">
              <h4 className="file-name">{currentFile.name}</h4>
              <p className="file-type">{getFileTypeLabel(currentFile.type)}</p>
              <p className="file-size">{AttachmentService.formatFileSize(currentFile.size)}</p>
            </div>
            <div className="file-actions">
              {allowRemove && (
                <Button
                  kind="danger"
                  renderIcon={TrashCan}
                  onClick={onRemove}
                  disabled={disabled || isUploading}
                  size="sm"
                >
                  {t("upload.remove", { default: "Remove" })}
                </Button>
              )}
            </div>
          </div>
        </Stack>
      ) : (
        <Tile
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Stack gap={4} className="upload-content">
            {isUploading && !currentFile ? (
              <div className="upload-loading">
                <InlineLoading description={t("upload.uploading", { default: "Uploading..." })} />
              </div>
            ) : (
              <>
                <DocumentIcon size={32} className="upload-icon" />
                <p className="upload-placeholder-small">
                  {t("upload.placeholder", { default: "Drag and drop files here or click to browse" })}
                </p>
                <p className="upload-supported-small">
                  {t("upload.supportedFormats", { 
                    default: "Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, Images, Audio, Video, Archives" 
                  })}
                </p>
                <p className="upload-supported-small">
                  {t("upload.maxSize", { 
                    default: `Maximum file size: ${AttachmentService.formatFileSize(maxFileSize)}` 
                  })}
                </p>
                <input
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileUpload}
                  disabled={disabled || isUploading}
                  className="file-input"
                  id="enhanced-attachment-file-input"
                />
                <Button
                  kind="secondary"
                  disabled={disabled || isUploading}
                  type="button"
                  size="sm"
                  onClick={() =>
                    document.getElementById("enhanced-attachment-file-input")?.click()
                  }
                >
                  {t("upload.button", { default: "Choose File" })}
                </Button>
              </>
            )}
          </Stack>
        </Tile>
      )}

      {/* Upload Status with Spinner - only show when there's no current file */}
      {isUploading && !currentFile && (
        <div className="upload-status">
          <Stack gap={2} className="upload-status-content">
            <InlineLoading description={t("upload.uploading", { default: "Uploading..." })} />
          </Stack>
        </div>
      )}
    </div>
  );
};
