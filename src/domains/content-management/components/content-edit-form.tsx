"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Column,
  Dropdown,
  FormGroup,
  Grid,
  InlineLoading,
  InlineNotification,
  TextInput,
} from "@carbon/react";
import { useTranslations } from "next-intl";
import { useCategories } from "../hooks/use-category-queries";
import { useLanguageFont } from "@/shared/hooks/use-language-font";
import { useUpdateContent } from "../hooks/use-content-queries";
import { useContentStore } from "../stores/content-store";
import "../styles/content-management.css";
import type {
  Content,
  ContentStatus,
  UpdateContentRequest,
} from "../types/content";
import { TranslatableField } from "@/components/shared/translatable-field";

interface ContentEditFormProps {
  content: Content;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ContentEditForm: React.FC<ContentEditFormProps> = ({
  content,
  onSuccess,
  onCancel,
  className = "",
}) => {
  // For robust per-language validation and focusing
  const [activeTitleLang, setActiveTitleLang] = useState<"en" | "ne">("en");
  const [activeContentLang, setActiveContentLang] = useState<"en" | "ne">("en");
  const titleEnRef = useRef<HTMLInputElement>(null);
  const titleNeRef = useRef<HTMLInputElement>(null);
  const contentEnRef = useRef<HTMLTextAreaElement>(null);
  const contentNeRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations("content-management");
  const tCommon = useTranslations("common");
  const updateMutation = useUpdateContent();

  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    activeFormId,
    updateContentFormField,
    initializeEditForm,
    resetContentFormState,
  } = useContentStore();

  // Initialize store-backed form on mount/content change
  useEffect(() => {
    initializeEditForm(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.id]);

  const formData = formStateById[content.id] ?? {
    title: content.title || { en: "", ne: "" },
    content: content.content || { en: "", ne: "" },
    excerpt: content.excerpt || { en: "", ne: "" },
    slug: content.slug || "",
    categoryId: content.categoryId || "",
    status: content.status || "DRAFT",
    featured: content.featured || false,
    order: content.order || 1,
  };

  // Fetch categories for selection
  const { data: categoriesResponse } = useCategories({ page: 1, limit: 100 });
  const categories = categoriesResponse?.data || [];

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.title.en !== (content.title?.en || "") ||
      formData.title.ne !== (content.title?.ne || "") ||
      formData.content.en !== (content.content?.en || "") ||
      formData.content.ne !== (content.content?.ne || "") ||
      formData.excerpt.en !== (content.excerpt?.en || "") ||
      formData.excerpt.ne !== (content.excerpt?.ne || "") ||
      formData.slug !== (content.slug || "") ||
      formData.categoryId !== (content.categoryId || "") ||
      formData.status !== content.status ||
      formData.featured !== (content.featured || false) ||
      formData.order !== (content.order || 1);

    setHasChanges(hasFormChanges);
  }, [formData, content]);

  // Memoize category items for dropdown, show name in selected language
  const { locale } = useLanguageFont();
  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    label:
      locale === "ne"
        ? cat.name?.ne || cat.name?.en || cat.slug || "Unknown"
        : cat.name?.en || cat.name?.ne || cat.slug || "Unknown",
  }));

  const selectedCategory =
    categoryItems.find((cat) => cat.id === formData.categoryId) || null;

  // Return errors object for immediate use
  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};
    // Per-language title validation
    if (!formData.title.en.trim()) {
      errors.title_en = t("validation.titleRequired", {
        default: "Title required (EN)",
      });
    } else if (formData.title.en.trim().length < 3) {
      errors.title_en = t("validation.titleMinLength", {
        default: "Minimum 3 characters required (EN)",
      });
    }
    if (!formData.title.ne.trim()) {
      errors.title_ne = t("validation.titleRequired", {
        default: "Title required (NE)",
      });
    } else if (formData.title.ne.trim().length < 3) {
      errors.title_ne = t("validation.titleMinLength", {
        default: "Minimum 3 characters required (NE)",
      });
    }
    // Per-language content validation
    if (!formData.content.en.trim()) {
      errors.content_en = t("validation.contentRequired", {
        default: "Content required (EN)",
      });
    }
    if (!formData.content.ne.trim()) {
      errors.content_ne = t("validation.contentRequired", {
        default: "Content required (NE)",
      });
    }
    if (!formData.categoryId) {
      errors.categoryId = t("validation.categoryRequired", {
        default: "Category is required",
      });
    }
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = t("validation.slugFormat", {
        default: "Slug may contain lowercase letters, numbers and hyphens only",
      });
    }
    if (formData.order < 0) {
      errors.order = t("validation.orderRange", {
        default: "Order must be 0 or greater",
      });
    }
    setValidationErrors(errors);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  // Optimize: Use refs to avoid re-registering submit handler on every formData change
  const latestFormData = useRef(formData);
  const latestValidationErrors = useRef(validationErrors);
  useEffect(() => {
    latestFormData.current = formData;
  }, [formData]);
  useEffect(() => {
    latestValidationErrors.current = validationErrors;
  }, [validationErrors]);

  useEffect(() => {
    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setSubmitting(true);

      // Validate and submit the form
      const { valid, errors } = validateForm();
      if (!valid) {
        // Focus title field if invalid, else content field if invalid
        if (errors.title_en) {
          setActiveTitleLang("en");
          setTimeout(() => titleEnRef.current?.focus(), 0);
        } else if (errors.title_ne) {
          setActiveTitleLang("ne");
          setTimeout(() => titleNeRef.current?.focus(), 0);
        } else if (errors.content_en) {
          setActiveContentLang("en");
          setTimeout(() => contentEnRef.current?.focus(), 0);
        } else if (errors.content_ne) {
          setActiveContentLang("ne");
          setTimeout(() => contentNeRef.current?.focus(), 0);
        }
        setSubmitting(false);
        return;
      }
      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        const fd = latestFormData.current;
        const payload: UpdateContentRequest = {
          id: content.id,
          title: {
            en: fd.title.en.trim(),
            ne: fd.title.ne.trim(),
          },
          content: {
            en: fd.content.en.trim(),
            ne: fd.content.ne.trim(),
          },
          excerpt:
            fd.excerpt.en.trim() || fd.excerpt.ne.trim()
              ? {
                  en: fd.excerpt.en.trim(),
                  ne: fd.excerpt.ne.trim(),
                }
              : undefined,
          slug: fd.slug.trim() || undefined,
          categoryId: fd.categoryId,
          status: fd.status,
          featured: fd.featured,
          order: fd.order,
        };

        await updateMutation.mutateAsync({ id: content.id, data: payload });

        setValidationErrors({});

        onSuccess?.();
      } catch (error) {
        console.error("Content update error:", error);
      } finally {
        setSubmitting(false);
      }
    };

    const formContainer = document.getElementById("content-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [updateMutation, onSuccess, content.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      const payload: UpdateContentRequest = {
        id: content.id,
        title: {
          en: formData.title.en.trim(),
          ne: formData.title.ne.trim(),
        },
        content: {
          en: formData.content.en.trim(),
          ne: formData.content.ne.trim(),
        },
        excerpt:
          formData.excerpt.en.trim() || formData.excerpt.ne.trim()
            ? {
                en: formData.excerpt.en.trim(),
                ne: formData.excerpt.ne.trim(),
              }
            : undefined,
        slug: formData.slug.trim() || undefined,
        categoryId: formData.categoryId,
        status: formData.status,
        featured: formData.featured,
        order: formData.order,
      };

      await updateMutation.mutateAsync({ id: content.id, data: payload });

      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("❌ Content update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: unknown) => {
    updateContentFormField(content.id, field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    resetContentFormState(content.id);
    setValidationErrors({});
  };

  // Status options for dropdown
  const statusOptions = [
    { id: "DRAFT", label: t("status.draft", { default: "Draft" }) },
    { id: "PUBLISHED", label: t("status.published", { default: "Published" }) },
    { id: "ARCHIVED", label: t("status.archived", { default: "Archived" }) },
  ];

  return (
    <div>
      <div id="content-form">
        {isSubmitting && (
          <div className="submitting-indicator">
            <InlineLoading
              description={t("actions.updating", { default: "Updating..." })}
            />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            {/* Basic Information Section */}
            <FormGroup legendText={""}>
              <h3 className="section-title edit-section-title">
                {t("sections.basicInfo")}
              </h3>
              <TranslatableField
                label={t("form.title.label", { default: "Title" })}
                value={formData.title}
                onChange={(title) => handleInputChange("title", title)}
                placeholder={{
                  en: t("form.title.placeholder.en", {
                    default: "Enter title in English",
                  }),
                  ne: t("form.title.placeholder.ne", {
                    default: "Enter title in Nepali",
                  }),
                }}
                required
                activeTab={activeTitleLang}
                setActiveTab={setActiveTitleLang}
                invalid={
                  !!validationErrors.title_en || !!validationErrors.title_ne
                }
                invalidText={
                  validationErrors.title_en || validationErrors.title_ne
                }
              />

              {/* <div style={{ marginTop: "1rem" }}>
                  <TranslatableField
                    label={t("form.excerpt.label", { default: "Excerpt" })}
                    value={formData.excerpt}
                    onChange={(excerpt) => handleInputChange("excerpt", excerpt)}
                    placeholder={{
                      en: t("form.excerpt.placeholder.en", {
                        default: "Enter excerpt in English",
                      }),
                      ne: t("form.excerpt.placeholder.ne", {
                        default: "Enter excerpt in Nepali",
                      }),
                    }}
                    type="textarea"
                    rows={3}
                  />
                </div> */}

              <div className="mt-1">
                <TextInput
                  id="content-slug"
                  labelText={t("form.slug.label", { default: "Slug" })}
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder={t("form.slug.placeholder", {
                    default: "auto-generated-slug",
                  })}
                  helperText={t("form.slug.helperText", {
                    default: "Leave empty for auto-generation",
                  })}
                  invalid={!!validationErrors.slug}
                  invalidText={validationErrors.slug}
                />
              </div>

              <div className="mt-1">
                <TranslatableField
                  label={t("form.content.label", { default: "Content" })}
                  value={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                  placeholder={{
                    en: t("form.content.placeholder.en", {
                      default: "Enter content in English",
                    }),
                    ne: t("form.content.placeholder.ne", {
                      default: "Enter content in Nepali",
                    }),
                  }}
                  multiline
                  rows={8}
                  required
                  activeTab={activeContentLang}
                  setActiveTab={setActiveContentLang}
                  invalid={
                    !!validationErrors.content_en ||
                    !!validationErrors.content_ne
                  }
                  invalidText={
                    validationErrors.content_en || validationErrors.content_ne
                  }
                />
              </div>
            </FormGroup>

            {/* Category and Settings Section */}
            <FormGroup legendText={""}>
              <h3 className="section-title section-title-with-margin">
                {t("sections.categoryAndSettings")}
              </h3>

              <div className="mb-1">
                <Dropdown
                  id="content-category"
                  items={categoryItems}
                  itemToString={(item) => (item ? item.label : "")}
                  selectedItem={selectedCategory}
                  onChange={({ selectedItem }) =>
                    handleInputChange("categoryId", selectedItem?.id || "")
                  }
                  label={t("form.category.label", { default: "Category" })}
                  titleText={t("form.category.label", { default: "Category" })}
                  invalid={!!validationErrors.categoryId}
                  invalidText={validationErrors.categoryId}
                />
              </div>

              <div className="mb-1">
                <Dropdown
                  id="content-status"
                  items={statusOptions}
                  itemToString={(item) => (item ? item.label : "")}
                  selectedItem={statusOptions.find(
                    (s) => s.id === formData.status
                  )}
                  onChange={({ selectedItem }) =>
                    handleInputChange(
                      "status",
                      selectedItem?.id as ContentStatus
                    )
                  }
                  label={t("form.status.label", { default: "Status" })}
                  titleText={t("form.status.label", {
                    default: "Publication status",
                  })}
                />
              </div>

              {/* <div style={{ marginBottom: "1rem" }}>
                  <Toggle
                    id="content-featured"
                    labelText={t("form.featured.label", {
                      default: "Featured Content",
                    })}
                    toggled={formData.featured}
                    onToggle={(checked) => handleInputChange("featured", checked)}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <NumberInput
                    id="content-order"
                    label={t("form.order.label", { default: "Display Order" })}
                    value={formData.order}
                    onChange={(event, { value }) => {
                      if (value !== undefined) {
                        handleInputChange("order", value);
                      }
                    }}
                    min={0}
                    step={1}
                    invalid={!!validationErrors.order}
                    invalidText={validationErrors.order}
                    helperText={t("form.order.helperText", {
                      default: "Lower numbers appear first",
                    })}
                  />
                </div> */}
            </FormGroup>
          </Column>
        </Grid>

        {updateMutation.isError && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle="Failed to update content. Please try again."
            className="notification-mt-1"
          />
        )}
      </div>
    </div>
  );
};
