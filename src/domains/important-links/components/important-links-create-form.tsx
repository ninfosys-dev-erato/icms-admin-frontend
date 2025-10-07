"use client";

import React, { useEffect, useState } from "react";
import {
  Grid,
  Column,
  NumberInput,
  Toggle,
  InlineLoading,
  Button,
  TextInput,
  FormGroup,
} from "@carbon/react";
import { Reset, Add } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { ImportantLinkFormData } from "../types/important-links";
import { useImportantLinksStore } from "../stores/important-links-store";
import { useCreateImportantLink, useImportantLinks } from "../hooks/use-important-links-queries";

interface ImportantLinksCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ImportantLinksCreateForm: React.FC<ImportantLinksCreateFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("important-links");
  const createMutation = useCreateImportantLink();
  const { data: listData } = useImportantLinks({ page: 1, limit: 10000 });
  const linkCount = listData?.data?.length || 0;

  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    resetCreateForm,
  } = useImportantLinksStore();

  // Ensure default order is set when form opens or link count changes
  useEffect(() => {
    if (!createFormState.order || createFormState.order < 1) {
      updateFormField("create", "order", linkCount + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkCount]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!createFormState.linkTitle.en.trim() && !createFormState.linkTitle.ne.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
    }

    if (!createFormState.linkUrl.trim()) {
      errors.linkUrl = t("form.linkUrl.validation.required");
    } else {
      try {
        new URL(createFormState.linkUrl);
      } catch {
        errors.linkUrl = t("form.linkUrl.validation.invalid");
      }
    }

    if (createFormState.order < 1) {
      errors.order = t("form.order.validation.minimum");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Listen for parent form submit
  useEffect(() => {
    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setSubmitting(true);

      if (!validateForm()) {
        setSubmitting(false);
        return;
      }

      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        await createMutation.mutateAsync({
          linkTitle: createFormState.linkTitle,
          linkUrl: createFormState.linkUrl,
          order: createFormState.order,
          isActive: createFormState.isActive,
        });

        resetCreateForm();
        setValidationErrors({});
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
      return () => parentForm.removeEventListener("submit", handleParentFormSubmit);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFormState, createMutation, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      await createMutation.mutateAsync({
        linkTitle: createFormState.linkTitle,
        linkUrl: createFormState.linkUrl,
        order: createFormState.order,
        isActive: createFormState.isActive,
      });

      resetCreateForm();
      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      console.error("Important link creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ImportantLinkFormData, value: unknown) => {
    updateFormField("create", field, value);

    if (validationErrors[field]) {
      const newErrors = { ...validationErrors } as any;
      delete newErrors[field as string];
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    resetCreateForm();
    setValidationErrors({});
    updateFormField("create", "order", linkCount + 1);
  };

  return (
    <div>
      <div id="important-links-form">
        <div className="important-links-form-action-bar">
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
          <Column lg={16} md={8} sm={4}>
            <TranslatableField
              label={t("form.linkTitle.label")}
              value={createFormState.linkTitle}
              onChange={(linkTitle) => handleInputChange("linkTitle", linkTitle)}
              placeholder={{
                en: t("form.linkTitle.placeholder.en"),
                ne: t("form.linkTitle.placeholder.ne"),
              }}
              invalid={!!validationErrors.linkTitle}
              invalidText={validationErrors.linkTitle}
            />

            <div className="important-links-field-margin">
              <TextInput
                id="linkUrl"
                labelText={t("form.linkUrl.label")}
                value={createFormState.linkUrl}
                onChange={(e) => handleInputChange("linkUrl", (e.target as HTMLInputElement).value)}
                placeholder={t("form.linkUrl.placeholder")}
                invalid={!!validationErrors.linkUrl}
                invalidText={validationErrors.linkUrl}
              />
            </div>

            <div className="important-links-field-margin">
              <NumberInput
                id="order"
                label={t("form.order.label")}
                value={createFormState.order}
                onChange={(event, { value }) => {
                  if (value !== undefined) handleInputChange("order", value);
                }}
                min={1}
                step={1}
                invalid={!!validationErrors.order}
                invalidText={validationErrors.order}
                className="important-links-number-input"
              />
            </div>

            <div className="important-links-toggle-margin">
              <Toggle
                id="isActive"
                labelText={t("form.isActive.label")}
                toggled={createFormState.isActive}
                onToggle={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
