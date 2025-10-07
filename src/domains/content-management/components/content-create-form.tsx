"use client";

import { Reset } from "@carbon/icons-react";
import {
  Button,
  Column,
  Dropdown,
  FormGroup,
  Grid,
  InlineLoading,
  InlineNotification,
  TextInput
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useCategories } from "../hooks/use-category-queries";
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Memoize category items for dropdown
  const categoryItems = categories.map(cat => ({ 
    id: cat.id, 
    label: cat.name?.en || cat.name?.ne || cat.slug || 'Unknown'
  }));

  const selectedCategory = categoryItems.find(cat => cat.id === createFormState.categoryId) || null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!createFormState.title.en.trim() || !createFormState.title.ne.trim()) {
      errors.title = t("validation.titleRequired", {
        default: "Title required (EN/NE)",
      });
    }
    
    if (!createFormState.content.en.trim() || !createFormState.content.ne.trim()) {
      errors.content = t("validation.contentRequired", {
        default: "Content required (EN/NE)",
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
        default: "Order must be 0 or greater" 
      });
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
        const payload: CreateContentRequest = {
          title: { 
            en: createFormState.title.en.trim(), 
            ne: createFormState.title.ne.trim() 
          },
          content: { 
            en: createFormState.content.en.trim(), 
            ne: createFormState.content.ne.trim() 
          },
          excerpt: createFormState.excerpt.en.trim() || createFormState.excerpt.ne.trim() ? {
            en: createFormState.excerpt.en.trim(),
            ne: createFormState.excerpt.ne.trim()
          } : undefined,
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

    const formContainer = document.getElementById('content-form');
    const parentForm = formContainer?.closest('form');
    
    if (parentForm) {
      parentForm.addEventListener('submit', handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener('submit', handleParentFormSubmit);
      };
    }
    return undefined;
  }, [createFormState, createMutation, onSuccess, t, resetCreateForm, setSubmitting]);

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
          ne: createFormState.title.ne.trim() 
        },
        content: { 
          en: createFormState.content.en.trim(), 
          ne: createFormState.content.ne.trim() 
        },
        excerpt: createFormState.excerpt.en.trim() || createFormState.excerpt.ne.trim() ? {
          en: createFormState.excerpt.en.trim(),
          ne: createFormState.excerpt.ne.trim()
        } : undefined,
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
      console.error('Failed to create content:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof createFormState, value: unknown) => {
    updateContentFormField('create', field, value);

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
    { id: 'DRAFT', label: t('status.draft', { default: 'Draft' }) },
    { id: 'PUBLISHED', label: t('status.published', { default: 'Published' }) },
    { id: 'ARCHIVED', label: t('status.archived', { default: 'Archived' }) },
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
            <InlineLoading description={t("actions.creating", { default: "Creating..." })} />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            {/* Basic Information Section */}
            <FormGroup
              legendText=""
            >
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
                invalid={!!validationErrors.title}
                invalidText={validationErrors.title}
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
                  invalid={!!validationErrors.content}
                  invalidText={validationErrors.content}
                />
              </div>
            </FormGroup>

            {/* Category and Settings Section */}
            <FormGroup
              legendText={""}
            >
              <h3 className="section-title section-title-with-margin">{t("sections.categoryAndSettings")}</h3>
               <div className="mb-1">
                <Dropdown
                  id="content-category"
                  items={categoryItems}
                  itemToString={(item) => (item ? item.label : "")}
                  selectedItem={selectedCategory}
                  onChange={({ selectedItem }) => handleInputChange("categoryId", selectedItem?.id || "")}
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
                  selectedItem={statusOptions.find(s => s.id === createFormState.status)}
                  onChange={({ selectedItem }) => handleInputChange("status", selectedItem?.id as ContentStatus)}
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