

"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Button,
  Tile,
  Stack,
  InlineLoading,
  NumberInput,
} from "@carbon/react";
import { TrashCan, Image } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { LogoItem } from "../types/header";
import { useHeaderWithLogoMedia } from "../hooks/use-header-queries";

interface LogoUploadProps {
  type: "left" | "right";
  currentLogo?: LogoItem;
  onUpload: (file: File, logoData: Partial<LogoItem>) => void;
  onRemove: () => void;
  isUploading?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  headerId?: string;
}

interface ValidationError {
  message: string;
}

const validateLogoFile = (file: File): { isValid: boolean; error?: string } => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
  ];
  if (!allowed.includes(file.type)) {
    return { isValid: false, error: "JPEG, PNG, WebP, SVG, or GIF only." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: "File size exceeds 5MB limit." };
  }
  return { isValid: true };
};

export const LogoUpload: React.FC<LogoUploadProps> = ({
  type,
  currentLogo,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  showPreview = true,
  headerId,
}) => {
  const t = useTranslations("headers");
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);
  const [logoData, setLogoData] = useState<Partial<LogoItem>>({
    altText: { en: "", ne: "" },
    width: 150,
    height: 50,
  });

  // preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);

  // hydrate from existing logo
  useEffect(() => {
    if (currentLogo) {
      setLogoData({
        altText: currentLogo.altText || { en: "", ne: "" },
        width: currentLogo.width || 150,
        height: currentLogo.height || 50,
      });
    } else {
      setLogoData({
        altText: { en: "", ne: "" },
        width: 150,
        height: 50,
      });
    }
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, [currentLogo]);

  // cleanup
  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }
    };
  }, []);

  // fetch media for existing header
  const { data: headerWithMedia } = useHeaderWithLogoMedia(
    headerId || "",
    !!headerId
  );

  // If the local `currentLogo` has been explicitly cleared (undefined) by the user
  // we should not show the server-provided media. This ensures that after a
  // user removes an image the preview is hidden immediately even before server
  // refetch completes.
  // Only use server-provided media if we actually have a currentLogo object
  // (truthy) — treat null/undefined as "no local logo" so preview hides
  // immediately after a user removes the image locally.
  const logoMedia =
    headerId && headerWithMedia?.logo && currentLogo
      ? type === "left"
        ? headerWithMedia.logo.leftLogo?.media
        : headerWithMedia.logo.rightLogo?.media
      : undefined;

  const isLogoDataValid = () =>
    !!(logoData.altText?.en?.trim() || logoData.altText?.ne?.trim());

  // data URL preview (CSP friendly)
  const makePreviewForFile = (file: File) => {
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => {
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const doUploadIfValid = (file: File) => {
    const v = validateLogoFile(file);
    if (!v.isValid) {
      setValidationError({ message: v.error || "Invalid" });
      return;
    }
    // Require alt text is recommended, but allow upload so users can remove an
    // existing image and immediately pick a replacement without typing alt
    // first. We'll show a validation warning to remind them to add alt text.
    if (!isLogoDataValid()) {
      setValidationError({ message: "Recommended: add alt text for accessibility" });
      // do NOT return — allow upload to proceed
    }
    setValidationError(null);
    const payload: Partial<LogoItem> = {
      altText: logoData.altText || { en: "", ne: "" },
      width: logoData.width || 150,
      height: logoData.height || 50,
    };
    onUpload(file, payload);
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      // allow re-select same file
      input.value = "";

      if (!file) return;

      // 1) preview first
      makePreviewForFile(file);
      // 2) then validate + upload
      doUploadIfValid(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUpload, logoData]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      makePreviewForFile(file);
      doUploadIfValid(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUpload, logoData]
  );

  const handleLogoDataChange = (field: keyof LogoItem, value: unknown) => {
    setLogoData((prev) => ({ ...prev, [field]: value }));
  };

  // show preview if we have a freshly-picked file OR existing server image OR currentLogo
  const hasSomethingToShow =
    !!previewUrl ||
    (!!showPreview &&
      !!(logoMedia?.presignedUrl || logoMedia?.url || currentLogo));

  return (
    <div className="logo-upload">
      <h4>
        {type === "left"
          ? t("form.logo.leftLogo") || "Left Logo"
          : t("form.logo.rightLogo") || "Right Logo"}
      </h4>

      {/* Config */}
      <Stack gap={4} style={{ marginBottom: "1rem" }}>
        <TranslatableField
          label={t("form.logo.altText") || "Alt Text"}
          value={logoData.altText || { en: "", ne: "" }}
          onChange={(value) => handleLogoDataChange("altText", value)}
          placeholder={{
            en:
              (t as any)("form.logo.altTextPlaceholder.en") ||
              "Logo description in English",
            ne:
              (t as any)("form.logo.altTextPlaceholder.ne") ||
              "Logo description in Nepali",
          }}
          required
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <NumberInput
            id={`${type}LogoWidth`}
            label={t("form.logo.width") || "Width"}
            value={logoData.width || 150}
            onChange={(event, { value }) => {
              if (value !== undefined && typeof value === "number") {
                handleLogoDataChange("width", value);
              }
            }}
            min={10}
            max={500}
            step={1}
          />

          <NumberInput
            id={`${type}LogoHeight`}
            label={t("form.logo.height") || "Height"}
            value={logoData.height || 50}
            onChange={(event, { value }) => {
              if (value !== undefined && typeof value === "number") {
                handleLogoDataChange("height", value);
              }
            }}
            min={10}
            max={500}
            step={1}
          />
        </div>
      </Stack>

      {/* Steps */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          backgroundColor: "var(--cds-ui-02)",
          border: "1px solid " + "var(--cds-ui-03)",
          borderRadius: "0",
          fontSize: "0.875rem",
        }}
      >
        <strong>Step 1:</strong> Fill in the alt text and dimensions above
        <br />
        <strong>Step 2:</strong> Upload your logo file below
      </div>

      {validationError && (
        <div className="validation-error">
          <p className="error-message">{validationError.message}</p>
        </div>
      )}

      {hasSomethingToShow ? (
        <Stack gap={4}>
          <div
            style={{
              width: "100%",
              height: "120px",
              backgroundColor: "var(--cds-ui-02)",
              border: "1px solid var(--cds-ui-03)",
              borderRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={
                  currentLogo?.altText?.en ||
                  currentLogo?.altText?.ne ||
                  "Logo"
                }
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : logoMedia?.presignedUrl || logoMedia?.url ? (
              <img
                src={logoMedia.presignedUrl || logoMedia.url}
                alt={
                  currentLogo?.altText?.en ||
                  currentLogo?.altText?.ne ||
                  "Logo"
                }
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Image size={32} />
            )}
          </div>

          <Button
            kind="danger"
            renderIcon={TrashCan}
            onClick={() => {
              if (lastObjectUrlRef.current) {
                URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = null;
              }
              setPreviewUrl(null);
              onRemove();
            }}
            disabled={disabled || isUploading}
            size="sm"
          >
            {t("image.preview.remove") || "Remove Logo"}
          </Button>
        </Stack>
      ) : (
        <Tile
          className={`upload-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Stack gap={4} className="upload-content">
            {isUploading ? (
              <div className="upload-loading">
                <InlineLoading
                  description={t("image.upload.uploading") || "Uploading..."}
                />
              </div>
            ) : !isLogoDataValid() ? (
              <>
                <Image size={32} className="upload-icon" />
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "var(--cds-text-02)",
                  }}
                >
                  Please fill in alt text and dimensions above first
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--cds-text-03)",
                  }}
                >
                  Then you can upload your logo file
                </p>
              </>
            ) : (
              <>
                <Image size={32} className="upload-icon" />
                <p style={{ margin: 0, fontSize: "0.875rem" }}>
                  {t("image.upload.placeholder") ||
                    "Drop logo file here or click to browse"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--cds-text-02)",
                  }}
                >
                  JPEG, PNG, WebP, SVG, GIF up to 5MB
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={disabled || isUploading}
                  className="file-input"
                  id={`${type}-logo-input`}
                />
                <Button
                  kind="secondary"
                  disabled={disabled || isUploading}
                  type="button"
                  size="sm"
                  onClick={() =>
                    document.getElementById(`${type}-logo-input`)?.click()
                  }
                >
                  {t("image.upload.button") || "Browse Files"}
                </Button>
              </>
            )}
          </Stack>
        </Tile>
      )}

      {isUploading && !hasSomethingToShow && (
        <div className="upload-status">
          <Stack gap={2} className="upload-status-content">
            <InlineLoading
              description={t("image.upload.uploading") || "Uploading..."}
            />
          </Stack>
        </div>
      )}
    </div>
  );
};
