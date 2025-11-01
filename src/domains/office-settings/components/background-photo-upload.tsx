

"use client";

import React, { useCallback, useState } from "react";
import { Button, Tile } from "@carbon/react";
import { TrashCan, Image } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { MediaService } from "@/services/media-service";
import { BackgroundPhotoPreview } from "./background-photo-preview";

interface BackgroundPhotoUploadProps {
  currentPhoto?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  disabled?: boolean;
}

interface ValidationError {
  message: string;
}

export const BackgroundPhotoUpload: React.FC<BackgroundPhotoUploadProps> = ({
  currentPhoto,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
}) => {
  const t = useTranslations("office-settings");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate the file before uploading
        const validation = MediaService.validateImageFile(file);
        if (!validation.isValid) {
          setValidationError({ message: validation.error || "Invalid file" });
          return;
        }

        setValidationError(null);
        onUpload(file);
      }

      // (Keeps UX snappy if user selects the same file again later)
      // Note: This doesn't change behavior—only ensures onChange fires for same file name.
      event.target.value = "";
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
          const validation = MediaService.validateImageFile(file);
          if (!validation.isValid) {
            setValidationError({ message: validation.error || "Invalid file" });
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
    <div className="background-photo-upload">
      <h3 className="font-dynamic">{t("backgroundPhoto.title")}</h3>
      <p className="font-dynamic text-secondary">
        {t("backgroundPhoto.subtitle")}
      </p>

      {/* Validation Error Display */}
      {validationError && (
        <div className="validation-error">
          <p className="error-message">{validationError.message}</p>
        </div>
      )}

      {currentPhoto ? (
        <div className="current-photo-section">
          <h4 className="font-dynamic">{t("backgroundPhoto.preview.title")}</h4>
          <div className="photo-preview">
            <BackgroundPhotoPreview
              directUrl={currentPhoto}
              alt="Office background photo preview"
              /* Use a dedicated wrapper class so we don't accidentally apply
                 the image-specific `.preview-image` styles to the outer
                 container (which caused the layout/overflow issues). */
              className="preview-wrapper"
            />
            <Button
              kind="danger"
              renderIcon={TrashCan}
              onClick={onRemove}
              disabled={disabled || isUploading}
              className="remove-button"
            >
              {t("backgroundPhoto.preview.remove")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="upload-section">
          <Tile
            className={`upload-area ${dragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Image size={48} className="upload-icon" />
              <p className="font-dynamic">
                {t("backgroundPhoto.upload.placeholder")}
              </p>
              <p className="font-dynamic text-small">
                {t("backgroundPhoto.upload.requirements")}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={disabled || isUploading}
                className="file-input"
                id="background-photo-input"
              />
              {/* Removed label's onClick to prevent double file dialog */}
              <label htmlFor="background-photo-input" className="upload-button">
                <Button
                  kind="secondary"
                  disabled={disabled || isUploading}
                  type="button"
                  onClick={() =>
                    document.getElementById("background-photo-input")?.click()
                  }
                >
                  {t("backgroundPhoto.upload.button")}
                </Button>
              </label>
            </div>
          </Tile>
        </div>
      )}

      {isUploading && (
        <div className="upload-status">
          <p className="font-dynamic">Uploading...</p>
        </div>
      )}
    </div>
  );
};
