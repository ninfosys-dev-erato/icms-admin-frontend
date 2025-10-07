
"use client";

import React, { useState, useEffect } from "react";
import {
  FormGroup,
  NumberInput,
  Toggle,
  Grid,
  Column,
  InlineLoading,
  Button,
  Select,
  SelectItem,
} from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { LogoUpload } from "./logo-upload";
import { HeaderFormData, HeaderAlignment, HeaderConfig } from "../types/header";
import { useHeaderStore } from "../stores/header-store";
import { useUpdateHeader } from "../hooks/use-header-queries";
import { LogoUploadService, LogoUploadData } from "../services/logo-upload-service";
import { LogoItem } from "../types/header";
import { useQueryClient } from "@tanstack/react-query"; // ✅

interface HeaderEditFormProps {
  header: HeaderConfig;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const HeaderEditForm: React.FC<HeaderEditFormProps> = ({
  header,
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("headers");
  const updateMutation = useUpdateHeader();
  const qc = useQueryClient(); // ✅

  const {
    formData,
    isSubmitting,
    setSubmitting,
    leftLogoFile,
    rightLogoFile,
    setLogoFile,
    resetForm,
    validateForm,
    validationErrors,
    updateFormField,
  } = useHeaderStore();

  useEffect(() => {
    updateFormField("name", header.name || { en: "", ne: "" });
    updateFormField("order", header.order || 1);
    updateFormField("alignment", header.alignment || "left");
    updateFormField("isActive", header.isActive ?? true);
    updateFormField("isPublished", header.isPublished ?? false);

    if (header.typography) {
      updateFormField("typography", {
        fontFamily: header.typography.fontFamily || "Arial",
        fontSize: header.typography.fontSize || 16,
        fontWeight: header.typography.fontWeight || "normal",
        color: header.typography.color || "#000000",
        lineHeight: header.typography.lineHeight || 1.2,
        letterSpacing: header.typography.letterSpacing || 0,
      });
    }

    if (header.layout) {
      updateFormField("layout", {
        headerHeight: header.layout.headerHeight || 80,
        backgroundColor: header.layout.backgroundColor || "#ffffff",
        borderColor: header.layout.borderColor || "",
        borderWidth: header.layout.borderWidth || 0,
        padding: header.layout.padding || { top: 0, right: 0, bottom: 0, left: 0 },
        margin: header.layout.margin || { top: 0, right: 0, bottom: 0, left: 0 },
      });
    }

    if (header.logo) {
      const logoConfig = {
        logoAlignment: header.logo.logoAlignment || "left",
        logoSpacing: header.logo.logoSpacing || 10,
        leftLogo: header.logo.leftLogo
          ? {
              mediaId: header.logo.leftLogo.mediaId,
              altText: header.logo.leftLogo.altText || { en: "", ne: "" },
              width: header.logo.leftLogo.width || 150,
              height: header.logo.leftLogo.height || 50,
            }
          : undefined,
        rightLogo: header.logo.rightLogo
          ? {
              mediaId: header.logo.rightLogo.mediaId,
              altText: header.logo.rightLogo.altText || { en: "", ne: "" },
              width: header.logo.rightLogo.width || 150,
              height: header.logo.rightLogo.height || 50,
            }
          : undefined,
      };
      updateFormField("logo", logoConfig);
    }
  }, [header, updateFormField]);

  const [logoUploadProgress, setLogoUploadProgress] = useState<{ left: boolean; right: boolean; }>({
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleFormSubmit = async () => {
      try {
        if (!validateForm()) {
          setSubmitting(false);
          return;
        }

        const submitData = { ...formData };
        // Preserve existing logo metadata unless a new file is being uploaded.
        // Previously we always cleared logo fields which removed existing
        // logo references when no new file was provided.
        if (leftLogoFile) {
          // If a new left logo file will be uploaded, clear the leftLogo field
          // so the server doesn't try to interpret the file metadata.
          submitData.logo = { ...submitData.logo, leftLogo: undefined };
        }
        if (rightLogoFile) {
          submitData.logo = { ...submitData.logo, rightLogo: undefined };
        }

  // Log what we're about to send to the update mutation (visible in browser console)
  console.log('HeaderEditForm - updating header id:', header.id, 'with data:', submitData, { leftLogoFile, rightLogoFile });
  const updatedResult = await updateMutation.mutateAsync({ id: header.id, data: submitData });
  console.log('HeaderEditForm - update result:', updatedResult);

        if (leftLogoFile || rightLogoFile) {
          if (leftLogoFile && formData.logo.leftLogo) {
            setLogoUploadProgress(p => ({ ...p, left: true }));
            try {
              const leftLogoData: LogoUploadData = {
                logo: leftLogoFile,
                altText: formData.logo.leftLogo.altText,
                width: formData.logo.leftLogo.width,
                height: formData.logo.leftLogo.height,
              };
              await LogoUploadService.uploadLogoFile(header.id, "left", leftLogoFile, leftLogoData);
            } finally {
              setLogoUploadProgress(p => ({ ...p, left: false }));
            }
          }

          if (rightLogoFile && formData.logo.rightLogo) {
            setLogoUploadProgress(p => ({ ...p, right: true }));
            try {
              const rightLogoData: LogoUploadData = {
                logo: rightLogoFile,
                altText: formData.logo.rightLogo.altText,
                width: formData.logo.rightLogo.width,
                height: formData.logo.rightLogo.height,
              };
              await LogoUploadService.uploadLogoFile(header.id, "right", rightLogoFile, rightLogoData);
            } finally {
              setLogoUploadProgress(p => ({ ...p, right: false }));
            }
          }
        }

        // Invalidate only the headers list and the detail for the updated header id.
        // This prevents refetches for unrelated header ids (which caused requests
        // to the previous id to be made).
        await qc.invalidateQueries({ queryKey: ['headers'] });
        // Also invalidate/refetch the detail for the updated header id
        await qc.invalidateQueries({ queryKey: ['headers', 'detail', header.id] });
        await qc.refetchQueries({ queryKey: ['headers', 'detail', header.id] });

        onSuccess?.(); // triggers container’s handleFormSuccess (which also invalidates + remounts)
      } catch (e) {
        // console.error(e);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("header-form");
    const handleCustomSubmit = (e: CustomEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSubmitting) return;
      setSubmitting(true);
      handleFormSubmit();
    };

    formContainer?.addEventListener("formSubmit", handleCustomSubmit as unknown as EventListener);
    return () => {
      formContainer?.removeEventListener("formSubmit", handleCustomSubmit as unknown as EventListener);
    };
  }, [
    formData,
    updateMutation,
    onSuccess,
    setSubmitting,
    validateForm,
    isSubmitting,
    leftLogoFile,
    rightLogoFile,
    header.id,
    qc, // keep qc in deps
  ]);

  const handleInputChange = (field: keyof HeaderFormData, value: unknown) => {
    updateFormField(field, value);
  };
  const handleLayoutChange = (field: keyof HeaderFormData["layout"], value: unknown) => {
    updateFormField("layout", { ...formData.layout, [field]: value });
  };
  const handleLogoChange = (field: keyof HeaderFormData["logo"], value: unknown) => {
    updateFormField("logo", { ...formData.logo, [field]: value });
  };
  const handleLogoUpload = (type: "left" | "right", file: File, logoData: Partial<LogoItem>) => {
    setLogoFile(type, file);
    const logoObject = {
      mediaId: undefined,
      altText: logoData.altText || { en: "", ne: "" },
      width: logoData.width || 150,
      height: logoData.height || 50,
    };
    if (type === "left") handleLogoChange("leftLogo", logoObject);
    else handleLogoChange("rightLogo", logoObject);
  };
  const handleLogoRemove = async (type: "left" | "right") => {
    try {
      if (header.logo?.[type === "left" ? "leftLogo" : "rightLogo"]?.mediaId) {
        await LogoUploadService.removeLogo(header.id, type);
      }
      if (type === "left") {
        handleLogoChange("leftLogo", undefined);
        setLogoFile("left", null);
      } else {
        handleLogoChange("rightLogo", undefined);
        setLogoFile("right", null);
      }
    } catch (e) {
      // console.error(e);
    }
  };

  const handleResetForm = () => resetForm();

  return (
    <div id="header-form">
      {/* Top action bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Reset}
          onClick={handleResetForm}
          disabled={isSubmitting || updateMutation.isPending}
        >
          {t("actions.reset")}
        </Button>
      </div>

      {isSubmitting && (
        <div style={{ marginBottom: "1rem" }}>
          <InlineLoading description={t("actions.updating")} />
        </div>
      )}

      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <TranslatableField
            label={t("form.basic.name")}
            value={formData.name}
            onChange={(name) => handleInputChange("name", name)}
            placeholder={{
              en: t("form.basic.namePlaceholder.en"),
              ne: t("form.basic.namePlaceholder.ne"),
            }}
            invalid={!!validationErrors.name}
            invalidText={validationErrors.name}
          />

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <Column lg={8} md={4} sm={4}>
              <NumberInput
                id="order"
                label={t("form.basic.order") || "Display Order"}
                value={formData.order}
                onChange={(event, { value }) => {
                  if (value !== undefined && typeof value === "number") {
                    handleInputChange("order", value);
                  }
                }}
                min={1}
                step={1}
                invalid={!!validationErrors.order}
                invalidText={validationErrors.order}
              />
            </Column>

            <Column lg={8} md={4} sm={4}>
              <Select
                id="alignment"
                labelText={t("form.basic.alignment") || "Text Alignment"}
                value={formData.alignment}
                onChange={(event) => handleInputChange("alignment", event.target.value)}
              >
                <SelectItem value={HeaderAlignment.LEFT} text={t("form.basic.alignmentLeft") || "Left"} />
                <SelectItem value={HeaderAlignment.CENTER} text={t("form.basic.alignmentCenter") || "Center"} />
                <SelectItem value={HeaderAlignment.RIGHT} text={t("form.basic.alignmentRight") || "Right"} />
                <SelectItem value={HeaderAlignment.JUSTIFY} text={t("form.basic.alignmentJustify") || "Justify"} />
              </Select>
            </Column>
          </div>

          {/* Logo Section */}
          <div style={{ marginTop: "1rem" }}>
            <FormGroup legendText={t("form.logo.title") || "Logo Configuration"}>
              {validationErrors.logo && (
                <div style={{ marginBottom: "1rem", color: "var(--cds-text-error)", fontSize: "0.75rem" }}>
                  {validationErrors.logo}
                </div>
              )}

              {/* Logo Alignment */}
              <Select
                id="logoAlignment"
                labelText={t("form.logo.alignment") || "Logo Alignment"}
                value={formData.logo.logoAlignment}
                onChange={(event) => handleLogoChange("logoAlignment", event.target.value)}
                style={{ marginBottom: "1rem" }}
              >
                <SelectItem value="left" text="Left" />
                <SelectItem value="center" text="Center" />
                <SelectItem value="right" text="Right" />
              </Select>

              {/* Left Logo */}
              <div style={{ marginBottom: "1rem" }} className="logo-upload-section">
                <LogoUpload
                  type="left"
                  currentLogo={formData.logo.leftLogo}
                  onUpload={(file, logoData) => handleLogoUpload("left", file, logoData)}
                  onRemove={() => handleLogoRemove("left")}
                  isUploading={logoUploadProgress.left}
                  disabled={isSubmitting}
                  showPreview={true}
                  headerId={header.id}
                />
              </div>

              {/* Right Logo */}
              <div className="logo-upload-section">
                <LogoUpload
                  type="right"
                  currentLogo={formData.logo.rightLogo}
                  onUpload={(file, logoData) => handleLogoUpload("right", file, logoData)}
                  onRemove={() => handleLogoRemove("right")}
                  isUploading={logoUploadProgress.right}
                  disabled={isSubmitting}
                  showPreview={true}
                  headerId={header.id}
                />
              </div>
            </FormGroup>
          </div>
        </Column>

        <div style={{ marginTop: "2rem" }}>
          <Toggle
            id="isActive"
            labelText={t("form.basic.isActive") || "Active"}
            toggled={formData.isActive}
            onToggle={(checked) => handleInputChange("isActive", checked)}
          />

          <div style={{ marginTop: "1rem" }}>
            <Toggle
              id="isPublished"
              labelText="Published"
              toggled={formData.isPublished}
              onToggle={(checked) => handleInputChange("isPublished", checked)}
              disabled={!formData.isActive}
            />
          </div>
        </div>
      </Grid>

      {/* Scoped CSS to hide only the two-line "Step 1 / Step 2" helper box from LogoUpload */}
      <style jsx global>{`
        .logo-upload-section .logo-upload > div[style*="background-color: var(--cds-ui-02)"]
          [style*="font-size: 0.875rem"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
};
