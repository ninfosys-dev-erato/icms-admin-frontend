"use client";

import React, { useEffect, useRef, useState } from "react";
import type { TranslatableEntity } from "@/domains/content-management/types/content";
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
import { useTranslations } from "next-intl";
import { Reset, Image as ImageIcon } from "@carbon/icons-react";
import { useMediaStore } from "../stores/media-store";
import { useUpdateMedia } from "../hooks/use-media-queries";
import TranslatableField from "@/components/shared/translatable-field";
// no file upload in edit mode
import type { Media } from "../types/media";
import MediaUrlService from "@/services/media-url-service";
import { mediaRepository } from "../repositories/media-repository";

export const MediaEditForm: React.FC<{
  media: Media;
  onSuccess?: () => void;
}> = ({ media, onSuccess }) => {
  const {
    isSubmitting,
    setSubmitting,
    formStateById,
    updateFormField,
    resetFormState,
  } = useMediaStore();
  const formData = formStateById[media.id] ?? {
    title: { en: media.title ?? "", ne: "" },
    description: { en: media.description ?? "", ne: "" },
    altText: { en: media.altText ?? "", ne: "" },
    tags: [...(media.tags ?? [])],
    folder: media.folder,
    isPublic: !!media.isPublic,
    isActive: !!media.isActive,
  };
  // Single errors state for robust validation
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [titleTab, setTitleTab] = useState<"en" | "ne">("en");
  const [descTab, setDescTab] = useState<"en" | "ne">("en");
  const [altTab, setAltTab] = useState<"en" | "ne">("en");
  const updateMutation = useUpdateMedia();
  const t = useTranslations("media");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Robust per-language validation and tab switching
  const validate = (): boolean => {
    const errs: Record<string, any> = {};
    let firstInvalidTitleLang: "en" | "ne" | null = null;
    let firstInvalidDescLang: "en" | "ne" | null = null;
    let firstInvalidAltLang: "en" | "ne" | null = null;

    const title = formData.title ?? { en: "", ne: "" };
    const description = formData.description ?? { en: "", ne: "" };
    const altText = formData.altText ?? { en: "", ne: "" };

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

    if (!formData.folder) errs.folder = t("form.validation.folderRequired");

    setErrors(errs);

    // Switch tabs for first invalid language in each field
    if (firstInvalidTitleLang) setTitleTab(firstInvalidTitleLang);
    if (firstInvalidDescLang) setDescTab(firstInvalidDescLang);
    if (firstInvalidAltLang) setAltTab(firstInvalidAltLang);

    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    // Resolve preview image: prefer existing presigned/url; fallback to fresh presigned URL
    let mounted = true;
    const existing = media.presignedUrl || media.url || "";
    const setIfMounted = (u: string | null) => {
      if (mounted) setImageUrl(u ? MediaUrlService.toProxyUrl(u) : null);
    };
    if (existing) {
      setIfMounted(existing);
    } else {
      setIsPreviewLoading(true);
      mediaRepository
        .getPresignedUrl(media.id)
        .then((res) => {
          setIfMounted(res?.presignedUrl || null);
        })
        .catch(() => {
          setIfMounted(null);
        })
        .finally(() => {
          if (mounted) setIsPreviewLoading(false);
        });
    }

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
    const container = document.getElementById("media-form");
    const form = container?.closest("form");
    if (form) {
      form.addEventListener("submit", handler);
    }
    container?.addEventListener("media:submit", custom as any);
    return () => {
      if (form) form.removeEventListener("submit", handler);
      container?.removeEventListener("media:submit", custom as any);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.id, media.presignedUrl, media.url, formData]);

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) {
      setSubmitting(false);
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: media.id, data: formData as any });
      setErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
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
            resetFormState(media.id);
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
          {/* Read-only current file preview */}
          <div className="media-edit-preview m--mb-1">
            <div className="card-image media-edit-image--height">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={formData.altText?.en || media.originalName}
                  className="preview-image"
                />
              ) : (
                <div className="media-card__placeholder">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
          </div>

          <FormGroup legendText="">
            <TranslatableField
              label={t("form.title") as any}
              value={formData.title as any}
              onChange={(val: TranslatableEntity) => {
                updateFormField(media.id, "title", val);
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
                selectedItem={{ id: formData.folder, label: formData.folder }}
                onChange={({ selectedItem }) =>
                  updateFormField(
                    media.id,
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
            <div className="m--mt-1">
              <Toggle
                id="media-isPublic"
                labelText={t("form.isPublic")}
                toggled={formData.isPublic}
                onToggle={(checked) =>
                  updateFormField(media.id, "isPublic", checked)
                }
              />
            </div>
            <div className="m--mt-1">
              <Toggle
                id="media-isActive"
                labelText={t("form.isActive")}
                toggled={formData.isActive}
                onToggle={(checked) =>
                  updateFormField(media.id, "isActive", checked)
                }
              />
            </div>

            <Accordion className="media-upload-accordion">
              <AccordionItem title="Additional Settings">
                <div className="m--mt-1">
                  <TranslatableField
                    type="textarea"
                    label={t("form.description") as any}
                    value={formData.description as any}
                    onChange={(val: TranslatableEntity) =>
                      updateFormField(media.id, "description", val)
                    }
                    activeTab={descTab}
                    setActiveTab={setDescTab}
                  />
                </div>
                <div className="m--mt-1">
                  <TranslatableField
                    label={t("form.altText") as any}
                    value={formData.altText as any}
                    onChange={(val: TranslatableEntity) =>
                      updateFormField(media.id, "altText", val)
                    }
                    activeTab={altTab}
                    setActiveTab={setAltTab}
                  />
                </div>
                <div className="m--mt-1">
                  <TextInput
                    id="media-tags"
                    labelText={t("form.tags")}
                    value={formData.tags.join(", ")}
                    onChange={(e) =>
                      updateFormField(
                        media.id,
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
