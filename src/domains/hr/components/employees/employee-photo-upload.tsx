"use client";

import React, { useCallback, useState } from "react";
import { Button, Tile, Stack, InlineLoading } from "@carbon/react";
import { TrashCan, Image } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { EmployeePhotoPreview } from "./employee-photo-preview";

interface EmployeePhotoUploadProps {
  currentImage?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  showHeader?: boolean;
  /** When false, hides any UI that allows removing the current image */
  allowRemove?: boolean;
}

interface ValidationError {
  message: string;
}

// Employee-specific file validation
const validateEmployeePhotoFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB for employee photos (as per backend)

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "JPEG, PNG, WebP, or GIF only.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size exceeds 10MB limit.",
    };
  }

  return { isValid: true };
};

export const EmployeePhotoUpload: React.FC<EmployeePhotoUploadProps> = ({
  currentImage,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  showPreview = true,
  showHeader = false,
  allowRemove = true,
}) => {
  const t = useTranslations("hr-employees");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate the file before uploading
        const validation = validateEmployeePhotoFile(file);
        if (!validation.isValid) {
          setValidationError({ message: validation.error || "Invalid" });
          return;
        }

        setValidationError(null);
        onUpload(file);
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
        if (file) {
          // Validate the file before uploading
          const validation = validateEmployeePhotoFile(file);
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

  return (
    <div className="employee-photo-upload">
      {showHeader && (
        <Stack gap={3}>
          <h3 className="employee-photo-upload-title">
            {t("form.photo.label")}
          </h3>
          <p className="employee-photo-upload-subtitle text-secondary">
            {t("form.photo.subtitle")}
          </p>
        </Stack>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <div className="validation-error">
          <p className="error-message">{validationError.message}</p>
        </div>
      )}

      {currentImage && showPreview ? (
        <Stack gap={4} className="employee-photo-upload-preview-stack">
          <EmployeePhotoPreview
            directUrl={currentImage}
            alt="Employee photo preview"
            className="preview-image"
          />
          {allowRemove && (
            <Button
              kind="danger"
              renderIcon={TrashCan}
              onClick={onRemove}
              disabled={disabled || isUploading}
              size="sm"
              className="employee-photo-upload-remove-btn"
            >
              {t("form.photo.remove")}
            </Button>
          )}
        </Stack>
      ) : (
        <Tile
          className={`upload-area${dragOver ? " drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Stack gap={4} className="upload-content">
            {isUploading && !currentImage ? (
              <div className="upload-loading">
                <InlineLoading description={t("form.photo.uploading")} />
              </div>
            ) : (
              <>
                <Image size={32} className="upload-icon" />
                <p className="employee-photo-upload-placeholder">
                  {t("form.photo.placeholder")}
                </p>
                <p className="employee-photo-upload-types">
                  JPEG, PNG, WebP, GIF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={disabled || isUploading}
                  className="file-input"
                  id="employee-photo-input"
                />
                <Button
                  kind="secondary"
                  disabled={disabled || isUploading}
                  type="button"
                  size="sm"
                  className="employee-photo-upload-btn"
                  onClick={() =>
                    document.getElementById("employee-photo-input")?.click()
                  }
                >
                  {t("form.photo.uploadButton")}
                </Button>
              </>
            )}
          </Stack>
        </Tile>
      )}

      {/* Upload Status with Spinner - only show when there's no current image */}
      {isUploading && !currentImage && (
        <div className="upload-status">
          <Stack gap={2} className="upload-status-content">
            <InlineLoading description={t("form.photo.uploading")} />
          </Stack>
        </div>
      )}
    </div>
  );
};
