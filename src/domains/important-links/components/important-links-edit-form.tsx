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
  TextInput,
} from "@carbon/react";
import { Save, Close, Link } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { ImportantLinkFormData, ImportantLink } from "../types/important-links";
import { useImportantLinksStore } from "../stores/important-links-store";
import { useUpdateImportantLink } from "../hooks/use-important-links-queries";

interface ImportantLinksEditFormProps {
  link: ImportantLink;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ImportantLinksEditForm: React.FC<ImportantLinksEditFormProps> = ({
  link,
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("important-links");
  const updateMutation = useUpdateImportantLink();
  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    activeFormId,
    updateFormField,
    initializeEditForm,
  } = useImportantLinksStore();

  // Initialize store-backed form on mount/link change
  useEffect(() => {
    initializeEditForm(link);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.id]);

  const formData: ImportantLinkFormData = formStateById[link.id] ?? {
    linkTitle: link.linkTitle || { en: "", ne: "" },
    linkUrl: link.linkUrl,
    order: link.order,
    isActive: link.isActive,
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.linkTitle.en !== (link.linkTitle?.en || "") ||
      formData.linkTitle.ne !== (link.linkTitle?.ne || "") ||
      formData.linkUrl !== link.linkUrl ||
      formData.order !== link.order ||
      formData.isActive !== link.isActive;

    setHasChanges(hasFormChanges);
  }, [formData, link]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidTitleLang: "en" | "ne" | null = null;

    // Validate title (per language, only first error shown)
    if (!formData.linkTitle.en.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "en";
    } else if (!formData.linkTitle.ne.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "ne";
    }

    // Validate URL
    if (!formData.linkUrl.trim()) {
      errors.linkUrl = t("form.linkUrl.validation.required");
    } else {
      try {
        new URL(formData.linkUrl);
      } catch {
        errors.linkUrl = t("form.linkUrl.validation.invalid");
      }
    }

    // Validate order
    if (formData.order < 1) {
      errors.order = t("form.order.validation.minimum");
    }

    setValidationErrors(errors);
    if (firstInvalidTitleLang) setTitleTab(firstInvalidTitleLang);
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
          id: link.id,
          data: {
            linkTitle: formData.linkTitle,
            linkUrl: formData.linkUrl,
            order: formData.order,
            isActive: formData.isActive,
          },
        });

        setValidationErrors({});
        onSuccess?.();
      } catch (error) {
        console.error("Important link update error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("important-links-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [formData, updateMutation, onSuccess, link.id]);

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
        id: link.id,
        data: {
          linkTitle: formData.linkTitle,
          linkUrl: formData.linkUrl,
          order: formData.order,
          isActive: formData.isActive,
        },
      });

      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      console.error("❌ Important link update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ImportantLinkFormData,
    value: unknown
  ) => {
    updateFormField(link.id, field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  return (
    <div>
      <div id="important-links-form">
        {isSubmitting && (
          <div className="important-links-inline-loading">
            <InlineLoading description={t("actions.updating")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Link Title */}
            <TranslatableField
              label={t("form.linkTitle.label")}
              value={formData.linkTitle}
              onChange={(linkTitle) =>
                handleInputChange("linkTitle", linkTitle)
              }
              placeholder={{
                en: t("form.linkTitle.placeholder.en"),
                ne: t("form.linkTitle.placeholder.ne"),
              }}
              invalid={!!validationErrors.linkTitle}
              invalidText={validationErrors.linkTitle}
              activeTab={titleTab}
              setActiveTab={setTitleTab}
            />

            {/* Link URL */}
            <div className="important-links-field-margin">
              <TextInput
                id="linkUrl"
                labelText={t("form.linkUrl.label")}
                value={formData.linkUrl}
                onChange={(e) => handleInputChange("linkUrl", e.target.value)}
                placeholder={t("form.linkUrl.placeholder")}
                invalid={!!validationErrors.linkUrl}
                invalidText={validationErrors.linkUrl}
              />
            </div>

            {/* Order and Active Status - VERTICAL LAYOUT */}
            {/* Order Input */}
            <div className="important-links-field-margin">
              <NumberInput
                id="order"
                label={t("form.order.label")}
                value={formData.order}
                onChange={(event, { value }) => {
                  if (value !== undefined) {
                    handleInputChange("order", value);
                  }
                }}
                min={1}
                step={1}
                invalid={!!validationErrors.order}
                invalidText={validationErrors.order}
                className="important-links-number-input"
              />
            </div>

            {/* Active Status Toggle - Positioned below Order */}
            <div className="important-links-toggle-margin">
              <Toggle
                id="isActive"
                labelText={t("form.isActive.label")}
                toggled={formData.isActive}
                onToggle={(checked) => handleInputChange("isActive", checked)}
              />
            </div>

            {/*
            ORDER AND ACTIVE STATUS - SIDE BY SIDE LAYOUT (COMMENTED FOR FUTURE USE)
            <div className="important-links-side-by-side">
              <Column lg={8} md={4} sm={4}>
                <NumberInput ... />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Toggle ... className="important-links-toggle-side-margin" />
              </Column>
            </div>
            */}
          </Column>
        </Grid>
      </div>
    </div>
  );
};
