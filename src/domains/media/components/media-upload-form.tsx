"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Column,
  Dropdown,
  FormGroup,
  Grid,
  InlineLoading,
  TextArea,
  TextInput,
  Toggle,
  Accordion,
  AccordionItem,
} from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useMediaStore } from "../stores/media-store";
import { useBulkUploadMedia, useUploadMedia } from "../hooks/use-media-queries";
import { useTranslations } from "next-intl";
import FileUpload from "@/components/shared/file-upload/FileUpload";
import { MediaFilePreview } from "./media-file-preview";
import TranslatableField from "@/components/shared/translatable-field";
import type { TranslatableEntity } from "@/domains/content-management/types/content";

export const MediaUploadForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const {
    isSubmitting,
    setSubmitting,
    createFormState,
    updateFormField,
    resetFormState,
    createSelectedFile,
    setSelectedFile,
  } = useMediaStore();
  // Single errors state, like category-form
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");
  const [descTab, setDescTab] = useState<"en" | "ne">("en");
  const [altTab, setAltTab] = useState<"en" | "ne">("en");
  const upload = useUploadMedia();
  const bulkUpload = useBulkUploadMedia();
  const [files, setFiles] = useState<File[]>([]);
  const t = useTranslations("media");

  // Validation and tab switching like category-form
  const validate = (): boolean => {
    const errs: Record<string, any> = {};
    let firstInvalidTitleLang: "en" | "ne" | null = null;
    let firstInvalidDescLang: "en" | "ne" | null = null;
    let firstInvalidAltLang: "en" | "ne" | null = null;

    const title = createFormState.title ?? { en: "", ne: "" };
    const description = createFormState.description ?? { en: "", ne: "" };
    const altText = createFormState.altText ?? { en: "", ne: "" };

    // Title validation
    if (!title.en?.trim()) {
      errs.title = {
        ...(errs.title || {}),
        en: t("form.validation.titleRequired.en"),
      };
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "en";
    }
    if (!title.ne?.trim()) {
      errs.title = {
        ...(errs.title || {}),
        ne: t("form.validation.titleRequired.ne"),
      };
      if (!firstInvalidTitleLang) firstInvalidTitleLang = "ne";
    }

    // Description validation (if required)
    // if (!description.en?.trim()) {
    //   errs.description = { ...(errs.description || {}), en: t("form.validation.descriptionRequiredEn") };
    //   if (!firstInvalidDescLang) firstInvalidDescLang = "en";
    // }
    // if (!description.ne?.trim()) {
    //   errs.description = { ...(errs.description || {}), ne: t("form.validation.descriptionRequiredNe") };
    //   if (!firstInvalidDescLang) firstInvalidDescLang = "ne";
    // }

    // AltText validation (if required)
    // if (!altText.en?.trim()) {
    //   errs.altText = { ...(errs.altText || {}), en: t("form.validation.altTextRequiredEn") };
    //   if (!firstInvalidAltLang) firstInvalidAltLang = "en";
    // }
    // if (!altText.ne?.trim()) {
    //   errs.altText = { ...(errs.altText || {}), ne: t("form.validation.altTextRequiredNe") };
    //   if (!firstInvalidAltLang) firstInvalidAltLang = "ne";
    // }

    if (!files.length) errs.file = t("form.validation.fileRequired");
    if (!createFormState.folder)
      errs.folder = t("form.validation.folderRequired");

    setErrors(errs);

    // Switch tabs for first invalid language in each field
    if (firstInvalidTitleLang) setTitleTab(firstInvalidTitleLang);
    if (firstInvalidDescLang) setDescTab(firstInvalidDescLang);
    if (firstInvalidAltLang) setAltTab(firstInvalidAltLang);

    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    const container = document.getElementById("media-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler);
    }
    const custom = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    };
    container?.addEventListener("media:submit", custom as any);
    return () => {
      if (form) form.removeEventListener("submit", handler);
      container?.removeEventListener("media:submit", custom as any);
    };
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFormState, files]);

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }
    try {
      if (files.length === 1) {
        const [single] = files;
        await upload.mutateAsync({
          file: single as File,
          form: createFormState as any,
        });
      } else {
        await bulkUpload.mutateAsync({ files, form: createFormState as any });
      }
      resetFormState("create");
      setErrors({});
      onSuccess?.();
    } catch (err) {
      // handled by notifications layer
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <div className="flex--row-end m--mb-05">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Reset}
          onClick={() => {
            resetFormState("create");
            setFiles([]);
            setErrors({});
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
          <FormGroup legendText={t("form.files")}>
            <FileUpload
              className="media-multi-upload"
              files={files}
              onFilesChange={setFiles}
              isUploading={
                isSubmitting || upload.isPending || bulkUpload.isPending
              }
              accept="image/*,video/*,audio/*,application/pdf"
              multiple
              renderPreview={(file) => <MediaFilePreview file={file} />}
              labelTitle={t("form.files") as any}
              labelDescription={t("form.validation.fileRequired") as any}
              buttonLabel={t("actions.chooseFiles") as any}
            />
            {errors.file && (
              <div className="cds--form-requirement">{errors.file}</div>
            )}
          </FormGroup>
          {/* title english*/}
          <FormGroup legendText="">
            <TranslatableField
              label={t("form.title") as any}
              value={createFormState.title || { en: "", ne: "" }}
              onChange={(val: TranslatableEntity) => {
                updateFormField("create", "title", val);
              }}
              invalid={!!errors.title}
              invalidText={
                errors.title && (errors.title.en || errors.title.ne)
                  ? `${errors.title.en || ""} ${errors.title.ne || ""}`.trim()
                  : undefined
              }
              activeTab={titleTab}
              setActiveTab={setTitleTab}
            />
            {/* folder */}
            <div className="m--mt-1">
              <Dropdown
                id="media-folder"
                items={[
                  "sliders",
                  "office-settings",
                  "users",
                  "content",
                  "documents",
                  "reports",
                  "videos",
                  "audio",
                  "general",
                ].map((f) => ({ id: f, label: f }))}
                itemToString={(i) => (i ? i.label : "")}
                selectedItem={{
                  id: createFormState.folder,
                  label: createFormState.folder,
                }}
                onChange={({ selectedItem }) =>
                  updateFormField(
                    "create",
                    "folder",
                    selectedItem?.id || "general"
                  )
                }
                label={t("form.folder")}
                titleText={t("form.folder")}
                invalid={!!errors.folder}
                invalidText={errors.folder}
              />
            </div>
            {/* public togglebutton */}
            <div className="m--mt-1">
              <Toggle
                id="media-isPublic"
                labelText={t("form.isPublic")}
                toggled={createFormState.isPublic}
                onToggle={(checked) =>
                  updateFormField("create", "isPublic", checked)
                }
              />
            </div>
            {/* active togglebutton */}
            <div className="m--mt-1">
              <Toggle
                id="media-isActive"
                labelText={t("form.isActive")}
                toggled={createFormState.isActive}
                onToggle={(checked) =>
                  updateFormField("create", "isActive", checked)
                }
              />
            </div>
            <Accordion className="media-upload-accordion">
              <AccordionItem title="Additional Settings">
                {/* description */}
                <div className="m--mt-1">
                  <TranslatableField
                    type="textarea"
                    label={t("form.description") as any}
                    value={createFormState.description || { en: "", ne: "" }}
                    onChange={(val: TranslatableEntity) =>
                      updateFormField("create", "description", val)
                    }
                    activeTab={descTab}
                    setActiveTab={setDescTab}
                  />
                </div>
                {/* alt text */}
                <div className="m--mt-1">
                  <TranslatableField
                    label={t("form.altText") as any}
                    value={createFormState.altText || { en: "", ne: "" }}
                    onChange={(val: TranslatableEntity) =>
                      updateFormField("create", "altText", val)
                    }
                    activeTab={altTab}
                    setActiveTab={setAltTab}
                  />
                </div>
                {/* tags */}
                <div className="m--mt-1">
                  <TextInput
                    id="media-tags"
                    labelText={t("form.tags") as any}
                    value={createFormState.tags.join(", ")}
                    onChange={(e) =>
                      updateFormField(
                        "create",
                        "tags",
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </div>
              </AccordionItem>
            </Accordion>
          </FormGroup>
        </Column>
      </Grid>
    </div>
  );
};
