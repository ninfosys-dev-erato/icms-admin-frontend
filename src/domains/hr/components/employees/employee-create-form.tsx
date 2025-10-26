"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  Column,
  NumberInput,
  Toggle,
  InlineLoading,
  FormGroup,
  Dropdown,
  Button,
} from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { useHRUIStore } from "../../stores/hr-ui-store";
import {
  useCreateEmployeeWithPhoto,
  useDepartments,
  useEmployees,
} from "../../hooks/use-hr-queries";
import { TranslatableField } from "../shared/translatable-field";
import { ContactInfoForm } from "../shared/contact-info-form";
import { EmployeePhotoUpload } from "./employee-photo-upload";

interface EmployeeCreateFormProps {
  onSuccess?: () => void;
}

export const EmployeeCreateForm: React.FC<EmployeeCreateFormProps> = ({
  onSuccess,
}) => {
  const t = useTranslations("hr-employees");
  const tHr = useTranslations("hr");
  const createMutation = useCreateEmployeeWithPhoto();
  const {
    isSubmitting,
    setSubmitting,
    createEmployeeForm,
    updateEmployeeFormField,
    resetEmployeeForm,
    createSelectedFile,
    setSelectedFile,
    resetFormState,
  } = useHRUIStore();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeNameLang, setActiveNameLang] = useState<"en" | "ne">("en");
  const [activePositionLang, setActivePositionLang] = useState<"en" | "ne">(
    "en"
  );

  const { data: employeesData } = useEmployees({ page: 1, limit: 10000 });
  const employeeCount = employeesData?.data?.length || 0;

  useEffect(() => {
    // Always set order to employeeCount + 1 when form is opened or reset
    updateEmployeeFormField("create", "order", employeeCount + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeCount]);

  const departmentsQuery = useDepartments({ page: 1, limit: 100 });
  const departmentItems = (departmentsQuery.data?.data ?? []).map((d) => ({
    id: d.id,
    label: d.departmentName.en,
  }));
  const selectedDepartmentItem =
    departmentItems.find((d) => d.id === createEmployeeForm.departmentId) ||
    null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidField: string | null = null;
    // Name field per-language errors
    if (!createEmployeeForm.name.en.trim()) {
      errors.name_en = t("errors.validation.nameEnRequired", {
        default: t("errors.validation.nameRequired"),
      });
      if (!firstInvalidField) firstInvalidField = "employee-name-en";
    } else if (createEmployeeForm.name.en.trim().length < 4) {
      errors.name_en = t("errors.validation.nameMinLength", { min: 4 });
      if (!firstInvalidField) firstInvalidField = "employee-name-en";
    }
    if (!createEmployeeForm.name.ne.trim()) {
      errors.name_ne = t("errors.validation.nameNeRequired", {
        default: t("errors.validation.nameRequired"),
      });
      if (!firstInvalidField) firstInvalidField = "employee-name-ne";
    } else if (createEmployeeForm.name.ne.trim().length < 4) {
      errors.name_ne = t("errors.validation.nameMinLength", { min: 4 });
      if (!firstInvalidField) firstInvalidField = "employee-name-ne";
    }
    // Position field per-language errors
    if (!createEmployeeForm.position.en.trim()) {
      errors.position_en = t("errors.validation.positionEnRequired", {
        default: t("errors.validation.positionRequired"),
      });
      if (!firstInvalidField) firstInvalidField = "employee-position-en";
    }
    if (!createEmployeeForm.position.ne.trim()) {
      errors.position_ne = t("errors.validation.positionNeRequired", {
        default: t("errors.validation.positionRequired"),
      });
      if (!firstInvalidField) firstInvalidField = "employee-position-ne";
    }
    if (!createEmployeeForm.departmentId) {
      errors.departmentId = t("errors.validation.departmentRequired");
      if (!firstInvalidField) firstInvalidField = "employee-department";
    }
    if (createEmployeeForm.order < 0) {
      errors.order = t("errors.validation.orderInvalid");
      if (!firstInvalidField) firstInvalidField = "employee-order";
    }
    setValidationErrors(errors);

    // Auto-switch logic: if Nepali missing for name/position prefer showing Nepali tab right away.
    if (errors.name_ne && !errors.name_en) {
      setActiveNameLang("ne");
    } else if (errors.name_en && !errors.name_ne) {
      setActiveNameLang("en");
    }
    if (errors.position_ne && !errors.position_en) {
      setActivePositionLang("ne");
    } else if (errors.position_en && !errors.position_ne) {
      setActivePositionLang("en");
    }

    // Focus and scroll to first invalid field
    if (firstInvalidField) {
      setTimeout(() => {
        const el = document.getElementById(firstInvalidField);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 0);
      return false;
    }
    return Object.keys(errors).length === 0;
  };

  const submit = useCallback(async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }

    try {
      // Debug: Log the current form state
      console.log("=== Form Submission Debug ===");
      console.log("Current createEmployeeForm:", createEmployeeForm);
      console.log(
        "showUpInHomepage:",
        createEmployeeForm.showUpInHomepage,
        "(type:",
        typeof createEmployeeForm.showUpInHomepage,
        ")"
      );
      console.log(
        "showDownInHomepage:",
        createEmployeeForm.showDownInHomepage,
        "(type:",
        typeof createEmployeeForm.showDownInHomepage,
        ")"
      );
      console.log("==============================");

      if (createSelectedFile) {
        // Debug logging
        console.log("Creating employee with photo:", {
          createSelectedFile,
          createEmployeeForm,
        });
        console.log("Homepage fields:", {
          showUpInHomepage: createEmployeeForm.showUpInHomepage,
          showDownInHomepage: createEmployeeForm.showDownInHomepage,
        });

        // Create with photo
        await createMutation.mutateAsync({
          file: createSelectedFile,
          data: {
            name: createEmployeeForm.name,
            departmentId: createEmployeeForm.departmentId,
            position: createEmployeeForm.position,
            order: createEmployeeForm.order,
            mobileNumber: createEmployeeForm.mobileNumber || undefined,
            telephone: createEmployeeForm.telephone || undefined,
            email: createEmployeeForm.email || undefined,
            roomNumber: createEmployeeForm.roomNumber || undefined,
            isActive: createEmployeeForm.isActive,
            showUpInHomepage: createEmployeeForm.showUpInHomepage,
            showDownInHomepage: createEmployeeForm.showDownInHomepage,
          },
        });
      } else {
        // Create without photo (fallback to regular create)
        console.log("Creating employee without photo:", createEmployeeForm);
        console.log("Homepage fields:", {
          showUpInHomepage: createEmployeeForm.showUpInHomepage,
          showDownInHomepage: createEmployeeForm.showDownInHomepage,
        });

        const { useCreateEmployee } = await import(
          "../../hooks/use-hr-queries"
        );
        const createEmployeeMutation = useCreateEmployee();
        await createEmployeeMutation.mutateAsync({
          name: createEmployeeForm.name,
          departmentId: createEmployeeForm.departmentId,
          position: createEmployeeForm.position,
          order: createEmployeeForm.order,
          mobileNumber: createEmployeeForm.mobileNumber || undefined,
          telephone: createEmployeeForm.telephone || undefined,
          email: createEmployeeForm.email || undefined,
          roomNumber: createEmployeeForm.roomNumber || undefined,
          isActive: createEmployeeForm.isActive,
          showUpInHomepage: createEmployeeForm.showUpInHomepage,
          showDownInHomepage: createEmployeeForm.showDownInHomepage,
        });
      }

      // Reset form state to default and set order for next employee
      resetEmployeeForm("create");
      resetFormState("create");
      setValidationErrors({});
      // Set order to next available after reset
      updateEmployeeFormField("create", "order", employeeCount + 1);
      onSuccess?.();
    } catch (err) {
      // handled by mutations/notifications layer
    } finally {
      setSubmitting(false);
    }
  }, [
    createEmployeeForm,
    createSelectedFile,
    createMutation,
    employeeCount,
    onSuccess,
    resetEmployeeForm,
    resetFormState,
    setSubmitting,
    updateEmployeeFormField,
  ]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    const container = document.getElementById("hr-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler);
      return () => form.removeEventListener("submit", handler);
    }
    return undefined;
  }, [submit]);

  const handlePhotoUpload = (file: File) => {
    console.log("Photo upload handler called with file:", file);
    setSelectedFile("create", file);
  };

  const handlePhotoRemove = () => {
    setSelectedFile("create", null);
  };

  const getCurrentImageUrl = (): string | undefined => {
    if (createSelectedFile) {
      return URL.createObjectURL(createSelectedFile);
    }
    return undefined;
  };

  return (
    <div>
      <div id="hr-form">
        {/* Top action bar */}
        <div className="employee-form-actionbar">
          <h3 className="employee-form-title">{tHr("sections.basicInfo")}</h3>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={() => {
              resetEmployeeForm("create");
              resetFormState("create");
              setValidationErrors({});
              // Set order to next available after reset
              updateEmployeeFormField("create", "order", employeeCount + 1);
            }}
            disabled={isSubmitting}
          >
            {tHr("actions.reset", { default: "Reset" })}
          </Button>
        </div>
        {isSubmitting && (
          <div className="employee-form-loading">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText="">
              <TranslatableField
                label={t("form.name.label")}
                value={createEmployeeForm.name}
                onChange={(v) => updateEmployeeFormField("create", "name", v)}
                placeholder={{
                  en: t("form.name.placeholder.en"),
                  ne: t("form.name.placeholder.ne"),
                }}
                required
                // Provide root invalid flag if either language invalid so a11y picks it up
                invalid={
                  !!validationErrors.name_en || !!validationErrors.name_ne
                }
                invalidText={
                  validationErrors.name_en || validationErrors.name_ne
                }
                invalidMessages={{
                  en: validationErrors.name_en
                    ? { invalid: true, text: validationErrors.name_en }
                    : undefined,
                  ne: validationErrors.name_ne
                    ? { invalid: true, text: validationErrors.name_ne }
                    : undefined,
                }}
                activeLanguage={activeNameLang}
                onActiveLanguageChange={setActiveNameLang}
              />

              <div className="employee-form-field-group">
                <TranslatableField
                  label={t("form.position.label")}
                  value={createEmployeeForm.position}
                  onChange={(v) =>
                    updateEmployeeFormField("create", "position", v)
                  }
                  placeholder={{
                    en: t("form.position.placeholder"),
                    ne: t("form.position.placeholder"),
                  }}
                  required
                  invalid={
                    !!validationErrors.position_en ||
                    !!validationErrors.position_ne
                  }
                  invalidText={
                    validationErrors.position_en || validationErrors.position_ne
                  }
                  invalidMessages={{
                    en: validationErrors.position_en
                      ? { invalid: true, text: validationErrors.position_en }
                      : undefined,
                    ne: validationErrors.position_ne
                      ? { invalid: true, text: validationErrors.position_ne }
                      : undefined,
                  }}
                  activeLanguage={activePositionLang}
                  onActiveLanguageChange={setActivePositionLang}
                />
                <Dropdown
                  id="employee-department"
                  items={departmentItems}
                  itemToString={(i) => (i ? i.label : "")}
                  selectedItem={selectedDepartmentItem}
                  onChange={({ selectedItem }) =>
                    updateEmployeeFormField(
                      "create",
                      "departmentId",
                      selectedItem?.id || ""
                    )
                  }
                  invalid={!!validationErrors.departmentId}
                  invalidText={validationErrors.departmentId}
                  label={t("form.department.label")}
                  titleText={t("form.department.label")}
                />

                <NumberInput
                  id="employee-order"
                  label={t("form.order.label")}
                  value={createEmployeeForm.order}
                  readOnly
                  min={1}
                  step={1}
                  invalid={!!validationErrors.order}
                  invalidText={validationErrors.order}
                />
              </div>
            </FormGroup>

            {/* Photo Section */}
            <div className="employee-form-photo-section">
              <FormGroup legendText={t("form.photo.label")}>
                <EmployeePhotoUpload
                  currentImage={getCurrentImageUrl()}
                  onUpload={handlePhotoUpload}
                  onRemove={handlePhotoRemove}
                  isUploading={createMutation.isPending}
                  showPreview={true}
                  showHeader={false}
                  allowRemove={true}
                />
              </FormGroup>
            </div>

            {/* Contact Information Section */}
            <div className="employee-form-contact-section">
              <FormGroup legendText={t("form.contactInfo.label")}>
                <ContactInfoForm
                  contactInfo={{
                    mobileNumber: createEmployeeForm.mobileNumber,
                    telephone: createEmployeeForm.telephone,
                    email: createEmployeeForm.email,
                    roomNumber: createEmployeeForm.roomNumber,
                  }}
                  onChange={(c) => {
                    updateEmployeeFormField(
                      "create",
                      "mobileNumber",
                      c.mobileNumber || ""
                    );
                    updateEmployeeFormField(
                      "create",
                      "telephone",
                      c.telephone || ""
                    );
                    updateEmployeeFormField("create", "email", c.email || "");
                    updateEmployeeFormField(
                      "create",
                      "roomNumber",
                      c.roomNumber || ""
                    );
                  }}
                />
              </FormGroup>
            </div>

            {/* Status Section */}
            <div className="employee-form-status-section">
              <FormGroup legendText={t("form.status.label")}>
                <Toggle
                  id="employee-isActive"
                  labelText={t("form.isActive.label")}
                  toggled={createEmployeeForm.isActive}
                  onToggle={(checked) =>
                    updateEmployeeFormField("create", "isActive", checked)
                  }
                />
              </FormGroup>
            </div>

            {/* Homepage Display Section */}
            <div className="employee-form-homepage-section">
              <FormGroup legendText={t("form.homepageDisplay.label")}>
                <div className="employee-form-homepage-desc">
                  <p className="employee-form-homepage-desc-text">
                    {t("form.homepageDisplay.description")}
                  </p>
                </div>
                <div className="employee-form-homepage-toggles">
                  <Toggle
                    id="employee-showUpInHomepage"
                    labelText={t("form.homepageDisplay.showUpInHomepage.label")}
                    toggled={createEmployeeForm.showUpInHomepage}
                    onToggle={(checked) => {
                      console.log("Toggle showUpInHomepage:", checked);
                      updateEmployeeFormField(
                        "create",
                        "showUpInHomepage",
                        checked
                      );
                    }}
                  />
                  <Toggle
                    id="employee-showDownInHomepage"
                    labelText={t(
                      "form.homepageDisplay.showDownInHomepage.label"
                    )}
                    toggled={createEmployeeForm.showDownInHomepage}
                    onToggle={(checked) => {
                      console.log("Toggle showDownInHomepage:", checked);
                      updateEmployeeFormField(
                        "create",
                        "showDownInHomepage",
                        checked
                      );
                    }}
                  />
                </div>
              </FormGroup>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
