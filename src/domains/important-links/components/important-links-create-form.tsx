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
  Button,
  TextInput,
} from "@carbon/react";
import { Add, Reset, Link } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { ImportantLinkFormData } from "../types/important-links";
import { useImportantLinksStore } from "../stores/important-links-store";
import { useCreateImportantLink } from "../hooks/use-important-links-queries";

interface ImportantLinksCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ImportantLinksCreateForm: React.FC<
  ImportantLinksCreateFormProps
> = ({ onSuccess, onCancel, className }) => {
  const t = useTranslations("important-links");
  const createMutation = useCreateImportantLink();
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    resetCreateForm,
  } = useImportantLinksStore();

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidTitleLang: "en" | "ne" | null = null;

    // Validate title (per language, only first error shown)
    if (!createFormState.linkTitle.en.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "en";
    } else if (!createFormState.linkTitle.ne.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "ne";
    }

    // Validate URL
    if (!createFormState.linkUrl.trim()) {
      errors.linkUrl = t("form.linkUrl.validation.required");
    } else {
      try {
        new URL(createFormState.linkUrl);
      } catch {
        errors.linkUrl = t("form.linkUrl.validation.invalid");
      }
    }

    // Validate order
    if (createFormState.order < 1) {
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
        await createMutation.mutateAsync(createFormState);

        // Reset form
        resetCreateForm();
        setValidationErrors({});

        // Call success callback immediately
        onSuccess?.();
      } catch (error) {
        console.error("Important link creation error:", error);
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
  }, [
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

    try {
      await createMutation.mutateAsync(createFormState);

      // Reset form
      resetCreateForm();
      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Important link creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ImportantLinkFormData,
    value: unknown
  ) => {
    updateFormField("create", field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    resetCreateForm();
    setValidationErrors({});
  };

  return (
    <div>
      <div id="important-links-form">
        {/* Top action bar */}
        <div className="important-links-action-bar">
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
          <div className="important-links-inline-loading">
            <InlineLoading description={t("actions.creating")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Link Title */}
            <TranslatableField
              label={t("form.linkTitle.label")}
              value={createFormState.linkTitle}
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
                value={createFormState.linkUrl}
                onChange={(e) => handleInputChange("linkUrl", e.target.value)}
                placeholder={t("form.linkUrl.placeholder")}
                invalid={!!validationErrors.linkUrl}
                invalidText={validationErrors.linkUrl}
              />
            </div>

            {/* Order Input */}
            <div className="important-links-field-margin">
              <NumberInput
                id="order"
                label={t("form.order.label")}
                value={createFormState.order}
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
                toggled={createFormState.isActive}
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
                <div className="important-links-toggle-side-margin">
                  <Toggle ... />
                </div>
              </Column>
            </div>
            */}
          </Column>
        </Grid>
      </div>
    </div>
  );
};
