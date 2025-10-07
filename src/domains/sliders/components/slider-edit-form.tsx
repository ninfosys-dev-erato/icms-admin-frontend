"use client";

import React, { useState, useEffect } from "react";
import {
  FormGroup,
  NumberInput,
  Toggle,
  Grid,
  Column,
  Stack,
  InlineLoading,
} from "@carbon/react";
import { Save, Close } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { SliderImageUpload } from "./slider-image-upload";
import { SliderFormData, Slider } from "../types/slider";
import { useSliderStore } from "../stores/slider-store";
import {
  useRemoveSliderImage,
  useUpdateSlider,
  useUploadSliderImage,
} from "../hooks/use-slider-queries";
import { SliderNotificationService } from "../services/slider-notification-service";
import { NotificationService } from "@/services/notification-service";
// duplicate import removed

interface SliderEditFormProps {
  slider: Slider;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SliderEditForm: React.FC<SliderEditFormProps> = ({
  slider,
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("sliders");
  const updateMutation = useUpdateSlider();
  const uploadMutation = useUploadSliderImage();
  const removeImageMutation = useRemoveSliderImage();
  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    activeFormId,
    updateFormField,
    initializeEditForm,
    selectedFileById,
    setSelectedFile,
    resetFormState,
  } = useSliderStore();

  // Initialize store-backed form on mount/slider change
  useEffect(() => {
    initializeEditForm(slider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slider.id]);

  const formData: SliderFormData = formStateById[slider.id] ?? {
    title: slider.title || { en: "", ne: "" },
    position: slider.position,
    displayTime: slider.displayTime,
    isActive: slider.isActive,
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const selectedFile = selectedFileById[slider.id] ?? null;
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.title.en !== (slider.title?.en || "") ||
      formData.title.ne !== (slider.title?.ne || "") ||
      formData.position !== slider.position ||
      formData.displayTime !== slider.displayTime ||
      formData.isActive !== slider.isActive ||
      selectedFile !== null;

    setHasChanges(hasFormChanges);
  }, [formData, selectedFile, slider]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate position
    if (formData.position < 1) {
      errors.position = t("form.position.validation.minimum");
    }

    // Validate display time
    if (formData.displayTime < 1000) {
      errors.displayTime = t("form.displayTime.validation.minimum");
    }

    // Optional: Validate title if provided
    if (formData.title.en.trim() && formData.title.en.trim().length < 2) {
      errors.title = t("form.title.validation.tooShort");
    }
    if (formData.title.ne.trim() && formData.title.ne.trim().length < 2) {
      errors.title = t("form.title.validation.tooShort");
    }

    setValidationErrors(errors);
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

      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        await updateMutation.mutateAsync({
          id: slider.id,
          data: {
            title: formData.title,
            position: formData.position,
            displayTime: formData.displayTime,
            isActive: formData.isActive,
          },
        });

        if (selectedFile) {
          await uploadMutation.mutateAsync({
            id: slider.id,
            file: selectedFile,
          });
        }

        setSelectedFile(slider.id, null);
        setValidationErrors({});

        onSuccess?.();
      } catch (error) {
        console.error("Slider update error:", error);
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
    formData,
    selectedFile,
    updateMutation,
    uploadMutation,
    onSuccess,
    slider.id,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: slider.id,
        data: {
          title: formData.title,
          position: formData.position,
          displayTime: formData.displayTime,
          isActive: formData.isActive,
        },
      });

      if (selectedFile) {
        await uploadMutation.mutateAsync({ id: slider.id, file: selectedFile });
      }

      setSelectedFile(slider.id, null);
      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("❌ Slider update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setSelectedFile(slider.id, file);
    // Clear image validation error when file is selected
    if (validationErrors.image) {
      const newErrors = { ...validationErrors };
      delete newErrors.image;
      setValidationErrors(newErrors);
    }
  };

  const handleImageRemove = async () => {
    if (selectedFile) {
      setSelectedFile(slider.id, null);
    } else if (slider.mediaId) {
      try {
        await removeImageMutation.mutateAsync(slider.id);
        // Notify parent to refetch slider data
        onSuccess?.();
      } catch (error) {
        console.error("Image removal failed:", error);
      }
    }
  };

  const handleInputChange = (field: keyof SliderFormData, value: unknown) => {
    updateFormField(slider.id, field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const getCurrentImageUrl = (): string | undefined => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    if (slider.media?.presignedUrl) {
      return slider.media.presignedUrl;
    }
    if (slider.media?.url) {
      return slider.media.url;
    }
    return undefined;
  };

  return (
    <div>
      <div id="slider-form">
        {isSubmitting && (
          <div className="slider-form-loading">
            <InlineLoading description={t("actions.updating")} />
          </div>
        )}
        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Title */}
            <TranslatableField
              label={t("form.title.label")}
              value={formData.title}
              onChange={(title) => handleInputChange("title", title)}
              placeholder={{
                en: t("form.title.placeholder.en"),
                ne: t("form.title.placeholder.ne"),
              }}
              invalid={!!validationErrors.title}
              invalidText={validationErrors.title}
            />

            <div className="slider-form-fields-row">
              <Column lg={8} md={4} sm={4}>
                <NumberInput
                  id="position"
                  label={t("form.position.label")}
                  value={formData.position}
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
                  value={formData.displayTime}
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
                  <div
                    style={{
                      marginBottom: "1rem",
                      color: "var(--cds-text-error)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {validationErrors.image}
                  </div>
                )}

                {/* Show preview and remove if image exists, always show upload UI */}
                {getCurrentImageUrl() && (
                  <SliderImageUpload
                    currentImage={getCurrentImageUrl()}
                    onUpload={handleImageUpload}
                    onRemove={() => {}}
                    isUploading={uploadMutation.isPending}
                    showPreview={true}
                    showHeader={false}
                    allowRemove={false}
                    changePhotoButton={true}
                  />
                )}
              </FormGroup>
            </div>

            <div className="slider-form-toggle-row">
              <Toggle
                id="isActive"
                labelText={t("form.isActive.label")}
                toggled={formData.isActive}
                onToggle={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
