
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
  const t = useTranslations("hr-employees");
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
    panelOpen,
    panelMode,
    activeEntity,
  } = useHRUIStore();

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
      try {
        e.preventDefault();
      } catch (_) {}
      try {
        e.stopPropagation();
      } catch (_) {}
      submit();
    };

    const container = document.getElementById("hr-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler as EventListener);
    }
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
  }, [employee.id, formData, selectedFile]);

  // Reset and unmount if the active panel no longer matches this edit form
  useEffect(() => {
    if (!panelOpen || activeEntity !== "employee" || panelMode !== "edit") {
      try {
        resetEmployeeForm(employee.id);
      } catch {}
      try {
        resetFormState(employee.id);
      } catch {}
      try {
        setSelectedFile(employee.id, null);
      } catch {}
    }
  }, [panelOpen, activeEntity, panelMode, employee.id, resetEmployeeForm, resetFormState, setSelectedFile]);

  if (!panelOpen || activeEntity !== "employee" || panelMode !== "edit") {
    return null;
  }

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
      let uploadedPhotoMediaId: string | undefined =
        formData.photoMediaId || undefined;
      if (selectedFile) {
        try {
          const uploaded = await uploadPhotoMutation.mutateAsync({
            id: employee.id,
            file: selectedFile,
          });
          uploadedPhotoMediaId = (uploaded &&
            (uploaded.photoMediaId || uploaded.photo?.id)) as
            | string
            | undefined;
          if (uploaded && uploaded.photo?.presignedUrl) {
            setTempImageUrl(uploaded.photo.presignedUrl);
          }
          setSelectedFile(employee.id, null);
        } catch (err) {
          console.error("Employee photo upload failed during submit:", err);
        }
      }

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
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    setSelectedFile(employee.id, file);
  };

  const handlePhotoRemove = async () => {
    if (selectedFile) {
      setSelectedFile(employee.id, null);
    } else if (employee.photoMediaId) {
      try {
        await removePhotoMutation.mutateAsync(employee.id);
      } catch (error) {
        console.error("Photo removal failed:", error);
      }
    }
  };

  const getCurrentImageUrl = (): string | undefined => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    if (tempImageUrl) return tempImageUrl;
    if (employee.photo?.presignedUrl) return employee.photo.presignedUrl;
    if (employee.photo?.url) return employee.photo.url;
    return undefined;
  };

  useEffect(() => {
    setTempImageUrl(undefined);
  }, [employee.photoMediaId, employee.photo?.presignedUrl]);

  return (
    <div>
      <div id="hr-form">
        <div className="employee-form-actionbar employee-form-actionbar--edit"></div>
        {isSubmitting && (
          <div className="employee-form-loading">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
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

        {/* Photo Section */}
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

        {/* Contact Info */}
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

        {/* Homepage Display Section (Added from Create Form) */}
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
                toggled={formData.showUpInHomepage}
                onToggle={(checked) =>
                  updateEmployeeFormField(
                    employee.id,
                    "showUpInHomepage",
                    checked
                  )
                }
              />
              <Toggle
                id="employee-showDownInHomepage"
                labelText={t("form.homepageDisplay.showDownInHomepage.label")}
                toggled={formData.showDownInHomepage}
                onToggle={(checked) =>
                  updateEmployeeFormField(
                    employee.id,
                    "showDownInHomepage",
                    checked
                  )
                }
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};
