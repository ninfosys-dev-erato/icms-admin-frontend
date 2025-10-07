"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Grid, Column, Select, SelectItem, InlineLoading, FormGroup, Button } from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { useOfficeDescriptionUIStore } from "../stores/office-description-ui-store";
import { useCreateOfficeDescription, useUpdateOfficeDescription } from "../hooks/use-office-description-queries";
import { safeErrorToString } from "@/shared/utils/error-utils";
import { TranslatableField } from "@/components/shared/translatable-field";

import { OfficeDescription, OfficeDescriptionType } from "../types/office-description";

interface OfficeDescriptionFormProps {
  mode: "create" | "edit";
  description?: OfficeDescription | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const OfficeDescriptionForm: React.FC<OfficeDescriptionFormProps> = ({ 
  mode, 
  description, 
  onSuccess, 
  onCancel, 
  className = "" 
}) => {
  const t = useTranslations("office-description");
  const { 
    formStateById,
    createFormState,
    activeFormId,
    updateFormField, 
    resetFormState, 
    isSubmitting, 
    setSubmitting 
  } = useOfficeDescriptionUIStore();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateOfficeDescription();
  const updateMutation = useUpdateOfficeDescription();

  // Get current form data based on mode and activeFormId
  const getCurrentFormData = useCallback(() => {
    if (mode === "create") {
      return createFormState;
    } else if (mode === "edit" && activeFormId && activeFormId !== 'create') {
      return formStateById[activeFormId] || createFormState;
    }
    return createFormState;
  }, [mode, activeFormId, formStateById, createFormState]);

  const formData = getCurrentFormData();

  // Form submission handler
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submitForm();
    };
    const container = document.getElementById('office-description-form');
    const form = container?.closest('form');
    if (form) {
      form.addEventListener('submit', handler);
      return () => form.removeEventListener('submit', handler);
    }
    return undefined;
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.officeDescriptionType) {
      errors.officeDescriptionType = t("errors.validation.typeRequired");
    }
    
    if (!formData.content.en.trim() && !formData.content.ne.trim()) {
      errors.content = t("errors.validation.contentRequired");
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, t]);

  const submitForm = useCallback(async () => {
    setError(null);
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createMutation.mutateAsync({ 
          officeDescriptionType: formData.officeDescriptionType, 
          content: formData.content 
        });
      } else if (mode === "edit" && description) {
        await updateMutation.mutateAsync({ 
          id: description.id, 
          data: { content: formData.content } 
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }, [setError, validateForm, setSubmitting, mode, createMutation, updateMutation, description, formData, onSuccess]);

  const handleReset = () => {
    if (mode === "create") {
      resetFormState("create");
    } else if (mode === "edit" && activeFormId && activeFormId !== 'create') {
      resetFormState(activeFormId);
    }
    setValidationErrors({});
    setError(null);
  };

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={className}>
      <div id="office-description-form">
        {/* Top action bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleReset}
            disabled={isSubmittingForm}
          >
            {t("form.reset")}
          </Button>
        </div>

        {isSubmittingForm && (
          <div style={{ marginBottom: '1rem' }}>
            <InlineLoading description={t("form.saving")} />
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--cds-support-error)', color: 'white', borderRadius: '4px' }}>
            {safeErrorToString(error)}
          </div>
        )}

        <Grid fullWidth>
          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <FormGroup legendText={t("sections.basicInfo")}>
              <Select
                id="office-description-type"
                labelText={t("form.type.label")}
                value={formData.officeDescriptionType}
                onChange={(e) => updateFormField(mode === "create" ? "create" : (activeFormId || "create"), "officeDescriptionType", e.target.value as OfficeDescriptionType)}
                invalid={!!validationErrors.officeDescriptionType}
                invalidText={validationErrors.officeDescriptionType}
                disabled={isSubmittingForm}
                required
              >
                <SelectItem value="" text={t("form.type.placeholder")} />
                <SelectItem value={OfficeDescriptionType.INTRODUCTION} text={t("types.INTRODUCTION")} />
                <SelectItem value={OfficeDescriptionType.OBJECTIVE} text={t("types.OBJECTIVE")} />
                <SelectItem value={OfficeDescriptionType.WORK_DETAILS} text={t("types.WORK_DETAILS")} />
                <SelectItem value={OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE} text={t("types.ORGANIZATIONAL_STRUCTURE")} />
                <SelectItem value={OfficeDescriptionType.DIGITAL_CHARTER} text={t("types.DIGITAL_CHARTER")} />
                <SelectItem value={OfficeDescriptionType.EMPLOYEE_SANCTIONS} text={t("types.EMPLOYEE_SANCTIONS")} />
              </Select>

              <div style={{ marginTop: '1rem' }}>
                <TranslatableField
                  label={t("form.content.label")}
                  value={formData.content}
                  onChange={(value) => updateFormField(mode === "create" ? "create" : (activeFormId || "create"), "content", value)}
                  placeholder={{ 
                    en: t("form.content.placeholder.en"), 
                    ne: t("form.content.placeholder.ne") 
                  }}
                  multiline
                  rows={6}
                  required
                  invalid={!!validationErrors.content}
                  invalidText={validationErrors.content}
                  disabled={isSubmittingForm}
                />
              </div>
            </FormGroup>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
