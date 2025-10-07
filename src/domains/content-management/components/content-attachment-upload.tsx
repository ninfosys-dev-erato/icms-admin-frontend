"use client";

import { Document, Download, TrashCan, Upload } from "@carbon/icons-react";
import { Button, InlineLoading, InlineNotification } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { httpClient } from "@/lib/api/http-client";
import { AttachmentService } from "../services/attachment-service";
import "../styles/content-management.css";

interface ContentAttachmentUploadProps {
  attachments: string[];
  onAttachmentsChange: (attachmentIds: string[]) => void;
  className?: string;
  contentId?: string; // when editing existing content, required by backend
}

// Backend API response structure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string | string[];
  };
}

// Parse backend response
const parseApiResponse = (response: any) => {
  if (response?.success && response?.data !== undefined) {
    return response.data;
  }
  throw new Error(response?.error?.message || 'API response parsing failed');
};

export const ContentAttachmentUpload: React.FC<
  ContentAttachmentUploadProps
> = ({ attachments, onAttachmentsChange, className = "", contentId }) => {
  const t = useTranslations("content-management.attachments");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for attachment details retrieved from the backend
  const [attachmentDetails, setAttachmentDetails] = useState<
    Array<{
      id: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      downloadUrl?: string;
    }>
  >([]);

  // Fetch attachment details for a content when editing
  const fetchAttachmentDetails = useCallback(async () => {
    if (!contentId) return;
    try {
      const response = await httpClient.get<ApiResponse<Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        downloadUrl?: string;
      }>>>(`/admin/contents/${contentId}/attachments`);
      
      const data = parseApiResponse(response) as Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        downloadUrl?: string;
      }>;
      
      if (Array.isArray(data)) {
        setAttachmentDetails(data);
      }
    } catch (err) {
      // silent; will still show uploaded IDs as chips if needed
      console.warn("Failed to fetch attachment details", err);
    }
  }, [contentId]);

  useEffect(() => {
    void fetchAttachmentDetails();
  }, [fetchAttachmentDetails]);

  // File validation using AttachmentService
  const validateFile = (file: File): boolean => {
    const validation = AttachmentService.validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setUploadError(null);
      setValidationError(null);

      try {
        const fileArray = Array.from(files);
        if (contentId) {
          // Use attachments endpoint when a content ID exists (supports documents)
          for (const file of fileArray) {
            // Validate file before upload
            if (!validateFile(file)) {
              continue; // Skip invalid files
            }
            
            const form = new FormData();
            form.append("file", file);
            form.append("contentId", contentId);
            const response = await httpClient.post<ApiResponse<{ id: string }>>(
              `/attachments`,
              form,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            
            const data = parseApiResponse(response) as { id: string };
            const newId = data?.id;
            
            if (typeof newId === "string" && !attachments.includes(newId)) {
              onAttachmentsChange([...attachments, newId]);
            }
            // refresh list from backend
            await fetchAttachmentDetails();
          }
        } else {
          // No content ID yet → show guidance
          setUploadError(
            t("createFirst", {
              default:
                "Please save the content first, then upload attachments.",
            })
          );
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [attachments, onAttachmentsChange, contentId, t, fetchAttachmentDetails]
  );

  const handleRemoveAttachment = useCallback(
    async (attachmentId: string) => {
      try {
        await httpClient.delete(`/attachments/${attachmentId}`);
      } catch (err) {
        // ignore; still update form state to keep UI responsive
        console.warn("Failed to delete attachment", err);
      }
      onAttachmentsChange(attachments.filter((id) => id !== attachmentId));
      await fetchAttachmentDetails();
    },
    [attachments, onAttachmentsChange, fetchAttachmentDetails]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileUpload(e.target.files);
      }
    },
    [handleFileUpload]
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "📊";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "📽️";
    if (mimeType.includes("text")) return "📄";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
    return "📎";
  };

  const openDownload = useCallback(async (attachmentId: string) => {
    try {
      const base = httpClient.getCurrentBaseURL();
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth-token")
          : null;
      const resp = await fetch(`${base}/attachments/${attachmentId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!resp.ok) throw new Error(`Download failed (${resp.status})`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Optional: revoke later
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Download failed");
    }
  }, []);

  return (
    <div className={`content-attachment-upload ${className}`}>
      <div className="attachment-section-header">
        <h4>{t("title")}</h4>
        <p className="attachment-subtitle">{t("subtitle")}</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
        onChange={handleFileInputChange}
        className="attachment-file-input"
      />

      {/* Upload Area */}
      <div className="upload-area">
        <div
          className={`upload-drop-zone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload size={32} />
          <p className="drag-drop-text">{t("dragDropText")}</p>
          <p className="supported-formats">{t("supportedFormats")}</p>
          <p className="max-file-size">{t("maxFileSize")}</p>
          <Button
            kind="secondary"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            {t("uploadButton")}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress">
          <InlineLoading description={t("uploading")} status="active" />
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <InlineNotification
          kind="error"
          title={t("validationError")}
          subtitle={validationError}
          hideCloseButton
          className="notification-mt-1"
        />
      )}

      {/* Upload Error */}
      {uploadError && (
        <InlineNotification
          kind="error"
          title={t("uploadError")}
          subtitle={uploadError}
          hideCloseButton
          className="notification-mt-1"
        />
      )}

      {/* Current Attachments */}
      {attachmentDetails.length > 0 && (
        <div className="current-attachments">
          <h5>Current Attachments ({attachmentDetails.length})</h5>
          <div className="attachment-list">
            {attachmentDetails.map((file) => (
              <div key={file.id} className="attachment-item">
                <div className="attachment-info">
                  <span className="file-icon">
                    {AttachmentService.getFileIcon(file.mimeType)}
                  </span>
                  {/* <div className="file-details">
                    <span className="file-name">{file.fileName}</span>
                    <span className="file-size">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </div> */}
                </div>
                <div className="attachment-actions">
                  <Button
                    kind="ghost"
                    size="sm"
                    iconDescription={t("downloadFile")}
                    hasIconOnly
                    onClick={() => openDownload(file.id)}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    kind="ghost"
                    size="sm"
                    iconDescription={t("removeFile")}
                    hasIconOnly
                    onClick={() => handleRemoveAttachment(file.id)}
                  >
                    <TrashCan size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Attachments */}
      {attachmentDetails.length === 0 && !isUploading && (
        <div className="no-attachments">
          <Document size={32} />
          <p>{t("noAttachments")}</p>
        </div>
      )}
    </div>
  );
};
