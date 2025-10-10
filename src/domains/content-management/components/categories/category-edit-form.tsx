"use client";

import { Reset } from "@carbon/icons-react";
import {
  Button,
  Column,
  Dropdown,
  FormGroup,
  Grid,
  InlineLoading,
  NumberInput,
  Toggle,
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
// For robust per-language validation and focusing
// Remove unused refs and tab state, use only supported props
import {
  useCategories,
  useUpdateCategory,
} from "../../hooks/use-category-queries";
import { useContentUIStore } from "../../stores/content-ui-store";
import type { Category } from "../../types/content";
import { TranslatableField } from "@/components/shared/translatable-field";

interface CategoryEditFormProps {
  category: Category;
  onSuccess?: () => void;
}

export const CategoryEditForm: React.FC<CategoryEditFormProps> = ({
  category,
  onSuccess,
}) => {
  const t = useTranslations("content-management");
  const tContent = useTranslations("content-management");
  const updateMutation = useUpdateCategory();
  const {
    isSubmitting,
    setSubmitting,
    categoryFormById,
    updateCategoryFormField,
    resetCategoryForm,
  } = useContentUIStore();
  const formData = categoryFormById[category.id] ?? {
    name: category.name,
    description: category.description || { en: "", ne: "" },
    slug: category.slug,
    parentId: category.parentId || "",
    order: category.order,
    isActive: category.isActive,
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const parentItems = (categoriesQuery.data?.data ?? [])
    .filter((c) => c.id !== category.id)
    .map((c) => ({ id: c.id, label: c.name.en }));
  const selectedParentItem = useMemo(
    () => parentItems.find((c) => c.id === formData.parentId) || null,
    [parentItems, formData.parentId]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    const container = document.getElementById("content-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler);
      return () => form.removeEventListener("submit", handler);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, formData]);

  // Per-language validation
  const validate = (name: { en: string; ne: string }) => {
    const errors: Record<string, string> = {};
    const en = name.en.trim();
    const ne = name.ne.trim();
    if (!en) {
      errors.name_en = t("validation.categoryNameRequired");
    } else if (en.length < 3) {
      errors.name_en = t("validation.nameMinLength");
    }
    if (!ne) {
      errors.name_ne = t("validation.categoryNameRequired");
    } else if (ne.length < 3) {
      errors.name_ne = t("validation.nameMinLength");
    }
    return errors;
  };

  // On submit, validate and switch to first invalid language tab and focus
  const submit = useCallback(async () => {
    setSubmitting(true);
    const errors = validate(formData.name);
    setValidationErrors(errors);

    if (errors.name_en || errors.name_ne) {
      let firstInvalidLang: "en" | "ne" | null = null;
      if (errors.name_en) firstInvalidLang = "en";
      else if (errors.name_ne) firstInvalidLang = "ne";

      // Switch tab by simulating click on tab button
      setTimeout(() => {
        const tabSelector = `.translatable-field .tab-button${firstInvalidLang === "en" ? ".active" : ":not(.active)"}`;
        const tabBtn = document.querySelector(tabSelector);
        if (tabBtn)
          tabBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        const inputId = `${t("form.name.label").toLowerCase().replace(/\s+/g, "-")}-${firstInvalidLang}`;
        const input = document.getElementById(inputId);
        if (input) (input as HTMLElement).focus();
      }, 0);
    }

    if (Object.keys(errors).some((k) => k.startsWith("name_"))) {
      setSubmitting(false);
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: {
          name: formData.name,
          description: formData.description,
          slug: formData.slug,
          parentId: formData.parentId || undefined,
          order: formData.order,
          isActive: formData.isActive,
        },
      });
      resetCategoryForm(category.id);
      setValidationErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
    } finally {
      setSubmitting(false);
    }
  }, [
    category.id,
    formData,
    onSuccess,
    resetCategoryForm,
    setSubmitting,
    updateMutation,
    t,
  ]);

  return (
    <div>
      <div id="content-form">
        {/* Top action bar */}
        <div className="top-action-bar">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={() => {
              resetCategoryForm(category.id);
              setValidationErrors({});
            }}
            disabled={isSubmitting}
          >
            {tContent("actions.reset", { default: "Reset" })}
          </Button>
        </div>
        {isSubmitting && (
          <div className="submitting-indicator">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText={tContent("sections.basicInfo")}>
              <TranslatableField
                label={t("form.name.label")}
                value={formData.name}
                onChange={(v) =>
                  updateCategoryFormField(category.id, "name", v)
                }
                placeholder={{
                  en: t("form.name.placeholder.en"),
                  ne: t("form.name.placeholder.ne"),
                }}
                required
                invalid={
                  !!validationErrors.name_en || !!validationErrors.name_ne
                }
                invalidText={
                  validationErrors.name_en || validationErrors.name_ne
                }
              />

              <div className="mt-1">
                <TranslatableField
                  label={t("form.description.label")}
                  value={formData.description}
                  onChange={(v) =>
                    updateCategoryFormField(category.id, "description", v)
                  }
                  placeholder={{
                    en: t("form.description.placeholder.en"),
                    ne: t("form.description.placeholder.ne"),
                  }}
                  multiline
                  rows={3}
                />
              </div>

              <div className="mt-1">
                <Dropdown
                  id="category-parent"
                  items={parentItems}
                  itemToString={(i) => (i ? i.label : "")}
                  selectedItem={selectedParentItem}
                  onChange={({ selectedItem }) =>
                    updateCategoryFormField(
                      category.id,
                      "parentId",
                      selectedItem?.id || ""
                    )
                  }
                  label={t("form.parent.label")}
                  titleText={t("form.parent.label")}
                />
              </div>

              <div className="mt-1">
                <NumberInput
                  id="category-order"
                  label={t("form.order.label")}
                  value={formData.order}
                  onChange={(e, { value }) =>
                    value !== undefined &&
                    updateCategoryFormField(category.id, "order", value)
                  }
                  min={1}
                  step={1}
                  invalid={!!validationErrors.order}
                  invalidText={validationErrors.order}
                />
              </div>
            </FormGroup>

            {/* Status Section */}
            <div className="mt-2">
              <FormGroup legendText={t("form.status.label")}>
                <Toggle
                  id="category-isActive"
                  labelText={t("form.isActive.label")}
                  toggled={formData.isActive}
                  onToggle={(checked) =>
                    updateCategoryFormField(category.id, "isActive", checked)
                  }
                />
              </FormGroup>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
