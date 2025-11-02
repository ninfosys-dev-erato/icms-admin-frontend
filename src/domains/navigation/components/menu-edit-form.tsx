

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FormGroup,
  Toggle,
  Grid,
  Column,
  Stack,
  InlineLoading,
  Select,
  SelectItem,
  ComboBox,
  NumberInput,
} from "@carbon/react";
import { useTranslations, useLocale } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { MenuFormData, Menu, MenuLocation } from "../types/navigation";
import { useNavigationStore } from "../stores/navigation-store";
import { useUpdateMenu } from "../hooks/use-navigation-queries";
import { useCategoriesForNavigation } from "../hooks/use-navigation-queries";

interface MenuEditFormProps {
  menu: Menu;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const MenuEditForm: React.FC<MenuEditFormProps> = ({
  menu,
  onSuccess,
  onCancel,
  className,
}) => {
  const t = useTranslations("navigation");
  const updateMutation = useUpdateMenu();
  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    activeFormId,
    updateFormField,
    initializeEditForm,
    resetFormState,
  } = useNavigationStore();

  // Fetch categories for autocomplete
  const { data: categoriesResponse } = useCategoriesForNavigation();
  const categories = categoriesResponse?.data || [];

  // Initialize store-backed form on mount/menu change
  useEffect(() => {
    initializeEditForm(menu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.id]);

  const formData: MenuFormData = formStateById[menu.id] ?? {
    name: menu.name || { en: "", ne: "" },
    description: menu.description || { en: "", ne: "" },
    location: menu.location,
    order: menu.order ?? 0, // Add order field with fallback to 0
    isActive: menu.isActive,
    isPublished: menu.isPublished,
    categorySlug: menu.categorySlug || "", // Include categorySlug
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [nameTab, setNameTab] = useState<"en" | "ne">("en");
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.name.en !== (menu.name?.en || "") ||
      formData.name.ne !== (menu.name?.ne || "") ||
      formData.description?.en !== (menu.description?.en || "") ||
      formData.description?.ne !== (menu.description?.ne || "") ||
      formData.location !== menu.location ||
      formData.order !== menu.order || // Add order field comparison
      formData.isActive !== menu.isActive ||
      formData.isPublished !== menu.isPublished ||
      formData.categorySlug !== (menu.categorySlug || ""); // Include categorySlug in change detection

    setHasChanges(hasFormChanges);
  }, [formData, menu]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidNameLang: "en" | "ne" | null = null;

    // Validate name (per language, only first error shown)
    if (!formData.name.en.trim()) {
      errors.name = t("form.name.validation.required", {
        default: "Menu name is required in at least one language",
      });
      if (!firstInvalidNameLang) firstInvalidNameLang = "en";
    } else if (!formData.name.ne.trim()) {
      errors.name = t("form.name.validation.required", {
        default: "Menu name is required in at least one language",
      });
      if (!firstInvalidNameLang) firstInvalidNameLang = "ne";
    }

    // Validate location
    if (!formData.location) {
      errors.location = t("form.location.validation.required", {
        default: "Menu location is required",
      });
    }

    // Validate order
    if (formData.order < 0) {
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
        name: formData.name,
        description: formData.description,
        location: formData.location,
        order: formData.order, // Add order field
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        categorySlug: formData.categorySlug || undefined, // Include categorySlug
      };

      // Submitting payload
      // categorySlug value present in formData if provided

      await updateMutation.mutateAsync({
        id: menu.id,
        data: payload,
      });

      setValidationErrors({});

      onSuccess?.();
    } catch (error) {
      console.error("Menu update error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [formData, updateMutation, onSuccess, menu.id, setSubmitting]);

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

    const formContainer = document.getElementById("menu-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [
    formData,
    updateMutation,
    onSuccess,
    menu.id,
    t,
    setSubmitting,
    handleFormSubmission,
    validateForm,
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
      await updateMutation.mutateAsync({
        id: menu.id,
        data: {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          order: formData.order, // Add order field
          isActive: formData.isActive,
          isPublished: formData.isPublished,
          categorySlug: formData.categorySlug || undefined, // Include categorySlug
        },
      });

      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("❌ Menu update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MenuFormData, value: unknown) => {
    updateFormField(menu.id, field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const locale = useLocale();
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

  // Prepare category options for autocomplete
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
        {/* ✅ ADDED: Basic Information header bar like document form */}
        <div className="navigation-edit-form-actionbar flex">
          <h3 className="font-16">{t("sections.basicInfo")}</h3>
        </div>

        {isSubmitting && (
          <div style={{ marginBottom: "1rem" }}>
            <InlineLoading
              description={t("actions.updating", { default: "Updating..." })}
            />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            {/* Name */}
            <TranslatableField
              label={t("form.name.label", { default: "Menu Name" })}
              value={formData.name}
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

            {/* Description removed to simplify the form */}

            {/* Location */}
            <div style={{ marginTop: "1rem" }}>
              <Select
                id="location"
                labelText={t("form.location.label", {
                  default: "Menu Location",
                })}
                value={formData.location}
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
                value={formData.order ?? 0}
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
                  default: "Determines the order of the menu",
                })}
              />
            </div>

            {/* Category Slug with Autocomplete */}
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
                    (cat) => cat.id === formData.categorySlug
                  ) || null
                }
                onChange={({ selectedItem }) =>
                  handleInputChange("categorySlug", selectedItem?.id || "")
                }
                onInputChange={(inputValue) => {
                  // Filter categories based on input
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
                  toggled={formData.isActive}
                  onToggle={(checked) => handleInputChange("isActive", checked)}
                />

                <Toggle
                  id="isPublished"
                  labelText={t("form.isPublished.label", {
                    default: "Published",
                  })}
                  toggled={formData.isPublished}
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
