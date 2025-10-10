"use client";

import {
  Column,
  Dropdown,
  FormGroup,
  Grid,
  InlineLoading,
  NumberInput,
  Toggle
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  useCategories,
  useCreateCategory,
} from "../../hooks/use-category-queries";
import { useContentUIStore } from "../../stores/content-ui-store";
import { TranslatableField } from "@/components/shared/translatable-field";

interface CategoryCreateFormProps {
  onSuccess?: () => void;
}

export const CategoryCreateForm: React.FC<CategoryCreateFormProps> = ({
  onSuccess,
}) => {
  const t = useTranslations("content-management");
  const tContent = useTranslations("content-management");
  const createMutation = useCreateCategory();
  const {
    isSubmitting,
    setSubmitting,
    createCategoryForm,
    updateCategoryFormField,
    resetCategoryForm,
  } = useContentUIStore();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Ensure form is properly initialized
  useEffect(() => {
    console.log('🔍 Category form initialized with:', createCategoryForm);
    if (createCategoryForm.parentId !== null) {
      console.log('🔍 Resetting parentId to null');
      updateCategoryFormField("create", "parentId", null);
    }
  }, []);

  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const parentItems = [
    { id: null, label: t("form.parent.noParent", { default: "No Parent (Root Category)" }) },
    ...(categoriesQuery.data?.data ?? []).map((c) => ({
      id: c.id,
      label: c.name.en || c.name.ne || c.slug,
    }))
  ];
  const selectedParentItem =
    parentItems.find((c) => c.id === createCategoryForm.parentId) || parentItems[0];

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (
      !createCategoryForm.name.en.trim() ||
      !createCategoryForm.name.ne.trim()
    ) {
      errors.name = t("errors.validation.nameRequired");
    } else if (createCategoryForm.name.en.trim().length < 3) {
      errors.name = t("errors.validation.nameMinLength");
    }
    if (createCategoryForm.order < 0) {
      errors.order = t("errors.validation.orderInvalid");
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
  }, [createCategoryForm]);

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }
    
    // Debug: Log what's being sent
    console.log('🔍 Submitting category form:', {
      name: createCategoryForm.name,
      description: createCategoryForm.description,
      slug: createCategoryForm.slug,
      parentId: createCategoryForm.parentId,
      order: createCategoryForm.order,
      isActive: createCategoryForm.isActive,
    });
    
    // Ensure parentId is null if no parent is selected
    const finalParentId = createCategoryForm.parentId || null;
    console.log('🔍 Final parentId being sent:', finalParentId);
    
    try {
      await createMutation.mutateAsync({
        name: createCategoryForm.name,
        description: createCategoryForm.description,
        slug: createCategoryForm.slug,
        parentId: finalParentId,
        order: createCategoryForm.order,
        isActive: createCategoryForm.isActive,
      });
      resetCategoryForm("create");
      setValidationErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div id="content-form">
        {/* Top action bar */}
        <div className="top-action-bar">
          <div className="section-header-row">
          <h3 className="section-title">{t("sections.basicInfo")}</h3>
          {/* <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={() => {
              resetCategoryForm("create");
              setValidationErrors({});
            }}
            disabled={isSubmitting}
          >
            {tContent("actions.reset", { default: "Reset" })}
          </Button> */}
        </div>
        </div>
        {isSubmitting && (
          <div className="submitting-indicator">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText="">
              <TranslatableField
                label={t("form.name.label")}
                value={createCategoryForm.name}
                onChange={(v) => updateCategoryFormField("create", "name", v)}
                placeholder={{
                  en: t("form.name.placeholder.en"),
                  ne: t("form.name.placeholder.ne"),
                }}
                required
                invalid={!!validationErrors.name}
                invalidText={validationErrors.name}
              />

              <div className="mt-1">
                <TranslatableField
                  label={t("form.description.label")}
                  value={createCategoryForm.description}
                  onChange={(v) =>
                    updateCategoryFormField("create", "description", v)
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
                  onChange={({ selectedItem }) => {
                    const newParentId = selectedItem?.id || null;
                    console.log('🔍 Parent dropdown changed:', { selectedItem, newParentId });
                    updateCategoryFormField(
                      "create",
                      "parentId",
                      newParentId
                    );
                  }}
                  label={t("form.parent.label")}
                  titleText={t("form.parent.label")}
                />
              </div>

              <div className="mt-1">
                <NumberInput
                  id="category-order"
                  label={t("form.order.label")}
                  value={createCategoryForm.order}
                  onChange={(e, { value }) =>
                    value !== undefined &&
                    updateCategoryFormField("create", "order", value)
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
                  toggled={createCategoryForm.isActive}
                  onToggle={(checked) =>
                    updateCategoryFormField("create", "isActive", checked)
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
