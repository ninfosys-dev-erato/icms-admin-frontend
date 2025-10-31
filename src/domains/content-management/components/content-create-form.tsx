"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Reset } from "@carbon/icons-react";
import {
  Button,
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
import { useCreateContent } from "../hooks/use-content-queries";
import { useContentStore } from "../stores/content-store";
import "../styles/content-management.css";
import type { ContentStatus, CreateContentRequest } from "../types/content";
import { TranslatableField } from "@/components/shared/translatable-field";

interface ContentCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ContentCreateForm: React.FC<ContentCreateFormProps> = ({
  onSuccess,
  onCancel,
  className = "",
}) => {
  // For robust per-language validation and focusing
  const [activeTitleTab, setActiveTitleTab] = useState<"en" | "ne">("en");
  const [activeContentTab, setActiveContentTab] = useState<"en" | "ne">("en");
  const [activeDescriptionTab, setActiveDescriptionTab] = useState<"en" | "ne">(
    "en"
  );
  const titleEnRef = useRef<HTMLInputElement>(null);
  const titleNeRef = useRef<HTMLInputElement>(null);
  const contentEnRef = useRef<HTMLTextAreaElement>(null);
  const contentNeRef = useRef<HTMLTextAreaElement>(null);
  const descriptionEnRef = useRef<HTMLTextAreaElement>(null);
  const descriptionNeRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations("content-management");
  const tCommon = useTranslations("common");
  const createMutation = useCreateContent();

  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateContentFormField,
    resetCreateForm,
  } = useContentStore();

  // Fetch categories for selection
  const { data: categoriesResponse } = useCategories({ page: 1, limit: 100 });
  const categories = categoriesResponse?.data || [];

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Get current language
  const { locale } = useLanguageFont();

  // Memoize category items for dropdown, show name in selected language
  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    label:
      locale === "ne"
        ? cat.name?.ne || cat.name?.en || cat.slug || "Unknown"
        : cat.name?.en || cat.name?.ne || cat.slug || "Unknown",
  }));

  const selectedCategory =
    categoryItems.find((cat) => cat.id === createFormState.categoryId) || null;

  // Return errors object for immediate use
  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};
    // Per-language title validation
    if (!createFormState.title.ne.trim()) {
      errors.title_ne = t("validation.titleRequired", {
        default: "Title required (NE)",
      });
    } else if (createFormState.title.ne.trim().length < 3) {
      errors.title_ne = t("validation.titleMinLength", {
        default: "Minimum 3 characters required (NE)",
      });
    }
    if (!createFormState.title.en.trim()) {
      errors.title_en = t("validation.titleRequired", {
        default: "Title required (EN)",
      });
    } else if (createFormState.title.en.trim().length < 3) {
      errors.title_en = t("validation.titleMinLength", {
        default: "Minimum 3 characters required (EN)",
      });
    }
    // Per-language content validation
    if (!createFormState.content.ne.trim()) {
      errors.content_ne = t("validation.contentRequired", {
        default: "Content required (NE)",
      });
    }
    if (!createFormState.content.en.trim()) {
      errors.content_en = t("validation.contentRequired", {
        default: "Content required (EN)",
      });
    }
    // Per-language description validation
    if (!createFormState.seoDescription.ne.trim()) {
      errors.description_ne = t("validation.descriptionRequired", {
        default: "Description required (NE)",
      });
    }
    if (!createFormState.seoDescription.en.trim()) {
      errors.description_en = t("validation.descriptionRequired", {
        default: "Description required (EN)",
      });
    }
    if (!createFormState.categoryId) {
      errors.categoryId = t("validation.categoryRequired", {
        default: "Category is required",
      });
    }
    if (createFormState.slug && !/^[a-z0-9-]+$/.test(createFormState.slug)) {
      errors.slug = t("validation.slugFormat", {
        default: "Slug may contain lowercase letters, numbers and hyphens only",
      });
    }
    if (createFormState.order < 0) {
      errors.order = t("validation.orderRange", {
        default: "Order must be 0 or greater",
      });
    }
    setValidationErrors(errors);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  // Listen for form submission from the parent CreateSidePanel
  useEffect(() => {
    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setSubmitting(true);

      // Validate and submit the form
      const { valid, errors } = validateForm();
      if (!valid) {
        // Focus Nepali title first, then English, then Nepali content, then English content
        if (errors.title_ne) {
          setActiveTitleTab("ne");
          setTimeout(() => {
            const el = document.getElementById("title-ne");
            if (el) el.focus();
          }, 100);
        } else if (errors.title_en) {
          setActiveTitleTab("en");
          setTimeout(() => {
            const el = document.getElementById("title-en");
            if (el) el.focus();
          }, 100);
        } else if (errors.content_ne) {
          setActiveContentTab("ne");
          setTimeout(() => {
            const el = document.getElementById("content-ne");
            if (el) el.focus();
          }, 100);
        } else if (errors.content_en) {
          setActiveContentTab("en");
          setTimeout(() => {
            const el = document.getElementById("content-en");
            if (el) el.focus();
          }, 100);
        } else if (errors.description_ne) {
          setActiveDescriptionTab("ne");
          setTimeout(() => {
            const el = document.getElementById("description-ne");
            if (el) el.focus();
          }, 100);
        } else if (errors.description_en) {
          setActiveDescriptionTab("en");
          setTimeout(() => {
            const el = document.getElementById("description-en");
            if (el) el.focus();
          }, 100);
        }
        setSubmitting(false);
        return;
      }
      handleFormSubmission();
    };

    const handleFormSubmission = async () => {
      try {
        const payload: CreateContentRequest = {
          title: {
            en: createFormState.title.en.trim(),
            ne: createFormState.title.ne.trim(),
          },
          content: {
            en: createFormState.content.en.trim(),
            ne: createFormState.content.ne.trim(),
          },
          excerpt:
            createFormState.excerpt.en.trim() ||
            createFormState.excerpt.ne.trim()
              ? {
                  en: createFormState.excerpt.en.trim(),
                  ne: createFormState.excerpt.ne.trim(),
                }
              : undefined,
          slug: createFormState.slug.trim() || undefined,
          categoryId: createFormState.categoryId,
          status: createFormState.status,
          featured: createFormState.featured,
          order: createFormState.order,
        };

        await createMutation.mutateAsync(payload);

        // Reset form
        resetCreateForm();
        setValidationErrors({});

        // Call success callback immediately
        onSuccess?.();
      } catch (error) {
        console.error("Content creation error:", error);
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
      const payload: CreateContentRequest = {
        title: {
          en: createFormState.title.en.trim(),
          ne: createFormState.title.ne.trim(),
        },
        content: {
          en: createFormState.content.en.trim(),
          ne: createFormState.content.ne.trim(),
        },
        excerpt:
          createFormState.excerpt.en.trim() || createFormState.excerpt.ne.trim()
            ? {
                en: createFormState.excerpt.en.trim(),
                ne: createFormState.excerpt.ne.trim(),
              }
            : undefined,
        slug: createFormState.slug.trim() || undefined,
        categoryId: createFormState.categoryId,
        status: createFormState.status,
        featured: createFormState.featured,
        order: createFormState.order,
      };

      await createMutation.mutateAsync(payload);

      // Reset form
      resetCreateForm();
      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof createFormState,
    value: unknown
  ) => {
    updateContentFormField("create", field, value);

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

  // Status options for dropdown
  const statusOptions = [
    { id: "DRAFT", label: t("status.draft", { default: "Draft" }) },
    { id: "PUBLISHED", label: t("status.published", { default: "Published" }) },
    { id: "ARCHIVED", label: t("status.archived", { default: "Archived" }) },
  ];

  return (
    <div>
      <div id="content-form">
        {/* Top action bar */}
        <div className="section-header-row">
          <h3 className="section-title">{t("sections.basicInfo")}</h3>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleResetForm}
            disabled={isSubmitting || createMutation.isPending}
          >
            {tCommon("reset", { default: "Reset" })}
          </Button>
        </div>

        {isSubmitting && (
          <div className="submitting-indicator">
            <InlineLoading
              description={t("actions.creating", { default: "Creating..." })}
            />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            {/* Basic Information Section */}
            <FormGroup legendText="">
              <TranslatableField
                label={t("form.title.label", { default: "Title" })}
                value={createFormState.title}
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
                activeTab={activeTitleTab}
                setActiveTab={setActiveTitleTab}
                invalid={
                  !!validationErrors.title_en || !!validationErrors.title_ne
                }
                invalidText={
                  validationErrors.title_en || validationErrors.title_ne
                }
              />

              <div className="mt-1">
                <TextInput
                  id="content-slug"
                  labelText={t("form.slug.label", { default: "Slug" })}
                  value={createFormState.slug}
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
                  value={createFormState.content}
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
                  activeTab={activeContentTab}
                  setActiveTab={setActiveContentTab}
                  invalid={
                    !!validationErrors.content_en ||
                    !!validationErrors.content_ne
                  }
                  invalidText={
                    validationErrors.content_en || validationErrors.content_ne
                  }
                />
              </div>

              {createFormState.seoDescription && (
                <div className="mt-1">
                  <TranslatableField
                    label={t("form.description.label", {
                      default: "Description",
                    })}
                    value={createFormState.seoDescription}
                    onChange={(desc) =>
                      handleInputChange("seoDescription", desc)
                    }
                    placeholder={{
                      en: t("form.description.placeholder.en", {
                        default: "Enter description in English",
                      }),
                      ne: t("form.description.placeholder.ne", {
                        default: "Enter description in Nepali",
                      }),
                    }}
                    multiline
                    rows={4}
                    required
                    activeTab={activeDescriptionTab}
                    setActiveTab={setActiveDescriptionTab}
                    invalid={
                      !!validationErrors.description_en ||
                      !!validationErrors.description_ne
                    }
                    invalidText={
                      validationErrors.description_en ||
                      validationErrors.description_ne
                    }
                  />
                </div>
              )}
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
                  id="content-category"
                  items={statusOptions}
                  itemToString={(item) => (item ? item.label : "")}
                  selectedItem={statusOptions.find(
                    (s) => s.id === createFormState.status
                  )}
                  onChange={({ selectedItem }) =>
                    handleInputChange(
                      "status",
                      selectedItem?.id as ContentStatus
                    )
                  }
                  label={t("form.status.label", { default: "Status" })}
                  titleText={t("form.status.label", { default: "Status" })}
                />
              </div>

              {/* <div style={{ marginBottom: "1rem" }}>
                <Toggle
                  id="content-featured"
                  labelText={t("form.featured.label", {
                    default: "Featured Content",
                  })}
                  toggled={createFormState.featured}
                  onToggle={(checked) => handleInputChange("featured", checked)}
                />
              </div> */}

              {/* <div style={{ marginBottom: "1rem" }}>
                <NumberInput
                  id="content-order"
                  label={t("form.order.label", { default: "Display Order" })}
                  value={createFormState.order}
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

        {createMutation.isError && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle="Failed to create content. Please try again."
            className="notification-mt-1"
          />
        )}
      </div>
    </div>
  );
};
