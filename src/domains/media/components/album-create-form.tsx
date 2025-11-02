"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Column,
  FormGroup,
  Grid,
  InlineLoading,
  Toggle,
} from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useAlbumStore } from "../stores/album-store";
import { useCreateAlbum } from "../hooks/use-album-queries";
import { useTranslations } from "next-intl";
import TranslatableField from "@/components/shared/translatable-field";

export const AlbumCreateForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    resetFormState,
  } = useAlbumStore();
  const [validationErrors, setValidationErrors] = useState<{
    name?: { en?: string; ne?: string };
    description?: { en?: string; ne?: string };
    form?: string;
  }>({});
  const [nameTab, setNameTab] = useState<"en" | "ne">("en");
  const [descTab, setDescTab] = useState<"en" | "ne">("en");
  const createMutation = useCreateAlbum();
  const t = useTranslations("media.albums");

  const validate = (): boolean => {
    const errors: {
      name?: { en?: string; ne?: string };
      description?: { en?: string; ne?: string };
      form?: string;
    } = {};
    let firstInvalidNameLang: "en" | "ne" | null = null;
    let firstInvalidDescLang: "en" | "ne" | null = null;
    if (!createFormState.name.en.trim()) {
      errors.name = {
        ...(errors.name || {}),
        en: t("form.validation.nameRequired.en"),
      };
      if (!firstInvalidNameLang) firstInvalidNameLang = "en";
    }
    if (!createFormState.name.ne.trim()) {
      errors.name = {
        ...(errors.name || {}),
        ne: t("form.validation.nameRequired.ne"),
      };
      if (!firstInvalidNameLang) firstInvalidNameLang = "ne";
    }
    if (!createFormState.description.en.trim()) {
      errors.description = {
        ...(errors.description || {}),
        en: t("form.validation.descriptionRequired.en"),
      };
      if (!firstInvalidDescLang) firstInvalidDescLang = "en";
    } else if (!createFormState.description.ne.trim()) {
      errors.description = {
        ...(errors.description || {}),
        ne: t("form.validation.descriptionRequired.ne"),
      };
      if (!firstInvalidDescLang) firstInvalidDescLang = "ne";
    }
    setValidationErrors(errors);
    if (firstInvalidNameLang) setNameTab(firstInvalidNameLang);
    if (firstInvalidDescLang) setDescTab(firstInvalidDescLang);
    return !errors.name && !errors.description;
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    const custom = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    const container = document.getElementById("album-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler);
    }
    container?.addEventListener("album:submit", custom as any);
    return () => {
      if (form) form.removeEventListener("submit", handler);
      container?.removeEventListener("album:submit", custom as any);
    };
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFormState]);

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: createFormState.name,
        description: createFormState.description,
        isActive: createFormState.isActive,
      } as any);
      resetFormState("create");
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
      <div className="flex--row-end m--mb-05 header">
        <h3 className="section-title">{t("sections.basicInfo")}</h3>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Reset}
          onClick={() => {
            resetFormState("create");
            setValidationErrors({});
          }}
          disabled={isSubmitting}
        >
          {t("actions.reset")}
        </Button>
      </div>
      {isSubmitting && (
        <div className="m--mb-1">
          <InlineLoading description={t("form.saving")} />
        </div>
      )}

      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <FormGroup legendText={""}>
            <TranslatableField
              label={t("form.nameEn") as any}
              value={createFormState.name}
              onChange={(val) => {
                updateFormField("create", "name", val);
              }}
              invalid={!!validationErrors.name}
              invalidText={
                validationErrors.name &&
                (validationErrors.name.en || validationErrors.name.ne)
                  ? `${validationErrors.name.en || ""} ${validationErrors.name.ne || ""}`.trim()
                  : undefined
              }
              activeTab={nameTab}
              setActiveTab={setNameTab}
            />
            <div className="m--mt-1">
              <TranslatableField
                type="textarea"
                label={t("form.descriptionEn") as any}
                value={createFormState.description}
                onChange={(val) =>
                  updateFormField("create", "description", val)
                }
                invalid={!!validationErrors.description}
                invalidText={
                  validationErrors.description &&
                  (validationErrors.description.en ||
                    validationErrors.description.ne)
                    ? `${validationErrors.description.en || ""} ${validationErrors.description.ne || ""}`.trim()
                    : undefined
                }
                activeTab={descTab}
                setActiveTab={setDescTab}
              />
            </div>
            <div className="m--mt-1">
              <Toggle
                id="album-isActive"
                labelText={t("form.isActive")}
                toggled={createFormState.isActive}
                onToggle={(checked) =>
                  updateFormField("create", "isActive", checked)
                }
              />
            </div>
          </FormGroup>
        </Column>
      </Grid>
    </div>
  );
};
