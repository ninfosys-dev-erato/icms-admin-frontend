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
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { MenuFormData, MenuLocation } from "../types/navigation";
import { useNavigationStore } from "../stores/navigation-store";
import { useCreateMenu } from "../hooks/use-navigation-queries";
import { useCategoriesForNavigation } from "../hooks/use-navigation-queries";

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

  // Fetch categories for autocomplete
  const { data: categoriesResponse } = useCategoriesForNavigation();
  const categories = categoriesResponse?.data || [];

  // Debug: Monitor store state changes
  // removed debug logging

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [nameTab, setNameTab] = useState<"en" | "ne">("en");

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidNameLang: "en" | "ne" | null = null;

    // Validate name (per language, only first error shown)
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

    // Validate location
    if (!createFormState.location) {
      errors.location = t("form.location.validation.required", {
        default: "Menu location is required",
      });
    }

    // Validate order
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
      // prepare payload and submit
      const payload = {
        name: createFormState.name,
        location: createFormState.location,
        order: createFormState.order, // Add order field
        isActive: createFormState.isActive,
        isPublished: createFormState.isPublished,
        categorySlug: createFormState.categorySlug || undefined, // Include categorySlug
      };

      const result = await createMutation.mutateAsync(payload);

      // Reset form
      resetCreateForm();
      setValidationErrors({});

      // Call success callback immediately
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

  // Listen for form submission from the parent CreateSidePanel
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
  }, [handleFormSubmission, setSubmitting, validateForm]); // Empty dependency array to prevent re-renders

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: createFormState.name,
        location: createFormState.location,
        order: createFormState.order, // Add order field
        isActive: createFormState.isActive,
        isPublished: createFormState.isPublished,
        categorySlug: createFormState.categorySlug || undefined, // Include categorySlug
      });

      // Reset form
      resetCreateForm();
      setValidationErrors({});

      // Call success callback immediately
      onSuccess?.();
    } catch (error) {
      console.error("Menu creation error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MenuFormData, value: unknown) => {
    updateFormField("create", field, value);

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

  const locationOptions = [
    { value: "HEADER", label: "Header" },
    { value: "FOOTER", label: "Footer" },
    { value: "SIDEBAR", label: "Sidebar" },
    { value: "MOBILE", label: "Mobile" },
    { value: "CUSTOM", label: "Custom" },
  ];

  // Prepare category options for autocomplete
  const categoryOptions = categories.map((cat) => ({
    id: cat.slug,
    text: cat.name?.en || cat.name?.ne || cat.slug || "Unknown",
    slug: cat.slug,
  }));

  return (
    <div>
      <div id="menu-form">
        {/* Top action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "0.5rem",
          }}
        >
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
          {/* Basic Information Section */}
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

            {/* Description removed as per compliance */}

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
                  // NumberInput onChange processed
                  const numericValue =
                    value !== undefined && value !== null ? Number(value) : 0;
                  // Numeric value processed
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
                    (cat) => cat.id === createFormState.categorySlug
                  ) || null
                }
                onChange={({ selectedItem }) => {
                  // ComboBox onChange called
                  const newValue = selectedItem?.id || "";
                  // Setting categorySlug
                  handleInputChange("categorySlug", newValue);
                }}
                onInputChange={(inputValue) => {
                  // Filter categories based on input
                  if (!inputValue) {
                    // Clearing categorySlug
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
            <div style={{ marginTop: "2rem" }}>
              <Stack gap={4}>
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
