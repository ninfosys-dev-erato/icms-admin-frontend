"use client";

import { Reset } from "@carbon/icons-react";
import {
  Button,
  Column,
  Dropdown,
  FormGroup,
  Grid,
  NumberInput,
  TextInput,
  Toggle,
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/use-category-queries";
import { useContentStore } from "../../stores/content-store";
import type { Category, CreateCategoryRequest } from "../../types/content";
import { TranslatableField } from "../translatable-field";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: Category | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = React.memo(({
  mode,
  category,
  onSuccess,
  onCancel,
}) => {
  const t = useTranslations("content-management");
  const tCommon = useTranslations("common");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  
  const { 
    setSubmitting,
    activeFormId,
    categoryFormById,
    createCategoryForm,
    updateCategoryFormField,
    resetCategoryFormState
  } = useContentStore();

  // Get form state from store - memoize to prevent unnecessary re-renders
  const formId = useMemo(() => 
    mode === 'create' ? 'create' : (category?.id || 'create'), 
    [mode, category?.id]
  );
  
  const form = useMemo(() => 
    mode === 'create' 
      ? createCategoryForm 
      : (categoryFormById[formId] || createCategoryForm),
    [mode, createCategoryForm, categoryFormById, formId]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing category data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && category && category.id) {
      // Initialize form fields with category data
      updateCategoryFormField(formId, 'name', category.name || { en: '', ne: '' });
      updateCategoryFormField(formId, 'slug', category.slug || '');
      updateCategoryFormField(formId, 'description', category.description || { en: '', ne: '' });
      updateCategoryFormField(formId, 'parentId', category.parentId || '');
      updateCategoryFormField(formId, 'order', category.order || 0);
      updateCategoryFormField(formId, 'isActive', category.isActive ?? true);
    }
  }, [mode, category, formId, updateCategoryFormField]);

  // Memoize query params and parent items to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const categoriesQuery = useCategories(queryParams);
  
  const parentItems = useMemo(() => 
    (categoriesQuery.data?.data ?? [])
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ id: c.id, label: c.name.en || c.name.ne || 'Unnamed' })),
    [categoriesQuery.data?.data, category?.id]
  );
  
  const selectedParentItem = useMemo(() =>
    parentItems.find((i) => i.id === form.parentId) || null,
    [parentItems, form.parentId]
  );

  // Memoize form field handlers to prevent child re-renders
  const handleNameChange = useCallback((value: { en: string; ne: string }) => {
    updateCategoryFormField(formId, 'name', value);
  }, [formId, updateCategoryFormField]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateCategoryFormField(formId, 'slug', e.target.value);
  }, [formId, updateCategoryFormField]);

  const handleParentChange = useCallback(({ selectedItem }: any) => {
    updateCategoryFormField(formId, 'parentId', selectedItem?.id || '');
  }, [formId, updateCategoryFormField]);

  const handleOrderChange = useCallback((e: any, { value }: any) => {
    if (value !== undefined) {
      updateCategoryFormField(formId, 'order', Number(value));
    }
  }, [formId, updateCategoryFormField]);

  const handleActiveChange = useCallback((checked: boolean) => {
    updateCategoryFormField(formId, 'isActive', checked);
  }, [formId, updateCategoryFormField]);

  const handleResetForm = useCallback(() => {
    resetCategoryFormState(formId);
    setErrors({});
  }, [formId, resetCategoryFormState]);

  // Memoize validation logic
  const validateForm = useCallback((formData: any) => {
    const errs: Record<string, string> = {};
    if (!formData.name.en.trim() || !formData.name.ne.trim()) {
      errs.name = t("validation.categoryNameRequired", {
        default: "Category name required (EN/NE)",
      });
    }
    const slugTrim = (formData.slug || "").trim();
    if (slugTrim && !/^[a-z0-9-]+$/.test(slugTrim)) {
      errs.slug = t("validation.slugRequired", {
        default: "Slug may contain lowercase letters, numbers and hyphens only",
      });
    }
    if (formData.order < 0) {
      errs.order = t("validation.priorityRange", { default: "Invalid order" });
    }
    return errs;
  }, [t]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    
    const errs = validateForm(form);
    setErrors(errs);
    
    if (Object.keys(errs).length > 0) {
      setSubmitting(false);
      return;
    }

    try {
      const payload: CreateCategoryRequest &
        Partial<{
          slug: string;
          description: { en: string; ne: string };
          parentId: string;
        }> = {
        name: { en: form.name.en.trim(), ne: form.name.ne.trim() },
        order: Number(form.order) || 1,
        isActive: !!form.isActive,
      };
      
      const slugTrim = (form.slug || "").trim();
      if (slugTrim) payload.slug = slugTrim;
      
      const hasDesc =
        form.description?.en?.trim() ||
        form.description?.ne?.trim();
      if (hasDesc) {
        payload.description = {
          en: (form.description?.en || "").trim(),
          ne: (form.description?.ne || "").trim(),
        };
      }
      
      if (form.parentId) payload.parentId = form.parentId;

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: { ...payload, id: category.id } as any,
        });
      }
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  }, [
    category,
    createMutation,
    form,
    mode,
    onSuccess,
    setSubmitting,
    updateMutation,
    validateForm,
  ]);

  // Memoize form submission handler
  const handleFormSubmit = useCallback((e: Event) => {
    e.preventDefault();
    submit();
  }, [submit]);

  useEffect(() => {
    // Find the parent form and listen for submit events
    const formContainer = document.getElementById('content-form');
    const parentForm = formContainer?.closest('form');
    
    if (parentForm) {
      parentForm.addEventListener('submit', handleFormSubmit);
      return () => {
        parentForm.removeEventListener('submit', handleFormSubmit);
      };
    }
    
    // Return undefined cleanup function if no form found
    return undefined;
  }, [handleFormSubmit]);

  // Memoize the form JSX to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <Grid fullWidth>
      <Column lg={16} md={8} sm={4}>
        <FormGroup
          legendText={t("categories.sections.basicInfo", {
            default: "Basic Information",
          })}
        >
          <TranslatableField
            label={t("categories.form.name.label", { default: "Name" })}
            value={form.name}
            onChange={handleNameChange}
            placeholder={{
              en: t("categories.form.name.placeholder.en", {
                default: "English",
              }),
              ne: t("categories.form.name.placeholder.ne", {
                default: "नेपाली",
              }),
            }}
            required
            invalid={!!errors.name}
            invalidText={errors.name}
          />

          <div className="mt-1">
            <TextInput
              id="category-slug"
              labelText={t("form.slug.label", { default: "Slug" })}
              value={form.slug || ""}
              onChange={handleSlugChange}
              placeholder={t("form.slug.placeholder", {
                default: "Enter URL-friendly slug",
              })}
            />
          </div>

          <div className="mt-1">
            <Dropdown
              id="category-parent"
              items={parentItems}
              itemToString={(i) => (i ? i.label : "")}
              selectedItem={selectedParentItem}
              onChange={handleParentChange}
              label={t("categories.form.parent.label", {
                default: "Parent Category",
              })}
              titleText={t("categories.form.parent.label", {
                default: "Parent Category",
              })}
            />
          </div>

          <div className="mt-1">
            <NumberInput
              id="category-order"
              label={t("categories.form.order.label", { default: "Order" })}
              value={form.order}
              onChange={handleOrderChange}
              min={1}
              step={1}
              invalid={!!errors.order}
              invalidText={errors.order}
            />
          </div>

          <div className="mt-1">
            <Toggle
              id="category-isActive"
              labelText={t("categories.form.isActive.label", {
                default: "Active",
              })}
              toggled={form.isActive}
              onToggle={handleActiveChange}
            />
          </div>
        </FormGroup>
      </Column>
    </Grid>
  ), [
    form.name,
    form.slug,
    form.order,
    form.isActive,
    errors.name,
    errors.order,
    parentItems,
    selectedParentItem,
    handleNameChange,
    handleSlugChange,
    handleParentChange,
    handleOrderChange,
    handleActiveChange,
    t
  ]);

  return (
    <div id="content-form">
        <div className="section-header-row">
          <h3 className="section-title">{t("sections.basicInfo")}</h3>
          <Button
          kind="ghost"
          size="sm"
          renderIcon={Reset}
          onClick={handleResetForm}
        >
          {tCommon("reset", { default: "Reset" })}
        </Button>
        </div>

      {formContent}
    </div>
  );
});

CategoryForm.displayName = 'CategoryForm';
