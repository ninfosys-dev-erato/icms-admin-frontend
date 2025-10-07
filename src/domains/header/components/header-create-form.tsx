
"use client";

import React, { useEffect } from "react";
import {
  FormGroup,
  Grid,
  Column,
  Select,
  SelectItem,
} from "@carbon/react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { LogoUpload } from "./logo-upload";
import { HeaderFormData, HeaderAlignment } from "../types/header";
import { useHeaderStore } from "../stores/header-store";
import { useCreateHeaderWithLogos } from "../hooks/use-header-queries";

/* module components */
import { HeaderCreateActionBar } from "./header-create-action-bars";
import { HeaderCreateInlineLoading } from "./header-create-inline-loading";
import { HeaderCreateBasicRow } from "./header-create-basic-row";
import { HeaderCreateLogoSection } from "./header-create-logo-section";
import { HeaderCreateToggles } from "./header-create-toggles";

interface HeaderCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const HeaderCreateForm: React.FC<HeaderCreateFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("headers");
  const createMutation = useCreateHeaderWithLogos();
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
    const handleFormSubmission = async () => {
      try {
        const submitData = { ...formData };
        // Log what we're about to send to the create mutation (visible in browser console)
        console.log('HeaderCreateForm - creating header with data:', submitData, { leftLogoFile, rightLogoFile });
        const result = await createMutation.mutateAsync({
          headerData: submitData,
          leftLogoFile: leftLogoFile || undefined,
          rightLogoFile: rightLogoFile || undefined,
        });
        console.log('HeaderCreateForm - create result:', result);
        resetForm();
        onSuccess?.();
      } catch (error) {
        console.error('HeaderCreateForm - create error:', error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("header-form");

    const handleCustomSubmit = (e: CustomEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSubmitting(true);

      if (!validateForm()) {
        setSubmitting(false);
        return;
      }

      if (formData.logo.leftLogo && !leftLogoFile) {
        useHeaderStore.getState().setValidationErrors({
          logo: "Left logo file is required when logo is configured",
        });
        setSubmitting(false);
        return;
      }
      if (formData.logo.rightLogo && !rightLogoFile) {
        useHeaderStore.getState().setValidationErrors({
          logo: "Right logo file is required when logo is configured",
        });
        setSubmitting(false);
        return;
      }

      handleFormSubmission();
    };

    formContainer?.addEventListener(
      "formSubmit",
      handleCustomSubmit as EventListener
    );
    return () => {
      formContainer?.removeEventListener(
        "formSubmit",
        handleCustomSubmit as EventListener
      );
    };
  }, [
    formData,
    createMutation,
    onSuccess,
    resetForm,
    setSubmitting,
    validateForm,
    leftLogoFile,
    rightLogoFile,
  ]);

  const handleInputChange = (field: keyof HeaderFormData, value: unknown) => {
    updateFormField(field, value);
  };

  const handleLogoChange = (
    field: keyof HeaderFormData["logo"],
    value: any
  ) => {
    updateFormField("logo", {
      ...formData.logo,
      [field]: value,
    });
  };

  const handleLogoUpload = (
    type: "left" | "right",
    file: File,
    logoData: any
  ) => {
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

  const handleLogoRemove = (type: "left" | "right") => {
    if (type === "left") {
      handleLogoChange("leftLogo", undefined);
      setLogoFile("left", null);
    } else {
      handleLogoChange("rightLogo", undefined);
      setLogoFile("right", null);
    }
  };

  const handleResetForm = () => {
    resetForm();
  };

  return (
    <div id="header-form" className={className}>
      {/* Top action bar */}
      <HeaderCreateActionBar
        isSubmitting={isSubmitting}
        isPending={createMutation.isPending}
        onReset={handleResetForm}
        resetLabel={t("actions.reset")}
      />

      {isSubmitting && (
        <HeaderCreateInlineLoading description={t("actions.creating")} />
      )}

      <Grid fullWidth>
        {/* Basic Information Section */}
        <Column lg={16} md={8} sm={4}>
          {/* Name */}
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

          <HeaderCreateBasicRow
            orderValue={formData.order}
            onOrderChange={(v) => handleInputChange("order", v)}
            alignmentValue={formData.alignment}
            onAlignmentChange={(v) => handleInputChange("alignment", v)}
            labels={{
              order: t("form.basic.order") || "Display Order",
              alignment: t("form.basic.alignment") || "Text Alignment",
              left: t("form.basic.alignmentLeft") || "Left",
              center: t("form.basic.alignmentCenter") || "Center",
              right: t("form.basic.alignmentRight") || "Right",
              justify: t("form.basic.alignmentJustify") || "Justify",
            }}
            HeaderAlignment={HeaderAlignment}
            orderInvalid={!!validationErrors.order}
            orderInvalidText={validationErrors.order}
          />

          {/* Logo Section */}
          <div className="form-section">
            <FormGroup legendText={t("form.logo.title") || "Logo Configuration"}>
              {validationErrors.logo && (
                <div className="form-error-text">
                  {validationErrors.logo}
                </div>
              )}

              {/* Logo Alignment */}
              <Select
                id="logoAlignment"
                labelText={t("form.logo.alignment") || "Logo Alignment"}
                value={formData.logo.logoAlignment}
                onChange={(event) =>
                  handleLogoChange("logoAlignment", event.target.value)
                }
                className="form-select-spacing"
              >
                <SelectItem value="left" text="Left" />
                <SelectItem value="center" text="Center" />
                <SelectItem value="right" text="Right" />
              </Select>

              <HeaderCreateLogoSection
                leftLogo={formData.logo.leftLogo}
                rightLogo={formData.logo.rightLogo}
                isSubmitting={isSubmitting}
                onUploadLeft={(file, data) => handleLogoUpload("left", file, data)}
                onUploadRight={(file, data) => handleLogoUpload("right", file, data)}
                onRemoveLeft={() => handleLogoRemove("left")}
                onRemoveRight={() => handleLogoRemove("right")}
              />
            </FormGroup>
          </div>
        </Column>

        {/* Active / Published */}
        <HeaderCreateToggles
          isActive={formData.isActive}
          isPublished={formData.isPublished}
          onActiveToggle={(checked) => handleInputChange("isActive", checked)}
          onPublishedToggle={(checked) => handleInputChange("isPublished", checked)}
          activeLabel={t("form.basic.isActive") || "Active"}
        />
      </Grid>
    </div>
  );
};


