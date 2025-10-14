"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FormGroup,
  NumberInput,
  Toggle,
  Grid,
  Column,
  Stack,
  InlineLoading,
  Button,
} from "@carbon/react";
import { Add, Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { SliderImageUpload } from "./slider-image-upload";
import { SliderFormData } from "../types/slider";
import { useSliderStore } from "../stores/slider-store";
import { useCreateSliderWithImage } from "../hooks/use-slider-queries";

interface SliderCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SliderCreateForm: React.FC<SliderCreateFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("sliders");
  const createMutation = useCreateSliderWithImage();
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    createSelectedFile,
    setSelectedFile,
    resetCreateForm,
  } = useSliderStore();

  // Form state is managed in store (persisted). Keep only validation locally.

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeTitleLang, setActiveTitleLang] = useState<"en" | "ne">("en");
  const titleEnRef = useRef<HTMLInputElement>(null);
  const titleNeRef = useRef<HTMLInputElement>(null);
  const selectedFile = createSelectedFile;

  // Per-language validation and tab switching
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalid: { lang: "en" | "ne" } | null = null;

    // Validate image file
    if (!selectedFile) {
      errors.image = t("form.image.validation.required");
    }

    // Validate position
    if (createFormState.position < 1) {
      errors.position = t("form.position.validation.minimum");
    }

    // Validate display time
    if (createFormState.displayTime < 1000) {
      errors.displayTime = t("form.displayTime.validation.minimum");
    }

    // Require title in both languages; enforce minimum length (2)
    const en = createFormState.title.en.trim();
    const ne = createFormState.title.ne.trim();

    if (!en) {
      errors.title_en = t("form.title.validation.required.en", {
        default: t("form.title.validation.tooShort", {
          default: "Title is required",
        }),
      });
      if (!firstInvalid) firstInvalid = { lang: "en" };
    } else if (en.length < 2) {
      errors.title_en = t("form.title.validation.tooShort");
      if (!firstInvalid) firstInvalid = { lang: "en" };
    }

    if (!ne) {
      errors.title_ne = t("form.title.validation.required.ne", {
        default: t("form.title.validation.tooShort", {
          default: "Title is required",
        }),
      });
      if (!firstInvalid) firstInvalid = { lang: "ne" };
    } else if (ne.length < 2) {
      errors.title_ne = t("form.title.validation.tooShort");
      if (!firstInvalid) firstInvalid = { lang: "ne" };
    }

    setValidationErrors(errors);

    // If there is a per-language error, switch tab and focus
    if (firstInvalid) {
      setActiveTitleLang(firstInvalid.lang);
      setTimeout(() => {
        if (firstInvalid.lang === "en") titleEnRef.current?.focus();
        if (firstInvalid.lang === "ne") titleNeRef.current?.focus();
      }, 0);
      return false;
    }
    return Object.keys(errors).length === 0;
  };

  // Listen for form submission from the parent CreateSidePanel
  useEffect(() => {
    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setSubmitting(true);

      // Validate and submit the form
      if (!validateForm()) {
        setSubmitting(false);
        return;
      }

      if (!selectedFile) {
        setValidationErrors({ image: t("form.image.validation.required") });
        setSubmitting(false);
        return;
      }

      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        await createMutation.mutateAsync({
          file: selectedFile!,
          data: createFormState,
        });

        // Reset form
        resetCreateForm();
        setValidationErrors({});

        // Call success callback immediately
        onSuccess?.();
      } catch (error) {
        console.error("Slider creation error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("slider-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [
    selectedFile,
    createFormState,
    createMutation,
    onSuccess,
    t,
    resetCreateForm,
    setSubmitting,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    if (!selectedFile) {
      setValidationErrors({ image: t("form.image.validation.required") });
      setSubmitting(false);
      return;
    }

    try {
      await createMutation.mutateAsync({
        file: selectedFile!,
        data: createFormState,
      });

      // Reset form
      resetCreateForm();
      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Slider creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setSelectedFile("create", file);
    // Clear image validation error when file is selected
    if (validationErrors.image) {
      const newErrors = { ...validationErrors };
      delete newErrors.image;
      setValidationErrors(newErrors);
    }
  };

  const handleImageRemove = () => {
    setSelectedFile("create", null);
  };

  const handleInputChange = (field: keyof SliderFormData, value: unknown) => {
    updateFormField("create", field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleTitleChange = (title: SliderFormData["title"]) => {
    updateFormField("create", "title", title);
    // Clear per-language validation errors if conditions are now satisfied
    const newErrors = { ...validationErrors } as Record<string, string>;
    // Clear English error only when valid (length >= 2)
    if (title.en.trim().length >= 2) {
      delete newErrors.title_en;
    }
    // Clear Nepali error only when valid (length >= 2)
    if (title.ne.trim().length >= 2) {
      delete newErrors.title_ne;
    }
    if (
      Object.keys(newErrors).length !== Object.keys(validationErrors).length
    ) {
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    resetCreateForm();
    setValidationErrors({});
  };

  return (
    <div>
      <div id="slider-form">
        {/* Top action bar */}
        <div className="slider-form-action-bar">
          <div className="basic-info-title"><h4>{t("sections.basicInfo")}</h4></div>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleResetForm}
            disabled={isSubmitting || createMutation.isPending}
          >
            {t("actions.reset")}
          </Button>
        </div>
        {isSubmitting && (
          <div className="slider-form-loading">
            <InlineLoading description={t("actions.creating")} />
          </div>
        )}
        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Title */}
            <TranslatableField
              label={t("form.title.label")}
              value={createFormState.title}
              onChange={handleTitleChange}
              placeholder={{
                en: t("form.title.placeholder.en"),
                ne: t("form.title.placeholder.ne"),
              }}
              invalid={
                !!validationErrors.title_en || !!validationErrors.title_ne
              }
              invalidText={
                validationErrors.title_en || validationErrors.title_ne
              }
              activeTab={activeTitleLang}
              setActiveTab={setActiveTitleLang}
            />

            <div className="slider-form-fields-row">
              <Column lg={8} md={4} sm={4}>
                <NumberInput
                  id="position"
                  label={t("form.position.label")}
                  value={createFormState.position}
                  onChange={(event, { value }) => {
                    if (value !== undefined) {
                      handleInputChange("position", value);
                    }
                  }}
                  min={1}
                  step={1}
                  invalid={!!validationErrors.position}
                  invalidText={validationErrors.position}
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <NumberInput
                  id="displayTime"
                  label={t("form.displayTime.label")}
                  value={createFormState.displayTime}
                  onChange={(event, { value }) => {
                    if (value !== undefined) {
                      handleInputChange("displayTime", value);
                    }
                  }}
                  min={1000}
                  step={500}
                  invalid={!!validationErrors.displayTime}
                  invalidText={validationErrors.displayTime}
                />
              </Column>
            </div>

            {/* Image Section */}
            <div className="slider-form-image-section">
              <FormGroup legendText={t("sections.image")}>
                {validationErrors.image && (
                  <div className="slider-form-image-error">
                    {validationErrors.image}
                  </div>
                )}

                <SliderImageUpload
                  currentImage={
                    selectedFile ? URL.createObjectURL(selectedFile) : undefined
                  }
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  isUploading={createMutation.isPending}
                  showPreview={!!selectedFile}
                  showHeader={false}
                />
              </FormGroup>
            </div>
          </Column>

          <div className="slider-form-toggle-row">
            <Toggle
              id="isActive"
              labelText={t("form.isActive.label")}
              toggled={createFormState.isActive}
              onToggle={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
        </Grid>
      </div>
    </div>
  );
};
