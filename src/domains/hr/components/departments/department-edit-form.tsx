"use client";

import React, { useEffect, useMemo, useState } from "react";
import "../../styles/hr.css";
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
  useDepartments,
  useUpdateDepartment,
} from "../../hooks/use-hr-queries";
import { TranslatableField } from "../shared/translatable-field";
import type { DepartmentResponseDto } from "../../types/department";

interface DepartmentEditFormProps {
  department: DepartmentResponseDto;
  onSuccess?: () => void;
}

export const DepartmentEditForm: React.FC<DepartmentEditFormProps> = ({
  department,
  onSuccess,
}) => {
  const t = useTranslations("hr-departments");
  const tHr = useTranslations("hr");
  const updateMutation = useUpdateDepartment();
  const {
    isSubmitting,
    setSubmitting,
    departmentFormById,
    updateDepartmentFormField,
    resetDepartmentForm,
  } = useHRUIStore();
  const formData = departmentFormById[department.id] ?? {
    departmentName: department.departmentName,
    parentId: department.parentId || "",
    departmentHeadId: department.departmentHeadId || "",
    order: department.order,
    isActive: department.isActive,
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeDeptNameLang, setActiveDeptNameLang] = useState<"en" | "ne">("en");

  const departmentsQuery = useDepartments({ page: 1, limit: 100 });
  const parentItems = (departmentsQuery.data?.data ?? [])
    .filter((d) => d.id !== department.id)
    .map((d) => ({ id: d.id, label: d.departmentName.en }));
  const selectedParentItem = useMemo(
    () => parentItems.find((d) => d.id === formData.parentId) || null,
    [parentItems, formData.parentId]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department.id, formData]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.departmentName.en.trim()) {
      errors.departmentName_en = t("errors.validation.nameEnRequired", { default: t("errors.validation.nameRequired") });
    } else if (formData.departmentName.en.trim().length < 3) {
      errors.departmentName_en = t("errors.validation.nameMinLength");
    }
    if (!formData.departmentName.ne.trim()) {
      errors.departmentName_ne = t("errors.validation.nameNeRequired", { default: t("errors.validation.nameRequired") });
    }
    if (formData.order < 0) {
      errors.order = t("errors.validation.orderInvalid");
    }
    setValidationErrors(errors);
    if (errors.departmentName_ne && !errors.departmentName_en) {
      setActiveDeptNameLang("ne");
    } else if (errors.departmentName_en && !errors.departmentName_ne) {
      setActiveDeptNameLang("en");
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
      await updateMutation.mutateAsync({
        id: department.id,
        data: {
          departmentName: formData.departmentName,
          parentId: formData.parentId || undefined,
          departmentHeadId: formData.departmentHeadId || undefined,
          order: formData.order,
          isActive: formData.isActive,
        },
      });
      resetDepartmentForm(department.id);
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
      <div id="hr-form">
        {/* Top action bar */}
        <div className="department-edit-form-actionbar">
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={() => {
              resetDepartmentForm(department.id);
              setValidationErrors({});
            }}
            disabled={isSubmitting}
          >
            {tHr("actions.reset", { default: "Reset" })}
          </Button>
        </div>
        {isSubmitting && (
          <div className="department-edit-form-loading">
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText={tHr("sections.basicInfo")}>
              <TranslatableField
                label={t("form.name.label")}
                value={formData.departmentName}
                onChange={(v) =>
                  updateDepartmentFormField(department.id, "departmentName", v)
                }
                placeholder={{
                  en: t("form.name.placeholder.en"),
                  ne: t("form.name.placeholder.ne"),
                }}
                required
                invalid={!!validationErrors.departmentName_en || !!validationErrors.departmentName_ne}
                invalidText={validationErrors.departmentName_en || validationErrors.departmentName_ne}
                invalidMessages={{
                  en: validationErrors.departmentName_en ? { invalid: true, text: validationErrors.departmentName_en } : undefined,
                  ne: validationErrors.departmentName_ne ? { invalid: true, text: validationErrors.departmentName_ne } : undefined,
                }}
                activeLanguage={activeDeptNameLang}
                onActiveLanguageChange={setActiveDeptNameLang}
              />

              <div className="department-edit-form-row">
                <Dropdown
                  id="department-parent"
                  items={parentItems}
                  itemToString={(i) => (i ? i.label : "")}
                  selectedItem={selectedParentItem}
                  onChange={({ selectedItem }) =>
                    updateDepartmentFormField(
                      department.id,
                      "parentId",
                      selectedItem?.id || ""
                    )
                  }
                  label={t("form.parent.label")}
                  titleText={t("form.parent.label")}
                />
              </div>

              <div className="department-edit-form-row">
                <NumberInput
                  id="department-order"
                  label={t("form.order.label")}
                  value={formData.order}
                  onChange={(e, { value }) =>
                    value !== undefined &&
                    updateDepartmentFormField(department.id, "order", value)
                  }
                  min={1}
                  step={1}
                  invalid={!!validationErrors.order}
                  invalidText={validationErrors.order}
                />
              </div>
            </FormGroup>

            {/* Status Section */}
            <div className="department-edit-form-status-section">
              <FormGroup legendText={t("form.status.label")}>
                <Toggle
                  id="department-isActive"
                  labelText={t("form.isActive.label")}
                  toggled={formData.isActive}
                  onToggle={(checked) =>
                    updateDepartmentFormField(
                      department.id,
                      "isActive",
                      checked
                    )
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
