"use client";

import { Document, DocumentPdf, Download, Image, Radio, TrashCan, Upload, Video } from "@carbon/icons-react";
import { Button, FormGroup, InlineLoading, Stack, TextArea, TextInput, Tile } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { useCreateAttachment } from "../../hooks/use-attachment-queries";
import { AttachmentNotificationService } from "../../services/attachment-notification-service";
import { AttachmentService } from "../../services/attachment-service";
import { useAttachmentStore } from "../../stores/attachment-store";

interface AttachmentUploadProps {
  className?: string;
}

// Helper function to format file name to show first 8 characters + extension
const formatFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
  
  if (nameWithoutExt.length <= 8) {
    return fileName;
  }
  
  return `${nameWithoutExt.substring(0, 8)}.....${extension}`;
};

// Helper component to show file type icons instead of previews
const AttachmentFilePreview: React.FC<{ file: File }> = ({ file }) => {
  const getFileIcon = (mimeType: string) => {
    if (/^image\//i.test(mimeType)) {
      return <Image size={32} className="file-icon file-icon-image" />;
    }
    
    if (mimeType === 'application/pdf') {
      return <DocumentPdf size={32} className="file-icon file-icon-pdf" />;
    }
    
    if (/^video\//i.test(mimeType)) {
      return <Video size={32} className="file-icon file-icon-video" />;
    }
    
    if (/^audio\//i.test(mimeType)) {
      return <Radio size={32} className="file-icon file-icon-audio" />;
    }
    
    return <Document size={32} className="file-icon file-icon-default" />;
  };

  return (
    <div className="file-preview">
      {getFileIcon(file.type)}
    </div>
  );
};

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  className = "",
}) => {
  const t = useTranslations("content-management");
  const { 
    selectedContentId, 
    closePanel, 
    isUploading, 
    setUploading,
    formData,
    updateFormField,
    setSelectedFiles: setStoreSelectedFiles,
    resetForm
  } = useAttachmentStore();
  const createAttachmentMutation = useCreateAttachment();
  
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        validateAndSetFiles(files);
      }
    },
    []
  );

  const validateAndSetFiles = (files: File[]) => {
    const errors: Record<string, string> = {};
    const validFiles: File[] = [];

    files.forEach((file, index) => {
      const validation = AttachmentService.validateFile(file);
      if (!validation.isValid) {
        errors[`file-${index}`] = validation.error || "Invalid file";
      } else {
        validFiles.push(file);
      }
    });

    setValidationErrors(errors);
    setSelectedFiles(validFiles);
    setStoreSelectedFiles(validFiles);
  };

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

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        validateAndSetFiles(files);
      }
    },
    []
  );

  const handleRemoveFile = useCallback((index: number) => {
    const removedFile = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Clear validation error for this file
    const newErrors = { ...validationErrors };
    delete newErrors[`file-${index}`];
    setValidationErrors(newErrors);
    // Update store
    setStoreSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  }, [validationErrors, selectedFiles, setStoreSelectedFiles]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !selectedContentId) return;
    
    setUploading(true);
    
    try {
      // Upload each file
      for (const file of selectedFiles) {
        await createAttachmentMutation.mutateAsync({
          data: {
            contentId: selectedContentId,
            fileName: file.name,
            filePath: '', // This will be set by the backend
            fileSize: file.size,
            mimeType: file.type,
            altText: formData.altText,
            description: formData.description,
            order: formData.order,
          },
          file,
        });
      }
      
      if (selectedFiles.length === 1 && selectedFiles[0]) {
        AttachmentNotificationService.showAttachmentUploaded(selectedFiles[0].name);
      } else if (selectedFiles.length > 1) {
        AttachmentNotificationService.showMultipleAttachmentsUploaded(selectedFiles.length);
      }
      
      resetForm();
      setSelectedFiles([]);
      setValidationErrors({});
      closePanel();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      if (selectedFiles.length === 1 && selectedFiles[0]) {
        AttachmentNotificationService.showAttachmentUploadError(errorMessage, selectedFiles[0].name);
      } else {
        AttachmentNotificationService.showAttachmentUploadError(errorMessage);
      }
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, selectedContentId, formData, createAttachmentMutation, setUploading, resetForm, closePanel]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const canUpload = selectedFiles.length > 0 && !hasValidationErrors && !isUploading;

  return (
    <div className={`attachment-upload media-multi-upload ${className}`}>
      {/* Header */}
      <div className="upload-header">
        <h3>{t('attachments.upload.title', { default: 'Upload Files' })}</h3>
      </div>

      {/* File Upload Area */}
      <FormGroup legendText={t('attachments.upload.files', { default: 'File(s)' })}>
        <Tile
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Stack gap={4} className="upload-content">
            {isUploading ? (
              <div className="upload-loading">
                <InlineLoading description={t("attachments.upload.uploading", { default: "Uploading files..." })} />
              </div>
            ) : (
              <>
                <Document size={32} className="upload-icon" />
                <p className="upload-placeholder">{t("attachments.upload.placeholder", { default: "File(s)" })}</p>
                <p className="upload-supported">{t("attachments.upload.supported", { default: "Please select at least one file" })}</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.xml,.json,.zip,.rar,.7z,.tar,.gz"
                  onChange={handleFileUpload}
                  className="attachment-file-input"
                  id="attachment-file-input"
                />
                <Button
                  kind="secondary"
                  disabled={isUploading}
                  type="button"
                  size="sm"
                  onClick={() => document.getElementById("attachment-file-input")?.click()}
                >
                  {t("attachments.upload.browse", { default: "Choose files" })}
                </Button>
              </>
            )}
          </Stack>
        </Tile>
      </FormGroup>

      {/* Validation Errors */}
      {hasValidationErrors && (
        <div className="validation-errors">
          {Object.entries(validationErrors).map(([key, error]) => (
            <div key={key} className="validation-error">
              <p className="error-message">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="selected-files-wrapper">
          <div className="selected-files-grid">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file-card">
                {/* Icon Section - Takes most space */}
                <div className="selected-file-icon-section">
                  <AttachmentFilePreview file={file} />
                </div>
                
                {/* File Name Section */}
                <div className="selected-file-name-section">
                  <div className="selected-file-name" title={file.name}>
                    {formatFileName(file.name)}
                  </div>
                  <div className="selected-file-size">
                    {AttachmentService.formatFileSize(file.size)}
                  </div>
                </div>
                
                {/* Action Buttons Section */}
                <div className="selected-file-actions">
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Download}
                    // iconDescription="Download"
                    hasIconOnly
                    disabled={isUploading}
                    onClick={() => {
                      // Create temporary download link
                      const url = URL.createObjectURL(file);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  />
                  <Button
                    kind="danger--ghost"
                    size="sm"
                    renderIcon={TrashCan}
                    iconDescription="Delete"
                    hasIconOnly
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Fields */}
      {selectedFiles.length > 0 && (
        <FormGroup legendText={t("attachments.upload.metadata", { default: "File Metadata" })}>
          <div className="metadata-field">
            <TextInput
              id="alt-text"
              labelText={t("attachments.upload.altText", { default: "Alt Text" })}
              value={formData.altText}
              onChange={(e) => updateFormField('altText', e.target.value)}
              placeholder={t("attachments.upload.altTextPlaceholder", { default: "Alternative text for accessibility" })}
              disabled={isUploading}
            />
          </div>
          <div className="metadata-textarea">
            <TextArea
              id="description"
              labelText={t("attachments.upload.description", { default: "Description" })}
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder={t("attachments.upload.descriptionPlaceholder", { default: "Optional description of the file" })}
              disabled={isUploading}
              rows={3}
            />
          </div>
        </FormGroup>
      )}

      {/* Upload Actions */}
      {canUpload && (
        <div className="upload-actions">
          <Button
            kind="primary"
            renderIcon={Upload}
            onClick={handleUpload}
            disabled={isUploading}
            size="lg"
          >
            {t("attachments.upload.upload", { default: "Upload Files" })}
          </Button>
        </div>
      )}
    </div>
  );
};
