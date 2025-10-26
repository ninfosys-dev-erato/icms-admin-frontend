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
  Select,
  SelectItem,
  DismissibleTag,
  TextInput,
} from "@carbon/react";
import { Add, Reset, TrashCan } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { NepaliDatePickerComponent } from "@/components/shared/nepali-date-picker";
import { DocumentUpload } from "./document-upload";
import {
  DocumentFormData,
  DocumentCategory,
  DocumentStatus,
} from "../types/document";
import { useDocumentStore } from "../stores/document-store";
import { useCreateDocumentWithFile } from "../hooks/use-document-queries";

interface DocumentCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const DocumentCreateForm: React.FC<DocumentCreateFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("documents");

  const createMutation = useCreateDocumentWithFile();
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    selectedFile,
    setSelectedFile,
    resetCreateForm,
  } = useDocumentStore();

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | { en?: string; ne?: string }>
  >({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");
  const [descTab, setDescTab] = useState<"en" | "ne">("en");
  const [tags, setTags] = useState<string[]>(createFormState.tags || []);
  const [newTag, setNewTag] = useState<string>("");

  // Synchronize local tags state with createFormState.tags
  useEffect(() => {
    if (createFormState.tags && createFormState.tags.length > 0) {
      setTags(createFormState.tags);
    }
  }, [createFormState.tags]);

  // Debug logging for tags state changes
  useEffect(() => {
    console.log("🏷️ Tags state changed:", {
      localTags: tags,
      createFormStateTags: createFormState.tags,
      areEqual: JSON.stringify(tags) === JSON.stringify(createFormState.tags),
    });
  }, [tags, createFormState.tags]);

  const validateForm = (): boolean => {
    const errors: Record<string, string | { en?: string; ne?: string }> = {};
    let firstInvalidTitleLang: "en" | "ne" | null = null;
    let firstInvalidDescLang: "en" | "ne" | null = null;

    // Validate file
    if (!selectedFile) {
      errors.file = t("form.file.validation.required");
    }

    // Validate title (per language, only first error shown)
    if (!createFormState.title.en.trim()) {
      errors.title = {
        ...((errors.title as any) || {}),
        en: t("form.title.validation.required"),
      };
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "en";
    } else if (!createFormState.title.ne.trim()) {
      errors.title = {
        ...((errors.title as any) || {}),
        ne: t("form.title.validation.required"),
      };
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "ne";
    }

    // Validate description (per language, only first error shown)
    if (!createFormState.description?.en?.trim()) {
      errors.description = {
        ...((errors.description as any) || {}),
        en: t("form.description.validation.required"),
      };
      if (!firstInvalidDescLang) firstInvalidDescLang = "en";
    } else if (!createFormState.description?.ne?.trim()) {
      errors.description = {
        ...((errors.description as any) || {}),
        ne: t("form.description.validation.required"),
      };
      if (!firstInvalidDescLang) firstInvalidDescLang = "ne";
    }

    // Validate category
    if (!createFormState.category) {
      errors.category = t("form.category.validation.required");
    }

    // Validate status
    if (!createFormState.status) {
      errors.status = t("form.status.validation.required");
    }

    // Validate order
    if (createFormState.order < 0) {
      errors.order = t("form.order.validation.minimum");
    }

    setValidationErrors(errors);
    if (firstInvalidTitleLang) setTitleTab(firstInvalidTitleLang);
    if (firstInvalidDescLang) setDescTab(firstInvalidDescLang);
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
        setValidationErrors({ file: t("form.file.validation.required") });
        setSubmitting(false);
        return;
      }

      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        // Ensure tags are properly synchronized
        if (
          tags.length > 0 &&
          (!createFormState.tags || createFormState.tags.length === 0)
        ) {
          console.log("🔄 Syncing tags before submission:", tags);
          handleInputChange("tags", tags);
          // Small delay to ensure state update is processed
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Debug logging to see what's being sent
        console.log("📤 Submitting document with data:", {
          ...createFormState,
          tags: createFormState.tags,
          tagsType: typeof createFormState.tags,
          tagsIsArray: Array.isArray(createFormState.tags),
          localTags: tags,
        });

        await createMutation.mutateAsync({
          file: selectedFile!,
          data: createFormState,
        });

        // Reset form
        resetCreateForm();
        setValidationErrors({});
        setTags([]);

        // Call success callback immediately
        onSuccess?.();
      } catch (error) {
        console.error("Document creation error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("document-form");
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
    tags,
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
      setValidationErrors({ file: t("form.file.validation.required") });
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
      setTags([]);

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Document creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile("create", file);
    // Clear file validation error when file is selected
    if (validationErrors.file) {
      const newErrors = { ...validationErrors };
      delete newErrors.file;
      setValidationErrors(newErrors);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile("create", null);
  };

  const handleInputChange = (field: keyof DocumentFormData, value: unknown) => {
    updateFormField("create", field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      handleInputChange("tags", updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    handleInputChange("tags", updatedTags);
  };

  const handleResetForm = () => {
    resetCreateForm();
    setValidationErrors({});
    setTags([]);
  };

  return (
    <div
      className={`document-create-form-root${className ? ` ${className}` : ""}`}
    >
      <div id="document-form">
        {/* Top action bar */}
        <div className="document-create-form-actionbar flex">
          <h3 className="font-16">{t("sections.basicInfo")}</h3>
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
          <div className="document-create-form-loading">
            <InlineLoading description={t("actions.creating")} />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            {/* Title */}
            <TranslatableField
              label={t("form.title.label")}
              value={createFormState.title}
              onChange={(title) => handleInputChange("title", title)}
              placeholder={{
                en: t("form.title.placeholder.en"),
                ne: t("form.title.placeholder.ne"),
              }}
              invalid={!!validationErrors.title}
              invalidText={
                validationErrors.title &&
                typeof validationErrors.title === "object"
                  ? validationErrors.title.en || validationErrors.title.ne
                  : validationErrors.title
              }
              activeTab={titleTab}
              setActiveTab={setTitleTab}
              required
            />

            <div className="document-create-form-section">
              <TranslatableField
                label={t("form.description.label")}
                value={createFormState.description || { en: "", ne: "" }}
                onChange={(description) =>
                  handleInputChange("description", description)
                }
                placeholder={{
                  en: t("form.description.placeholder.en"),
                  ne: t("form.description.placeholder.ne"),
                }}
                multiline
                rows={3}
                invalid={!!validationErrors.description}
                invalidText={
                  validationErrors.description &&
                  typeof validationErrors.description === "object"
                    ? validationErrors.description.en ||
                      validationErrors.description.ne
                    : validationErrors.description
                }
                activeTab={descTab}
                setActiveTab={setDescTab}
              />
            </div>

            <div className="document-create-form-row">
              <Column className="w-50" lg={16} md={4} sm={4}>
                <Select
                  id="category"
                  labelText={t("form.category.label")}
                  value={createFormState.category}
                  onChange={(event) =>
                    handleInputChange("category", event.target.value)
                  }
                  invalid={!!validationErrors.category}
                  invalidText={
                    typeof validationErrors.category === "string"
                      ? validationErrors.category
                      : undefined
                  }
                  required
                >
                  {Object.values(DocumentCategory).map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      text={t(`categories.${category.toLowerCase()}`)}
                    />
                  ))}
                </Select>
              </Column>
              <Column className="w-50" lg={16} md={4} sm={4}>
                <Select
                  id="status"
                  labelText={t("form.status.label")}
                  value={createFormState.status}
                  onChange={(event) =>
                    handleInputChange("status", event.target.value)
                  }
                  invalid={!!validationErrors.status}
                  invalidText={
                    typeof validationErrors.status === "string"
                      ? validationErrors.status
                      : undefined
                  }
                  required
                >
                  {Object.values(DocumentStatus).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      text={t(`status.${status.toLowerCase()}`)}
                    />
                  ))}
                </Select>
              </Column>
            </div>

            <div className="w-100">
              <Column className="w-100" lg={16} md={4} sm={4}>
                <TextInput
                  id="documentNumber"
                  labelText={t("form.documentNumber.label")}
                  value={createFormState.documentNumber}
                  onChange={(event) =>
                    handleInputChange("documentNumber", event.target.value)
                  }
                  placeholder={t("form.documentNumber.placeholder")}
                  invalid={!!validationErrors.documentNumber}
                  invalidText={
                    typeof validationErrors.documentNumber === "string"
                      ? validationErrors.documentNumber
                      : undefined
                  }
                />
              </Column>
            </div>

            <div className="w-100">
              <Column lg={16} md={4} sm={4}>
                <NepaliDatePickerComponent
                  id="publish-date"
                  labelText={t("form.publishDate.label")}
                  placeholder="YYYY/MM/DD"
                  className="w-100"
                  size="lg"
                  value={createFormState.publishDate}
                  onChange={(date) => handleInputChange("publishDate", date)}
                  invalid={!!validationErrors.publishDate}
                  invalidText={validationErrors.publishDate}
                />
              </Column>
            </div>

            <div className="document-create-form-row">
              <Column className="w-100" lg={8} md={4} sm={4}>
                <NumberInput
                  id="order"
                  label={t("form.order.label")}
                  value={createFormState.order}
                  onChange={(event, { value }) => {
                    if (value !== undefined) {
                      handleInputChange("order", value);
                    }
                  }}
                  placeholder={t("form.order.placeholder")}
                  min={0}
                  step={1}
                  size="sm"
                  invalid={!!validationErrors.order}
                  invalidText={
                    typeof validationErrors.order === "string"
                      ? validationErrors.order
                      : undefined
                  }
                />
              </Column>
            </div>

            <div className="document-create-form-file-section">
              <FormGroup legendText={t("sections.file")}>
                {typeof validationErrors.file === "string" && (
                  <div className="document-create-form-file-error">
                    {validationErrors.file}
                  </div>
                )}
                <DocumentUpload
                  currentFile={selectedFile}
                  onUpload={handleFileUpload}
                  onRemove={handleFileRemove}
                  isUploading={createMutation.isPending}
                  showPreview={!!selectedFile}
                  showHeader={false}
                />
              </FormGroup>
            </div>

            <div className="document-create-form-row">
              <Column lg={8} md={4} sm={4}>
                <Toggle
                  id="isPublic"
                  labelText={t("form.isPublic.label")}
                  toggled={createFormState.isPublic}
                  onToggle={(checked) => handleInputChange("isPublic", checked)}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Toggle
                  id="requiresAuth"
                  labelText={t("form.requiresAuth.label")}
                  toggled={createFormState.requiresAuth}
                  onToggle={(checked) =>
                    handleInputChange("requiresAuth", checked)
                  }
                />
              </Column>
            </div>

            <div className="document-create-form-section">
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
