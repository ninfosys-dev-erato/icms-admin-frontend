"use client";

import { TranslatableField } from "@/components/shared/translatable-field";
import {
  Column,
  ComboBox,
  Grid,
  InlineLoading,
  NumberInput,
  Select,
  SelectItem,
  TextInput,
  Toggle
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import {
  useCategoriesForNavigation,
  useContentByCategoryForNavigation,
  useCreateMenuItem,
  useUpdateMenuItem,
} from "../hooks/use-navigation-queries";
import { useNavigationStore } from "../stores/navigation-store";
import {
  Menu,
  MenuItem,
  MenuItemFormData,
  MenuItemType,
} from "../types/navigation";

interface MenuItemFormProps {
  menu: Menu;
  menuItem?: MenuItem;
  parentId?: string;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  basicOnly?: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  menu,
  menuItem,
  parentId,
  mode,
  onSuccess,
  onCancel,
  className,
  basicOnly = false,
}) => {
  const t = useTranslations("navigation");
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();

  const {
    isSubmitting,
    setSubmitting,
    menuItemFormStateById,
    activeMenuItemFormId,
    updateMenuItemFormField,
    initializeEditMenuItemForm,
    resetMenuItemFormState,
  } = useNavigationStore();

  // Local state for create mode
  const [createFormData, setCreateFormData] = useState<MenuItemFormData>({
    title: { en: "", ne: "" },
    description: { en: "", ne: "" },
    url: "",
    target: "self" as const,
    icon: "",
    itemType: "LINK" as MenuItemType,
    order: 1,
    isActive: true,
    isVisible: true,
    isPublished: false,
    itemId: "",
    categorySlug: "", // New field for linking menu item to category
    contentSlug: "", // New field for linking menu item to content
  });

  // Initialize form state
  useEffect(() => {
    if (mode === "edit" && menuItem) {
      initializeEditMenuItemForm(menuItem);
    }
  }, [mode, menuItem, initializeEditMenuItemForm]);

  const formData: MenuItemFormData =
    mode === "edit" && menuItem
      ? (menuItemFormStateById[menuItem.id] ?? {
          title: menuItem.title || { en: "", ne: "" },
          description: menuItem.description || { en: "", ne: "" },
          url: menuItem.url || "",
          target: menuItem.target || "self",
          icon: menuItem.icon || "",
          itemType: menuItem.itemType,
          order: menuItem.order,
          isActive: menuItem.isActive,
          isVisible: menuItem.isVisible ?? true,
          isPublished: menuItem.isPublished,
          itemId: menuItem.itemId || "",
          categorySlug: menuItem.categorySlug || "", // New field for linking menu item to category
          contentSlug: menuItem.contentSlug || "", // New field for linking menu item to content
        })
      : createFormData;

  // Fetch categories and content for autocomplete
  const { data: categoriesResponse } = useCategoriesForNavigation();
  const categories = categoriesResponse?.data || [];

  const { data: contentByCategoryResponse } = useContentByCategoryForNavigation(
    formData.categorySlug || menu?.categorySlug
  );
  const contentByCategory = contentByCategoryResponse?.data || [];

  // removed debug logging

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate title (required in at least one language)
    if (!formData.title.en.trim() && !formData.title.ne.trim()) {
      errors.title = t("menuItems.form.name.validation.required", {
        default: "Title is required in at least one language",
      });
    }

    // Validate item type
    if (!formData.itemType) {
      errors.itemType = t("menuItems.form.type.validation.required", {
        default: "Item type is required",
      });
    }

    // Validate URL for LINK type
    if (formData.itemType === "LINK" && !formData.url?.trim()) {
      errors.url = t("menuItems.form.url.validation.required", {
        default: "URL is required for link items",
      });
    }

    // Validate order
    if (formData.order < 1) {
      errors.order = t("menuItems.form.order.validation.minimum", {
        default: "Order must be 1 or more",
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, t]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        menuId: menu.id,
        parentId: parentId || undefined,
        title: formData.title,
        description: formData.description,
        url: formData.url,
        target: formData.target,
        icon: formData.icon,
        order: formData.order,
        isActive: formData.isActive,
        isVisible: formData.isVisible,
        isPublished: formData.isPublished,
        itemType: formData.itemType,
        itemId: formData.itemId,
        categorySlug: formData.categorySlug || undefined,
        contentSlug: formData.contentSlug || undefined,
      };

      // submit payload

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (menuItem) {
        await updateMutation.mutateAsync({
          id: menuItem.id,
          data: payload,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Menu item operation error:", error);
    } finally {
      setSubmitting(false);
    }
  }, [
    mode,
    menu.id,
    parentId,
    formData,
    createMutation,
    updateMutation,
    menuItem,
    onSuccess,
    validateForm,
  ]);

  // Listen for form submission from the parent CreateSidePanel
  useEffect(() => {
    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    };

    const formContainer = document.getElementById("menu-item-form");
    const parentForm = formContainer?.closest("form");

    if (parentForm) {
      parentForm.addEventListener("submit", handleParentFormSubmit);
      return () => {
        parentForm.removeEventListener("submit", handleParentFormSubmit);
      };
    }
    return undefined;
  }, [handleSubmit]);

  const handleInputChange = (field: keyof MenuItemFormData, value: unknown) => {
    // handle input change without debug logging

    if (mode === "edit" && menuItem) {
      updateMenuItemFormField(menuItem.id, field, value);
    } else {
      setCreateFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const itemTypeOptions = [
    { value: "LINK", label: t("menuItems.types.LINK", { default: "Link" }) },
    {
      value: "CONTENT",
      label: t("menuItems.types.CONTENT", { default: "Content" }),
    },
    {
      value: "CATEGORY",
      label: t("menuItems.types.CATEGORY", { default: "Category" }),
    },
  ];

  const targetOptions = [
    {
      value: "self",
      label: t("menuItems.form.target.self", { default: "Same Window" }),
    },
    {
      value: "_blank",
      label: t("menuItems.form.target.blank", { default: "New Window" }),
    },
    {
      value: "_parent",
      label: t("menuItems.form.target.parent", { default: "Parent Frame" }),
    },
    {
      value: "_top",
      label: t("menuItems.form.target.top", { default: "Top Frame" }),
    },
  ];

  // Prepare category options for autocomplete
  const categoryOptions = categories.map((cat) => ({
    id: cat.slug,
    text: cat.name?.en || cat.name?.ne || cat.slug || "Unknown",
    slug: cat.slug,
  }));

  // Prepare content options for autocomplete
  const contentOptions = contentByCategory.map((content) => ({
    id: content.slug,
    text: content.title?.en || content.title?.ne || content.slug || "Unknown",
    slug: content.slug,
  }));

  return (
    <div className="menu-item-form" id="menu-item-form">
      {isSubmitting && (
        <div style={{ marginBottom: "1rem" }}>
          <InlineLoading
            description={
              mode === "edit"
                ? t("actions.updating", { default: "Updating..." })
                : t("actions.creating", { default: "Creating..." })
            }
          />
        </div>
      )}

      {/* Enhanced Form Layout */}
      <div className="form-content">
        <Grid fullWidth className="form-grid">
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4} className="form-column">
            {/* Basic Information Group */}
            <div className="form-field-group">
              <h4 className="form-group-title">
                {t("menuItems.form.basicDetails", { default: "Basic Details" })}
              </h4>

              <div className="form-field">
                <TranslatableField
                  label={t("menuItems.form.name.label", {
                    default: "Item Title",
                  })}
                  value={formData.title}
                  onChange={(title) => handleInputChange("title", title)}
                  placeholder={{
                    en: t("menuItems.form.name.placeholder.en", {
                      default: "Enter item title in English",
                    }),
                    ne: t("menuItems.form.name.placeholder.ne", {
                      default: "नेपालीमा वस्तुको शीर्षक लेख्नुहोस्",
                    }),
                  }}
                  invalid={!!validationErrors.title}
                  invalidText={validationErrors.title}
                  required
                />
              </div>
              {!basicOnly && (
                <div className="form-field">
                  <TranslatableField
                    label={t("menuItems.form.description.label", {
                      default: "Description",
                    })}
                    value={formData.description}
                    onChange={(description) =>
                      handleInputChange("description", description)
                    }
                    placeholder={{
                      en: t("menuItems.form.description.placeholder.en", {
                        default: "Enter item description in English",
                      }),
                      ne: t("menuItems.form.description.placeholder.ne", {
                        default: "नेपालीमा वस्तुको विवरण लेख्नुहोस्",
                      }),
                    }}
                    type="textarea"
                  />
                </div>
              )}
            </div>

            {/* Type and Configuration Group */}
            <div className="form-field-group">
              <h4 className="form-group-title">
                {t("menuItems.form.typeConfig", {
                  default: "Type & Configuration",
                })}
              </h4>

              <div className="form-field">
                <Select
                  id="itemType"
                  labelText={t("menuItems.form.type.label", {
                    default: "Item Type",
                  })}
                  value={formData.itemType}
                  onChange={(event) =>
                    handleInputChange("itemType", event.target.value)
                  }
                  invalid={!!validationErrors.itemType}
                  invalidText={validationErrors.itemType}
                  required
                >
                  {itemTypeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      text={option.label}
                    />
                  ))}
                </Select>
              </div>

              {/* URL and Target for LINK type */}
              {formData.itemType === "LINK" && (
                <>
                  <div className="form-field">
                    <TextInput
                      id="url"
                      labelText={t("menuItems.form.url.label", {
                        default: "URL",
                      })}
                      value={formData.url}
                      onChange={(event) =>
                        handleInputChange("url", event.target.value)
                      }
                      placeholder={t("menuItems.form.url.placeholder", {
                        default: "https://example.com/page",
                      })}
                      invalid={!!validationErrors.url}
                      invalidText={validationErrors.url}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <Select
                      id="target"
                      labelText={t("menuItems.form.target.label", {
                        default: "Open In",
                      })}
                      value={formData.target}
                      onChange={(event) =>
                        handleInputChange("target", event.target.value)
                      }
                    >
                      {targetOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          text={option.label}
                        />
                      ))}
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Advanced Configuration Group */}
            <div className="form-field-group">
              <h4 className="form-group-title">
                {t("menuItems.form.advanced", { default: "Advanced Settings" })}
              </h4>

              {!basicOnly && (
                <div className="form-field form-field--half-width">
                  <TextInput
                    id="icon"
                    labelText={t("menuItems.form.icon.label", {
                      default: "Icon",
                    })}
                    value={formData.icon}
                    onChange={(event) =>
                      handleInputChange("icon", event.target.value)
                    }
                    placeholder={t("menuItems.form.icon.placeholder", {
                      default: "Icon class or identifier",
                    })}
                    helperText={t("menuItems.form.icon.helper", {
                      default: "Optional icon for the menu item",
                    })}
                  />
                </div>
              )}

              <div className="form-field form-field--half-width">
                <NumberInput
                  id="order"
                  label={t("menuItems.form.order.label", {
                    default: "Display Order",
                  })}
                  value={formData.order}
                  onChange={(event) =>
                    handleInputChange(
                      "order",
                      parseInt((event.target as HTMLInputElement).value) || 1
                    )
                  }
                  min={1}
                  step={1}
                  invalid={!!validationErrors.order}
                  invalidText={validationErrors.order}
                  helperText={t("menuItems.form.order.helper", {
                    default: "Display order (lower numbers appear first)",
                  })}
                  required
                />
              </div>

              {!basicOnly && (
                <div className="form-field">
                  <TextInput
                    id="itemId"
                    labelText={t("menuItems.form.itemId.label", {
                      default: "Item ID",
                    })}
                    value={formData.itemId}
                    onChange={(event) =>
                      handleInputChange("itemId", event.target.value)
                    }
                    placeholder={t("menuItems.form.itemId.placeholder", {
                      default: "Optional custom identifier",
                    })}
                    helperText={t("menuItems.form.itemId.helper", {
                      default: "Optional custom ID for linking to content",
                    })}
                  />
                </div>
              )}

              {/* Category Slug with Autocomplete */}
              {!basicOnly && (
                <div className="form-field">
                  <ComboBox
                    id="categorySlug"
                    titleText={t("menuItems.form.categorySlug.label", {
                      default: "Category (Optional)",
                    })}
                    placeholder={t("menuItems.form.categorySlug.placeholder", {
                      default: "Type to search categories...",
                    })}
                    items={categoryOptions}
                    itemToString={(item) => item?.text || ""}
                    selectedItem={
                      categoryOptions.find(
                        (cat) => cat.id === formData.categorySlug
                      ) || null
                    }
                    onChange={({ selectedItem }) => {
                      handleInputChange("categorySlug", selectedItem?.id || "");
                      // Clear contentSlug when category changes
                      if (formData.contentSlug) {
                        handleInputChange("contentSlug", "");
                      }
                    }}
                    onInputChange={(inputValue) => {
                      // Filter categories based on input
                      if (!inputValue) {
                        handleInputChange("categorySlug", "");
                        // Clear contentSlug when category is cleared
                        if (formData.contentSlug) {
                          handleInputChange("contentSlug", "");
                        }
                      }
                    }}
                    helperText={t("menuItems.form.categorySlug.helper", {
                      default: "Link this menu item to a specific category",
                    })}
                  />
                </div>
              )}

              {/* Content Slug with Autocomplete (only show for CONTENT type or when category is selected) */}
              {!basicOnly &&
                (formData.itemType === "CONTENT" || formData.categorySlug) && (
                  <div className="form-field">
                    <ComboBox
                      id="contentSlug"
                      titleText={t("menuItems.form.contentSlug.label", {
                        default: "Content (Optional)",
                      })}
                      placeholder={t("menuItems.form.contentSlug.placeholder", {
                        default: "Type to search content...",
                      })}
                      items={contentOptions}
                      itemToString={(item) => item?.text || ""}
                      selectedItem={
                        contentOptions.find(
                          (content) => content.id === formData.contentSlug
                        ) || null
                      }
                      onChange={({ selectedItem }) =>
                        handleInputChange("contentSlug", selectedItem?.id || "")
                      }
                      onInputChange={(inputValue) => {
                        // Filter content based on input
                        if (!inputValue) {
                          handleInputChange("contentSlug", "");
                        }
                      }}
                      helperText={t("menuItems.form.contentSlug.helper", {
                        default:
                          formData.itemType === "CONTENT"
                            ? "Link this menu item to specific content"
                            : "Optional content to link to this category",
                      })}
                    />
                  </div>
                )}
            </div>

            {/* Status and Visibility Group */}
            <div className="form-field-group form-field-group--status">
              <h4 className="form-group-title">
                {t("menuItems.form.statusVisibility", {
                  default: "Status & Visibility",
                })}
              </h4>
              <div className="form-toggle-group">
                <Toggle
                  id="isActive"
                  labelText={t("menuItems.form.isActive.label", {
                    default: "Active",
                  })}
                  toggled={formData.isActive}
                  onToggle={(checked) => handleInputChange("isActive", checked)}
                  className="form-toggle"
                />

                <Toggle
                  id="isVisible"
                  labelText={t("menuItems.form.isVisible.label", {
                    default: "Visible",
                  })}
                  toggled={formData.isVisible}
                  onToggle={(checked) =>
                    handleInputChange("isVisible", checked)
                  }
                  className="form-toggle"
                />

                <Toggle
                  id="isPublished"
                  labelText={t("menuItems.form.isPublished.label", {
                    default: "Published",
                  })}
                  toggled={formData.isPublished}
                  onToggle={(checked) =>
                    handleInputChange("isPublished", checked)
                  }
                  className="form-toggle"
                />
              </div>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
