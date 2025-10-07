"use client";

import React, { useCallback, useState } from "react";
import "../styles/documents.css";
import { Button, Tile, Stack, InlineLoading, Tag } from "@carbon/react";
import { TrashCan, Document as DocumentIcon } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import DocumentService from "../services/document-service";

interface DocumentUploadProps {
  currentFile?: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  showHeader?: boolean;
  /** When false, hides any UI that allows removing the current file */
  allowRemove?: boolean;
}

interface ValidationError {
  message: string;
}

// Document-specific file validation
const validateDocumentFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/rtf",
    "text/csv",
    "application/zip",
    "application/x-rar-compressed",
  ];
  const maxSize = 100 * 1024 * 1024; // 100MB for documents

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        "PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, ZIP, or RAR only.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size exceeds 100MB limit.",
    };
  }

  return { isValid: true };
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  currentFile,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  showPreview = true,
  showHeader = false,
  allowRemove = true,
}) => {
  const t = useTranslations("documents");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = useCallback((incoming: File[]) => {
    if (!incoming || incoming.length === 0) return;
    const file = incoming[0];
    if (!file) return;
    // Validate the file before uploading
    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      setValidationError({ message: validation.error || "Invalid" });
      return;
    }

    setValidationError(null);
    onUpload(file);
  }, [onUpload]);

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
        if (file) {
          // Validate the file before uploading
          const validation = validateDocumentFile(file);
          if (!validation.isValid) {
            setValidationError({ message: validation.error || "Invalid" });
            return;
          }

          setValidationError(null);
          onUpload(file);
        }
      }
    },
    [onUpload]
  );

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return "📽️";
    if (fileType.includes("text")) return "📃";
    if (fileType.includes("csv")) return "📋";
    if (fileType.includes("zip") || fileType.includes("rar")) return "📦";
    return "📎";
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes("pdf")) return "PDF Document";
    if (fileType.includes("word") || fileType.includes("document"))
      return "Word Document";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "Excel Spreadsheet";
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return "PowerPoint Presentation";
    if (fileType.includes("text")) return "Text Document";
    if (fileType.includes("csv")) return "CSV File";
    if (fileType.includes("zip") || fileType.includes("rar"))
      return "Compressed Archive";
    return "Document";
  };

  return (
    <div className="document-upload">
      {showHeader && (
        <Stack gap={3}>
          <h3>{t("upload.title")}</h3>
          <p className="text-secondary">{t("upload.subtitle")}</p>
        </Stack>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <div className="validation-error">
          <p className="error-message">{validationError.message}</p>
        </div>
      )}

      {currentFile && showPreview ? (
        <Stack gap={4}>
          <div className="file-preview">
            <div className="file-icon">{getFileIcon(currentFile.type)}</div>
            <div className="file-info">
              <h4 className="file-name">{currentFile.name}</h4>
              <p className="file-type">{getFileTypeLabel(currentFile.type)}</p>
              <p className="file-size">
                {DocumentService.formatFileSize(currentFile.size)}
              </p>
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
                  {t("upload.remove")}
                </Button>
              )}
            </div>
          </div>
        </Stack>
      ) : (
        <div>
          <Tile className={`upload-area ${dragOver ? "drag-over" : ""}`}>
            {isUploading && !currentFile ? (
              <div className="upload-loading">
                <InlineLoading description={t("upload.uploading")} />
              </div>
            ) : (
              <>
                <DocumentIcon size={32} className="upload-icon" />
                <p className="upload-placeholder-text">
                  {t("upload.placeholder")}
                </p>
                <p className="upload-file-types-text">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, ZIP, RAR
                  up to 100MB
                </p>
                <div className="m--mt-1">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.zip,.rar"
                    onChange={(e) => {
                      const incoming = e.target.files ? Array.from(e.target.files) : [];
                      setFiles(incoming);
                      handleFileUpload(incoming);
                    }}
                    disabled={disabled || isUploading}
                    className="file-input"
                    id="document-file-input"
                  />
                  <Button
                    kind="secondary"
                    disabled={disabled || isUploading}
                    type="button"
                    size="sm"
                    onClick={() => document.getElementById("document-file-input")?.click()}
                  >
                    {t("upload.button")}
                  </Button>
                </div>
              </>
            )}
          </Tile>
        </div>
      )}

      {/* Upload Status with Spinner - only show when there's no current file */}
      {isUploading && !currentFile && (
        <div className="upload-status">
          <Stack gap={2} className="upload-status-content">
            <InlineLoading description={t("upload.uploading")} />
          </Stack>
        </div>
      )}
    </div>
  );
};
