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
  DatePicker,
  DatePickerInput,
  DismissibleTag,
  TextInput,
} from "@carbon/react";
import {
  Add,
  Reset,
  TrashCan,
  Document as DocumentIcon,
} from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";

import { DocumentUpload } from "./document-upload";
import {
  Document as DocumentType,
  DocumentFormData,
  DocumentCategory,
  DocumentStatus,
} from "../types/document";
import { useDocumentStore } from "../stores/document-store";
import {
  useUpdateDocument,
  useCreateDocumentVersion,
} from "../hooks/use-document-queries";

interface DocumentEditFormProps {
  document: DocumentType;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const DocumentEditForm: React.FC<DocumentEditFormProps> = ({
  document,
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("documents");
  const updateMutation = useUpdateDocument();
  const createVersionMutation = useCreateDocumentVersion();

  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    updateFormFieldById,
    selectedFileById,
    setSelectedFileById,
    resetFormState,
  } = useDocumentStore();

  // Get the form state for this specific document
  const formState = formStateById[document.id];

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [tags, setTags] = useState<string[]>(
    formState?.tags || document.tags || []
  );
  const [newTag, setNewTag] = useState<string>("");
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [newVersion, setNewVersion] = useState<string>("");
  const [changeLog, setChangeLog] = useState<{ en: string; ne: string }>({
    en: "",
    ne: "",
  });

  // Initialize form state if not exists
  useEffect(() => {
    if (!formState) {
      // This should be handled by the store, but as a fallback
      const initialFormState: DocumentFormData = {
        title: document.title || { en: "", ne: "" },
        description: document.description || { en: "", ne: "" },
        category: document.category,
        status: document.status,
        documentNumber: document.documentNumber || "",
        version: document.version || "1.0",
        publishDate: document.publishDate
          ? new Date(document.publishDate)
          : undefined,
        expiryDate: document.expiryDate
          ? new Date(document.expiryDate)
          : undefined,
        tags: document.tags || [],
        isPublic: document.isPublic,
        requiresAuth: document.requiresAuth,
        order: document.order,
        isActive: document.isActive,
      };

      // Update the store with initial form state
      updateFormFieldById(document.id, "title", initialFormState.title);
      updateFormFieldById(
        document.id,
        "description",
        initialFormState.description
      );
      updateFormFieldById(document.id, "category", initialFormState.category);
      updateFormFieldById(document.id, "status", initialFormState.status);
      updateFormFieldById(
        document.id,
        "documentNumber",
        initialFormState.documentNumber
      );
      updateFormFieldById(document.id, "version", initialFormState.version);
      updateFormFieldById(
        document.id,
        "publishDate",
        initialFormState.publishDate
      );
      updateFormFieldById(
        document.id,
        "expiryDate",
        initialFormState.expiryDate
      );
      updateFormFieldById(document.id, "tags", initialFormState.tags);
      updateFormFieldById(document.id, "isPublic", initialFormState.isPublic);
      updateFormFieldById(
        document.id,
        "requiresAuth",
        initialFormState.requiresAuth
      );
      updateFormFieldById(document.id, "order", initialFormState.order);
      updateFormFieldById(document.id, "isActive", initialFormState.isActive);
    }
  }, [document.id, formState, updateFormFieldById]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate title
    if (!formState?.title?.en?.trim()) {
      errors.title = t("form.title.validation.required");
    }
    if (!formState?.title?.ne?.trim()) {
      errors.title = t("form.title.validation.required");
    }

    // Validate category
    if (!formState?.category) {
      errors.category = t("form.category.validation.required");
    }

    // Validate status
    if (!formState?.status) {
      errors.status = t("form.status.validation.required");
    }

    // Validate order
    if (formState?.order !== undefined && formState.order < 0) {
      errors.order = t("form.order.validation.minimum");
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
      if (!formState) return;

      console.log("📝 DocumentEditForm submitting formState:", formState);
      console.log("📝 DocumentEditForm date fields:", {
        publishDate: formState.publishDate,
        publishDateType: typeof formState.publishDate,
        publishDateIsDate: formState.publishDate instanceof Date,
        expiryDate: formState.expiryDate,
        expiryDateType: typeof formState.expiryDate,
        expiryDateIsDate: formState.expiryDate instanceof Date,
      });

      // Prepare data with Date objects for API
      const submissionData = {
        ...formState,
        publishDate:
          formState.publishDate instanceof Date &&
          !isNaN(formState.publishDate.getTime())
            ? formState.publishDate
            : undefined,
        expiryDate:
          formState.expiryDate instanceof Date &&
          !isNaN(formState.expiryDate.getTime())
            ? formState.expiryDate
            : undefined,
      };

      // Remove undefined date fields
      if (submissionData.publishDate === undefined) {
        delete submissionData.publishDate;
      }
      if (submissionData.expiryDate === undefined) {
        delete submissionData.expiryDate;
      }

      console.log("📝 DocumentEditForm final submission data:", submissionData);

      try {
        await updateMutation.mutateAsync({
          id: document.id,
          data: submissionData,
        });

        // Call success callback immediately
        onSuccess?.();
      } catch (error) {
        console.error("Document update error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = globalThis.document.getElementById("document-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [formState, updateMutation, onSuccess, t, setSubmitting, document.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    if (!formState) {
      setSubmitting(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: document.id,
        data: formState,
      });

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Document update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DocumentFormData, value: unknown) => {
    updateFormFieldById(document.id, field, value);

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
    resetFormState(document.id);
    setValidationErrors({});
    setTags(document.tags || []);
  };

  const handleCreateVersion = async () => {
    if (!newVersion.trim() || !selectedFileById[document.id]) {
      return;
    }

    try {
      await createVersionMutation.mutateAsync({
        documentId: document.id,
        file: selectedFileById[document.id]!,
        version: newVersion,
        changeLog: changeLog.en || changeLog.ne ? changeLog : undefined,
      });

      // Reset version form
      setShowVersionForm(false);
      setNewVersion("");
      setChangeLog({ en: "", ne: "" });
      setSelectedFileById(document.id, null);
    } catch (error) {
      console.error("Version creation error:", error);
    }
  };

  // If form state is not ready, show loading
  if (!formState) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div>
      <div id="document-form">
        {/* Top action bar */}
        <div className="document-edit-form-actionbar">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={DocumentIcon}
            onClick={() => setShowVersionForm(!showVersionForm)}
            disabled={isSubmitting || updateMutation.isPending}
          >
            {showVersionForm
              ? t("actions.hideVersionForm")
              : t("actions.createVersion")}
          </Button>

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
          <div className="document-edit-form-loading">
            <InlineLoading description={t("actions.updating")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Title */}
            <TranslatableField
              label={t("form.title.label")}
              value={formState.title}
              onChange={(title) => handleInputChange("title", title)}
              placeholder={{
                en: t("form.title.placeholder.en"),
                ne: t("form.title.placeholder.ne"),
              }}
              invalid={!!validationErrors.title}
              invalidText={validationErrors.title}
              required
            />

            {/* Description */}
            <TranslatableField
              label={t("form.description.label")}
              value={formState.description || { en: "", ne: "" }}
              onChange={(description) =>
                handleInputChange("description", description)
              }
              placeholder={{
                en: t("form.description.placeholder.en"),
                ne: t("form.description.placeholder.ne"),
              }}
              type="textarea"
            />

            {/* Category and Status */}
            <div className="document-edit-form-row">
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="category"
                  labelText={t("form.category.label")}
                  value={formState.category}
                  onChange={(event) =>
                    handleInputChange("category", event.target.value)
                  }
                  invalid={!!validationErrors.category}
                  invalidText={validationErrors.category}
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

              <Column lg={8} md={4} sm={4}>
                <Select
                  id="status"
                  labelText={t("form.status.label")}
                  value={formState.status}
                  onChange={(event) =>
                    handleInputChange("status", event.target.value)
                  }
                  invalid={!!validationErrors.status}
                  invalidText={validationErrors.status}
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

            {/* Document Number and Version */}
            <div className="document-edit-form-row">
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="documentNumber"
                  labelText={t("form.documentNumber.label")}
                  value={formState.documentNumber}
                  onChange={(event) =>
                    handleInputChange("documentNumber", event.target.value)
                  }
                  placeholder={t("form.documentNumber.placeholder")}
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="version"
                  labelText={t("form.version.label")}
                  value={formState.version}
                  onChange={(event) =>
                    handleInputChange("version", event.target.value)
                  }
                  placeholder={t("form.version.placeholder")}
                />
              </Column>
            </div>

            {/* Publish Date and Expiry Date */}
            <div className="document-edit-form-row">
              <Column lg={8} md={4} sm={4}>
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  value={formState.publishDate}
                  onChange={(dates) =>
                    handleInputChange("publishDate", dates[0])
                  }
                >
                  <DatePickerInput
                    id="publishDate"
                    labelText={t("form.publishDate.label")}
                    placeholder="YYYY-MM-DD"
                    className="document-edit-form-date-input"
                  />
                </DatePicker>
              </Column>

              <Column lg={8} md={4} sm={4}>
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  value={formState.expiryDate}
                  onChange={(dates) =>
                    handleInputChange("expiryDate", dates[0])
                  }
                >
                  <DatePickerInput
                    id="expiryDate"
                    labelText={t("form.expiryDate.label")}
                    placeholder="YYYY-MM-DD"
                    className="document-edit-form-date-input"
                  />
                </DatePicker>
              </Column>
            </div>

            {/* Order */}
            <div className="document-edit-form-row">
              <NumberInput
                id="order"
                label={t("form.order.label")}
                value={formState.order}
                onChange={(event, { value }) => {
                  if (value !== undefined) {
                    handleInputChange("order", value);
                  }
                }}
                min={0}
                step={1}
                invalid={!!validationErrors.order}
                invalidText={validationErrors.order}
              />
            </div>

            {/* Tags */}
            <div className="document-edit-form-section">
              <FormGroup legendText={t("form.tags.label")}>
                <div className="document-edit-form-tags-row">
                  <TextInput
                    id="newTag"
                    labelText=""
                    value={newTag}
                    onChange={(event) => setNewTag(event.target.value)}
                    placeholder={t("form.tags.placeholder")}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={Add}
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    {t("form.tags.addTag")}
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="document-edit-form-tags-list">
                    {tags.map((tag, index) => (
                      <DismissibleTag
                        key={index}
                        type="blue"
                        size="sm"
                        onClose={() => handleRemoveTag(tag)}
                      >
                        {tag}
                      </DismissibleTag>
                    ))}
                  </div>
                )}
              </FormGroup>
            </div>

            {/* Version Creation Form */}
            {showVersionForm && (
              <div className="document-edit-form-version-section">
                <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>
                  {t("form.createVersion.title")}
                </h4>
                <div className="document-edit-form-version-row">
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="newVersion"
                      labelText={t("form.createVersion.version")}
                      value={newVersion}
                      onChange={(event) => setNewVersion(event.target.value)}
                      placeholder="2.0"
                    />
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="changeLog"
                      labelText={t("form.createVersion.changeLog")}
                      value={changeLog.en}
                      onChange={(event) =>
                        setChangeLog({ ...changeLog, en: event.target.value })
                      }
                      placeholder={t("form.createVersion.changeLogPlaceholder")}
                    />
                  </Column>
                </div>
                <DocumentUpload
                  currentFile={selectedFileById[document.id]}
                  onUpload={(file) => setSelectedFileById(document.id, file)}
                  onRemove={() => setSelectedFileById(document.id, null)}
                  isUploading={createVersionMutation.isPending}
                  showPreview={!!selectedFileById[document.id]}
                  showHeader={false}
                />
                <div className="document-edit-form-version-actions">
                  <Button
                    kind="primary"
                    size="sm"
                    onClick={handleCreateVersion}
                    disabled={
                      !newVersion.trim() ||
                      !selectedFileById[document.id] ||
                      createVersionMutation.isPending
                    }
                  >
                    {createVersionMutation.isPending
                      ? t("actions.creating")
                      : t("actions.createVersion")}
                  </Button>
                  <Button
                    kind="secondary"
                    size="sm"
                    onClick={() => setShowVersionForm(false)}
                  >
                    {t("actions.cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="document-edit-form-section">
              <div className="document-edit-form-toggles">
                <Toggle
                  id="isPublic"
                  labelText={t("form.isPublic.label")}
                  toggled={formState.isPublic}
                  onToggle={(checked) => handleInputChange("isPublic", checked)}
                />
                <Toggle
                  id="requiresAuth"
                  labelText={t("form.requiresAuth.label")}
                  toggled={formState.requiresAuth}
                  onToggle={(checked) =>
                    handleInputChange("requiresAuth", checked)
                  }
                />
                <Toggle
                  id="isActive"
                  labelText={t("form.isActive.label")}
                  toggled={formState.isActive}
                  onToggle={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
