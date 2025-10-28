

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
  TextInput,
} from "@carbon/react";
import { Reset } from "@carbon/icons-react";
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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");
  const [hasChanges, setHasChanges] = useState(false);

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

    if (!formData.linkTitle.en.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "en";
    } else if (!formData.linkTitle.ne.trim()) {
      errors.linkTitle = t("form.linkTitle.validation.required");
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "ne";
    }

    if (!formData.linkUrl.trim()) {
      errors.linkUrl = t("form.linkUrl.validation.required");
    } else {
      try {
        new URL(formData.linkUrl);
      } catch {
        errors.linkUrl = t("form.linkUrl.validation.invalid");
      }
    }

    if (formData.order < 1) {
      errors.order = t("form.order.validation.minimum");
    }

    setValidationErrors(errors);
    if (firstInvalidTitleLang) setTitleTab(firstInvalidTitleLang);
    return Object.keys(errors).length === 0;
  };

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

    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    initializeEditForm(link);
    setValidationErrors({});
  };

  return (
    <div>
      <div id="important-links-form">
        {/* Action Bar with Heading */}
        <div className="document-create-form-actionbar flex">
          <h3 className="font-16">{t("sections.basicInfo")}</h3>
        
        </div>

        {isSubmitting && (
          <div className="important-links-inline-loading">
            <InlineLoading description={t("actions.updating")} />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
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

            <div className="important-links-toggle-margin">
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
