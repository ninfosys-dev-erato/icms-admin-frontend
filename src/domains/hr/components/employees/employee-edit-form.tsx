"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { useTranslations, useLocale } from "next-intl";
import { useHRUIStore } from "../../stores/hr-ui-store";
import {
  useDepartments,
  useUpdateEmployee,
  useUploadEmployeePhoto,
  useRemoveEmployeePhoto,
} from "../../hooks/use-hr-queries";
import { TranslatableField } from "../shared/translatable-field";
import { ContactInfoForm } from "../shared/contact-info-form";
import { EmployeePhotoUpload } from "./employee-photo-upload";
import type { EmployeeResponseDto } from "../../types/employee";

interface EmployeeEditFormProps {
  employee: EmployeeResponseDto;
  onSuccess?: () => void;
}

export const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  onSuccess,
}) => {
  // Temporary state for instant preview after upload
  const t = useTranslations("hr-employees");
  // Use shared HR namespace for common labels like sections and actions
  const tHr = useTranslations("hr");
  const updateMutation = useUpdateEmployee();
  const uploadPhotoMutation = useUploadEmployeePhoto();
  const removePhotoMutation = useRemoveEmployeePhoto();
  const {
    isSubmitting,
    setSubmitting,
    employeeFormById,
    updateEmployeeFormField,
    resetEmployeeForm,
    selectedFileById,
    setSelectedFile,
    resetFormState,
  } = useHRUIStore();
  // Temporary state for instant preview after upload
  const [tempImageUrl, setTempImageUrl] = useState<string | undefined>(
    undefined
  );

  const formData = employeeFormById[employee.id] ?? {
    name: employee.name,
    departmentId: employee.departmentId,
    position: employee.position,
    order: employee.order,
    mobileNumber: employee.mobileNumber || "",
    telephone: employee.telephone || "",
    email: employee.email || "",
    roomNumber: employee.roomNumber || "",
    isActive: employee.isActive,
    photoMediaId: employee.photoMediaId || "",
    showUpInHomepage: employee.showUpInHomepage ?? false,
    showDownInHomepage: employee.showDownInHomepage ?? false,
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeNameLang, setActiveNameLang] = useState<"en" | "ne">("en");
  const [activePositionLang, setActivePositionLang] = useState<"en" | "ne">(
    "en"
  );

  const departmentsQuery = useDepartments({ page: 1, limit: 100 });
  const locale = useLocale();
  const departmentItems = (departmentsQuery.data?.data ?? []).map((d) => ({
    id: d.id,
    label:
      d.departmentName?.[locale as "en" | "ne"] ||
      d.departmentName.en ||
      d.departmentName.ne,
  }));
  const selectedDepartmentItem = useMemo(
    () => departmentItems.find((d) => d.id === formData.departmentId) || null,
    [departmentItems, formData.departmentId]
  );

  const selectedFile = selectedFileById[employee.id] ?? null;

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent default for native submit events
      try {
        e.preventDefault();
      } catch (_) {
        // some custom events may not support preventDefault
      }
      try {
        e.stopPropagation();
      } catch (_) {}
      submit();
    };

    const container = document.getElementById("hr-form");
    const form = container?.closest("form");

    // Attach to native form submit if a form element exists
    if (form) {
      form.addEventListener("submit", handler as EventListener);
    }

    // Also listen for a custom 'formSubmit' event on the container.
    // The sidebar may dispatch this when there is no enclosing <form>.
    if (container) {
      container.addEventListener("formSubmit", handler as EventListener);
    }

    return () => {
      if (form) {
        form.removeEventListener("submit", handler as EventListener);
      }
      if (container) {
        container.removeEventListener("formSubmit", handler as EventListener);
      }
    };
    // Re-run effect when selectedFile changes so the attached handler uses
    // the latest submit closure (which captures the current selectedFile).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id, formData, selectedFile]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.en.trim()) {
      errors.name_en = t("errors.validation.nameEnRequired", {
        default: t("errors.validation.nameRequired"),
      });
    }
    if (!formData.name.ne.trim()) {
      errors.name_ne = t("errors.validation.nameNeRequired", {
        default: t("errors.validation.nameRequired"),
      });
    }
    if (!formData.position.en.trim()) {
      errors.position_en = t("errors.validation.positionEnRequired", {
        default: t("errors.validation.positionRequired"),
      });
    }
    if (!formData.position.ne.trim()) {
      errors.position_ne = t("errors.validation.positionNeRequired", {
        default: t("errors.validation.positionRequired"),
      });
    }
    if (!formData.departmentId) {
      errors.departmentId = t("errors.validation.departmentRequired");
    }
    if (formData.order < 0) {
      errors.order = t("errors.validation.orderInvalid");
    }
    setValidationErrors(errors);
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
    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }
    try {
      // If a new photo file is selected, upload it first so we can include
      // the resulting media id in the main update payload. This prevents
      // ordering/race issues where the payload update expects the photo id.
      let uploadedPhotoMediaId: string | undefined =
        formData.photoMediaId || undefined;
      if (selectedFile) {
        try {
          const uploaded = await uploadPhotoMutation.mutateAsync({
            id: employee.id,
            file: selectedFile,
          });
          // The upload returns the updated employee; prefer its photoMediaId if present
          uploadedPhotoMediaId = (uploaded &&
            (uploaded.photoMediaId || uploaded.photo?.id)) as
            | string
            | undefined;
          // Use the new image URL for instant preview
          if (uploaded && uploaded.photo?.presignedUrl) {
            setTempImageUrl(uploaded.photo.presignedUrl);
          }
          // Clear the selected file from UI state after successful upload
          setSelectedFile(employee.id, null);
        } catch (err) {
          console.error("Employee photo upload failed during submit:", err);
          // Let the update proceed without the photo if upload failed
        }
      }

      // Update employee data (include uploadedPhotoMediaId when available)
      await updateMutation.mutateAsync({
        id: employee.id,
        data: {
          name: formData.name,
          departmentId: formData.departmentId,
          position: formData.position,
          order: formData.order,
          mobileNumber: formData.mobileNumber || undefined,
          telephone: formData.telephone || undefined,
          email: formData.email || undefined,
          roomNumber: formData.roomNumber || undefined,
          isActive: formData.isActive,
          showUpInHomepage: formData.showUpInHomepage,
          showDownInHomepage: formData.showDownInHomepage,
          ...(uploadedPhotoMediaId
            ? { photoMediaId: uploadedPhotoMediaId }
            : {}),
        },
      });

      resetEmployeeForm(employee.id);
      resetFormState(employee.id);
      setValidationErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    setSelectedFile(employee.id, file);
  };

  const handlePhotoRemove = async () => {
    if (selectedFile) {
      // Remove the newly selected file
      setSelectedFile(employee.id, null);
    } else if (employee.photoMediaId) {
      // Remove the existing photo from the server
      try {
        await removePhotoMutation.mutateAsync(employee.id);
      } catch (error) {
        console.error("Photo removal failed:", error);
      }
    }
  };

  const getCurrentImageUrl = (): string | undefined => {
    // 1. If a new file is selected, show its preview instantly
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    // 2. If a temp image URL is set (after upload), show it
    if (tempImageUrl) {
      return tempImageUrl;
    }
    // 3. Otherwise, show the employee's current photo
    if (employee.photo?.presignedUrl) {
      return employee.photo.presignedUrl;
    }
    if (employee.photo?.url) {
      return employee.photo.url;
    }
    // 4. No image available
    return undefined;
  };

  // Clear tempImageUrl when employee object updates (after refetch)
  useEffect(() => {
    setTempImageUrl(undefined);
  }, [employee.photoMediaId, employee.photo?.presignedUrl]);

  return (
    <div>
      <div id="hr-form">
        {/* Top action bar */}
        {/* reset button removed from edit form */}
        <div className="employee-form-actionbar employee-form-actionbar--edit">
        </div>
        {isSubmitting && (
          <div className="employee-form-loading">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText={""}>
              <h3 className="employee-form-title">{tHr("sections.basicInfo")}</h3>
              <TranslatableField
                label={t("form.name.label")}
                value={formData.name}
                onChange={(v) =>
                  updateEmployeeFormField(employee.id, "name", v)
                }
                placeholder={{
                  en: t("form.name.placeholder.en"),
                  ne: t("form.name.placeholder.ne"),
                }}
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
                  value={formData.position}
                  onChange={(v) =>
                    updateEmployeeFormField(employee.id, "position", v)
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
                <div className="employee-form-field-row">
                  <Column lg={8} md={4} sm={4}>
                    <Dropdown
                      id="employee-department"
                      items={departmentItems}
                      itemToString={(i) => (i ? i.label : "")}
                      selectedItem={selectedDepartmentItem}
                      onChange={({ selectedItem }) =>
                        updateEmployeeFormField(
                          employee.id,
                          "departmentId",
                          selectedItem?.id || ""
                        )
                      }
                      invalid={!!validationErrors.departmentId}
                      invalidText={validationErrors.departmentId}
                      label={t("form.department.label")}
                      titleText={t("form.department.label")}
                    />
                  </Column>

                  <Column lg={8} md={4} sm={4}>
                    <NumberInput
                      id="employee-order"
                      label={t("form.order.label")}
                      value={formData.order}
                      onChange={(e, { value }) =>
                        value !== undefined &&
                        updateEmployeeFormField(employee.id, "order", value)
                      }
                      min={1}
                      step={1}
                      invalid={!!validationErrors.order}
                      invalidText={validationErrors.order}
                    />
                  </Column>
                </div>
              </div>
            </FormGroup>
          </Column>
        </Grid>

        {/* Photo Section - robust slider logic parity */}
        <div className="employee-form-photo-section">
          <FormGroup legendText={t("form.photo.label")}>
            {getCurrentImageUrl() && (
              <EmployeePhotoUpload
                currentImage={getCurrentImageUrl()}
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
                isUploading={
                  uploadPhotoMutation.isPending || removePhotoMutation.isPending
                }
                showPreview={true}
                showHeader={false}
                allowRemove={false}
              />
            )}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <Button
                kind="secondary"
                size="sm"
                disabled={isSubmitting || uploadPhotoMutation.isPending}
                onClick={() => {
                  const input = document.getElementById(
                    `employee-photo-input-change-${employee.id}`
                  );
                  if (input) {
                    input.click();
                  }
                }}
              >
                {t("form.photo.changeButton", { default: "Change Photo" })}
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                id={`employee-photo-input-change-${employee.id}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePhotoUpload(file);
                  }
                }}
                disabled={isSubmitting || uploadPhotoMutation.isPending}
              />
            </div>
          </FormGroup>
        </div>

        {/* Photo Section */}
        {/* <div className="employee-form-photo-section">
              <FormGroup legendText={t("form.photo.label")}>
                <EmployeePhotoUpload
                  currentImage={getCurrentImageUrl()}
                  onUpload={handlePhotoUpload}
                  onRemove={handlePhotoRemove}
                  isUploading={
                    uploadPhotoMutation.isPending ||
                    removePhotoMutation.isPending
                  }
                  showPreview={true}
                  showHeader={false}
                  allowRemove={true}
                />
              </FormGroup>
            </div> */}

        {/* Contact Information Section */}
        <div className="employee-form-contact-section">
          <FormGroup legendText={t("form.contactInfo.label")}>
            <ContactInfoForm
              contactInfo={{
                mobileNumber: formData.mobileNumber,
                telephone: formData.telephone,
                email: formData.email,
                roomNumber: formData.roomNumber,
              }}
              onChange={(c) => {
                updateEmployeeFormField(
                  employee.id,
                  "mobileNumber",
                  c.mobileNumber || ""
                );
                updateEmployeeFormField(
                  employee.id,
                  "telephone",
                  c.telephone || ""
                );
                updateEmployeeFormField(employee.id, "email", c.email || "");
                updateEmployeeFormField(
                  employee.id,
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
              toggled={formData.isActive}
              onToggle={(checked) =>
                updateEmployeeFormField(employee.id, "isActive", checked)
              }
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};
