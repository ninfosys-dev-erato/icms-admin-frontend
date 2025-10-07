"use client";

import React, { useCallback, useState } from "react";
import { Button, Tile, Stack, InlineLoading } from "@carbon/react";
import { TrashCan, Image } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { SliderImagePreview } from "./slider-image-preview";

interface SliderImageUploadProps {
  changePhotoButton?: boolean;
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

// Slider-specific file validation
const validateSliderImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB for slider images (as per backend)

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

export const SliderImageUpload: React.FC<SliderImageUploadProps> = ({
  currentImage,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  showPreview = true,
  showHeader = false,
  allowRemove = true,
  changePhotoButton = false,
}) => {
  const t = useTranslations("sliders");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate the file before uploading
        const validation = validateSliderImageFile(file);
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
          const validation = validateSliderImageFile(file);
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
    <div className="slider-image-upload">
      {showHeader && (
        <Stack gap={3}>
          <h3>{t("image.title")}</h3>
          <p className="text-secondary">{t("image.subtitle")}</p>
        </Stack>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <div className="validation-error">
          <p className="error-message">{validationError.message}</p>
        </div>
      )}

      {currentImage && showPreview ? (
        <Stack gap={4}>
          <SliderImagePreview
            directUrl={currentImage}
            alt="Slider image preview"
            className="preview-image"
          />
          {changePhotoButton ? (
            <>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={disabled || isUploading}
                className="file-input"
                id="slider-image-input-change"
                style={{ display: "none" }}
              />
              <Button
                kind="secondary"
                type="button"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() =>
                  document.getElementById("slider-image-input-change")?.click()
                }
              >
                {t("form.image.preview.change")}
              </Button>
            </>
          ) : (
            allowRemove && (
              <Button
                kind="danger"
                renderIcon={TrashCan}
                onClick={onRemove}
                disabled={disabled || isUploading}
                size="sm"
              >
                {t("image.preview.remove")}
              </Button>
            )
          )}
        </Stack>
      ) : (
        <Tile
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Stack gap={4} className="upload-content">
            {isUploading && !currentImage ? (
              <div className="upload-loading">
                <InlineLoading description={t("image.upload.uploading")} />
              </div>
            ) : (
              <>
                <Image size={32} className="upload-icon" />
                <p className="slider-image-upload-placeholder-text">
                  {t("image.upload.placeholder")}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--cds-text-02)",
                  }}
                >
                  JPEG, PNG, WebP, GIF up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={disabled || isUploading}
                  className="file-input"
                  id="slider-image-input"
                />
                <Button
                  kind="secondary"
                  disabled={disabled || isUploading}
                  type="button"
                  size="sm"
                  onClick={() =>
                    document.getElementById("slider-image-input")?.click()
                  }
                >
                  {t("image.upload.button")}
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
            <InlineLoading description={t("image.upload.uploading")} />
          </Stack>
        </div>
      )}
    </div>
  );
};
