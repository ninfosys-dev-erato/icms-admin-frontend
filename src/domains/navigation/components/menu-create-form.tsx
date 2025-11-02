
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FormGroup,
  Toggle,
  Grid,
  Column,
  Stack,
  InlineLoading,
  Button,
  Select,
  SelectItem,
  TextInput,
  ComboBox,
  NumberInput,
} from "@carbon/react";
import { Add, Reset } from "@carbon/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { MenuFormData, MenuLocation } from "../types/navigation";
import { useNavigationStore } from "../stores/navigation-store";
import { useCreateMenu, useMenus, useCategoriesForNavigation } from "../hooks/use-navigation-queries";

interface MenuCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const MenuCreateForm: React.FC<MenuCreateFormProps> = ({
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("navigation");
  const createMutation = useCreateMenu();
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    resetCreateForm,
  } = useNavigationStore();

  const { data: categoriesResponse } = useCategoriesForNavigation();
  const { data: menusResponse } = useMenus({ page: 1, limit: 1000 }); // ✅ fetch all menus
  const categories = categoriesResponse?.data || [];

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [nameTab, setNameTab] = useState<"en" | "ne">("en");

  // ✅ Auto-increment order from last existing menu
  useEffect(() => {
    if (menusResponse?.data?.length) {
      const maxOrder = Math.max(
        ...menusResponse.data.map((menu: any) => menu.order || 0)
      );
      updateFormField("create", "order", maxOrder + 1);
    } else {
      updateFormField("create", "order", 0);
    }
  }, [menusResponse, updateFormField]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidNameLang: "en" | "ne" | null = null;

    if (!createFormState.name.en.trim()) {
      errors.name = t("form.name.validation.required", {
        default: "Menu name is required in at least one language",
      });
      if (!firstInvalidNameLang) firstInvalidNameLang = "en";
    } else if (!createFormState.name.ne.trim()) {
      errors.name = t("form.name.validation.required", {
        default: "Menu name is required in at least one language",
      });
      if (!firstInvalidNameLang) firstInvalidNameLang = "ne";
    }

    if (!createFormState.location) {
      errors.location = t("form.location.validation.required", {
        default: "Menu location is required",
      });
    }

    if (createFormState.order < 0) {
      errors.order = t("form.order.validation.min", {
        default: "Order must be a non-negative number",
      });
    }

    setValidationErrors(errors);
    if (firstInvalidNameLang) setNameTab(firstInvalidNameLang);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmission = useCallback(async () => {
    try {
      const payload = {
        name: createFormState.name,
        location: createFormState.location,
        order: createFormState.order,
        isActive: createFormState.isActive,
        isPublished: createFormState.isPublished,
        categorySlug: createFormState.categorySlug || undefined,
      };

      const result = await createMutation.mutateAsync(payload);

      resetCreateForm();
      setValidationErrors({});
      onSuccess?.();
    } catch (error) {
      console.error("MenuCreateForm - Creation error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [
    createFormState,
    createMutation,
    resetCreateForm,
    onSuccess,
    setSubmitting,
  ]);

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

    const formContainer = document.getElementById("menu-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [handleFormSubmission, setSubmitting, validateForm]);

  const handleInputChange = (field: keyof MenuFormData, value: unknown) => {
    updateFormField("create", field, value);
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleResetForm = () => {
    resetCreateForm();
    setValidationErrors({});
    // ✅ reassign auto increment order after reset
    if (menusResponse?.data?.length) {
      const maxOrder = Math.max(
        ...menusResponse.data.map((menu: any) => menu.order || 0)
      );
      updateFormField("create", "order", maxOrder + 1);
    } else {
      updateFormField("create", "order", 0);
    }
  };

  const locale = useLocale();
  // Helper: resolve translation and fall back to a default if the translator
  // returned the raw key (happens when the translation is missing).
  const resolve = (primaryKey: string, fallbackKey: string, def: string) => {
    try {
      const res = t(primaryKey);
      if (res && res !== primaryKey && !res.includes("navigation.")) return res;
    } catch {}
    try {
      const alt = t(fallbackKey);
      if (alt && alt !== fallbackKey && !alt.includes("navigation.")) return alt;
    } catch {}
    return def;
  };

  const locationOptions = [
    { value: "HEADER", label: resolve("form.location.options.header", "locations.HEADER", "Header") },
    { value: "FOOTER", label: resolve("form.location.options.footer", "locations.FOOTER", "Footer") },
    { value: "SIDEBAR", label: resolve("form.location.options.sidebar", "locations.SIDEBAR", "Sidebar") },
    { value: "MOBILE", label: resolve("form.location.options.mobile", "locations.MOBILE", "Mobile") },
    { value: "CUSTOM", label: resolve("form.location.options.custom", "locations.CUSTOM", "Custom") },
  ];

  const categoryOptions = categories.map((cat) => ({
    id: cat.slug,
    text:
      cat.name?.[locale as "en" | "ne"] ||
      cat.name?.en ||
      cat.name?.ne ||
      cat.slug ||
      "Unknown",
    slug: cat.slug,
  }));

  return (
    <div>
      <div id="menu-form">
        {/* ✅ Added "Basic Information" Heading */}
        <div className="navigation-create-form-actionbar flex">
          <h3 className="font-16">{t("sections.basicInfo")}</h3>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleResetForm}
            disabled={isSubmitting || createMutation.isPending}
          >
            {t("actions.reset", { default: "Reset" })}
          </Button>
        </div>

        {isSubmitting && (
          <div style={{ marginBottom: "1rem" }}>
            <InlineLoading
              description={t("actions.creating", { default: "Creating..." })}
            />
          </div>
        )}

        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            {/* Name */}
            <TranslatableField
              label={t("form.name.label", { default: "Menu Name" })}
              value={createFormState.name}
              onChange={(name) => handleInputChange("name", name)}
              placeholder={{
                en: t("form.name.placeholder.en", {
                  default: "Enter menu name in English",
                }),
                ne: t("form.name.placeholder.ne", {
                  default: "नेपालीमा मेनुको नाम लेख्नुहोस्",
                }),
              }}
              invalid={!!validationErrors.name}
              invalidText={validationErrors.name}
              required
              activeTab={nameTab}
              setActiveTab={setNameTab}
            />

            {/* Location */}
            <div>
              <Select
                id="location"
                labelText={t("form.location.label", {
                  default: "Menu Location",
                })}
                value={createFormState.location}
                onChange={(event) =>
                  handleInputChange("location", event.target.value)
                }
                invalid={!!validationErrors.location}
                invalidText={validationErrors.location}
                required
              >
                {locationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    text={option.label}
                  />
                ))}
              </Select>
            </div>

            {/* Order */}
            <div style={{ marginTop: "1rem" }}>
              <NumberInput
                id="order"
                label={t("form.order.label", { default: "Order" })}
                value={createFormState.order ?? 0}
                onChange={(e, { value }) => {
                  const numericValue =
                    value !== undefined && value !== null ? Number(value) : 0;
                  handleInputChange("order", numericValue);
                }}
                invalid={!!validationErrors.order}
                invalidText={validationErrors.order}
                min={0}
                step={1}
                helperText={t("form.order.helper", {
                  default: "Determines the order of the menu item",
                })}
              />
            </div>

            {/* Category Slug */}
            <div style={{ marginTop: "1rem" }}>
              <ComboBox
                id="categorySlug"
                titleText={t("form.categorySlug.label", {
                  default: "Category (Optional)",
                })}
                placeholder={t("form.categorySlug.placeholder", {
                  default: "Type to search categories...",
                })}
                items={categoryOptions}
                itemToString={(item) => item?.text || ""}
                selectedItem={
                  categoryOptions.find(
                    (cat) => cat.id === createFormState.categorySlug
                  ) || null
                }
                onChange={({ selectedItem }) => {
                  const newValue = selectedItem?.id || "";
                  handleInputChange("categorySlug", newValue);
                }}
                onInputChange={(inputValue) => {
                  if (!inputValue) {
                    handleInputChange("categorySlug", "");
                  }
                }}
                helperText={t("form.categorySlug.helper", {
                  default:
                    "Link this menu to a specific category for dynamic content",
                })}
              />
            </div>

            {/* Status Toggles */}
            <div style={{ marginTop: "0.5rem" }}>
              <Stack gap={2}>
                <Toggle
                  id="isActive"
                  labelText={t("form.isActive.label", { default: "Active" })}
                  toggled={createFormState.isActive}
                  onToggle={(checked) => handleInputChange("isActive", checked)}
                />

                <Toggle
                  id="isPublished"
                  labelText={t("form.isPublished.label", {
                    default: "Published",
                  })}
                  toggled={createFormState.isPublished}
                  onToggle={(checked) =>
                    handleInputChange("isPublished", checked)
                  }
                />
              </Stack>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
