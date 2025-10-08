"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Button,
  InlineLoading,
  Grid,
  Column,
  Tile,
} from "@carbon/react";
import { Save, Edit, Close } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { TranslatableField } from "@/components/shared/translatable-field";
import { BackgroundPhotoUpload } from "./background-photo-upload";
import {
  OfficeSettings,
  OfficeSettingsFormData,
} from "../types/office-settings";
import { useOfficeSettingsStore } from "../stores/office-settings-store";
import { safeErrorToString } from "@/shared/utils/error-utils";

interface OfficeSettingsFormProps {
  settings?: OfficeSettings | null;
  onSuccess?: () => void;
  className?: string;
}

export const OfficeSettingsForm: React.FC<OfficeSettingsFormProps> = ({
  settings,
  onSuccess,
  className,
}) => {
  const t = useTranslations("office-settings");
  // Try more explicit store access to ensure re-renders
  const loading = useOfficeSettingsStore((state) => state.loading);
  const error = useOfficeSettingsStore((state) => state.error);
  const isEditing = useOfficeSettingsStore((state) => state.isEditing);
  const isUploading = useOfficeSettingsStore((state) => state.isUploading);

  const updateSettings = useOfficeSettingsStore(
    (state) => state.updateSettings
  );
  const uploadBackgroundPhoto = useOfficeSettingsStore(
    (state) => state.uploadBackgroundPhoto
  );
  const removeBackgroundPhoto = useOfficeSettingsStore(
    (state) => state.removeBackgroundPhoto
  );

  const upsertSettings = useOfficeSettingsStore(
    (state) => state.upsertSettings
  );

  const setEditing = useOfficeSettingsStore((state) => state.setEditing);
  const clearError = useOfficeSettingsStore((state) => state.clearError);

  const [formData, setFormData] = useState<OfficeSettingsFormData>({
    directorate: { en: "", ne: "" },
    officeName: { en: "", ne: "" },
    officeAddress: { en: "", ne: "" },
    email: "",
    phoneNumber: { en: "", ne: "" },
    website: "",
    xLink: "",
    youtube: "",
    mapIframe: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Track initialization to prevent auto-setting on subsequent renders
  const initializedRef = useRef(false);

  // Initialize form data when settings change
  useEffect(() => {
    if (settings) {
      setFormData({
        directorate: settings.directorate,
        officeName: settings.officeName,
        officeAddress: settings.officeAddress,
        email: settings.email,
        phoneNumber: settings.phoneNumber,
        website: settings.website || "",
        xLink: settings.xLink || "",
        youtube: settings.youtube || "",
        mapIframe: settings.mapIframe || "",
      });
      // Only set to view mode on very first load, never again
      if (!initializedRef.current) {
        setEditing(false);
        initializedRef.current = true;
      } else {
      }
    } else {
      // When no settings exist, start in creation mode
      setFormData({
        directorate: { en: "", ne: "" },
        officeName: { en: "", ne: "" },
        officeAddress: { en: "", ne: "" },
        email: "",
        phoneNumber: { en: "", ne: "" },
        website: "",
        xLink: "",
        youtube: "",
        mapIframe: "",
      });
      if (!initializedRef.current) {
        setEditing(true);
        initializedRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate translatable fields
    if (!formData.directorate.en.trim()) {
      errors.directorate = t("form.directorate.validation.required");
    }
    if (!formData.directorate.ne.trim()) {
      errors.directorate = t("form.directorate.validation.required");
    }

    if (!formData.officeName.en.trim()) {
      errors.officeName = t("form.officeName.validation.required");
    }
    if (!formData.officeName.ne.trim()) {
      errors.officeName = t("form.officeName.validation.required");
    }

    if (!formData.officeAddress.en.trim()) {
      errors.officeAddress = t("form.officeAddress.validation.required");
    }
    if (!formData.officeAddress.ne.trim()) {
      errors.officeAddress = t("form.officeAddress.validation.required");
    }

    if (!formData.phoneNumber.en.trim()) {
      errors.phoneNumber = t("form.phoneNumber.validation.required");
    }
    if (!formData.phoneNumber.ne.trim()) {
      errors.phoneNumber = t("form.phoneNumber.validation.required");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = t("form.email.validation.required");
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t("form.email.validation.invalid");
    }

    // Validate URLs if provided
    const urlRegex = /^https?:\/\/.+/;
    if (formData.website && !urlRegex.test(formData.website)) {
      errors.website = t("form.website.validation.invalid");
    }
    if (formData.xLink && !urlRegex.test(formData.xLink)) {
      errors.xLink = t("form.xLink.validation.invalid");
    }
    if (formData.youtube && !urlRegex.test(formData.youtube)) {
      errors.youtube = t("form.youtube.validation.invalid");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      if (settings) {
        // Update existing settings
        await updateSettings(settings.id, formData);
      } else {
        // Create new settings
        await upsertSettings(formData);
      }
      // Set to view mode after successful submission
      setEditing(true);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
      console.error("Form submission error:", error);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!settings?.id) return;

    try {
      await uploadBackgroundPhoto(settings.id, file);
    } catch (error) {
      console.error("Photo upload error:", error);
    }
  };

  const handlePhotoRemove = async () => {
    if (!settings?.id) return;

    try {
      await removeBackgroundPhoto(settings.id);
    } catch (error) {
      console.error("Photo remove error:", error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original settings
    if (settings) {
      setFormData({
        directorate: settings.directorate,
        officeName: settings.officeName,
        officeAddress: settings.officeAddress,
        email: settings.email,
        phoneNumber: settings.phoneNumber,
        website: settings.website || "",
        xLink: settings.xLink || "",
        youtube: settings.youtube || "",
        mapIframe: settings.mapIframe || "",
      });
    } else {
      // Reset to empty form for new creation
      setFormData({
        directorate: { en: "", ne: "" },
        officeName: { en: "", ne: "" },
        officeAddress: { en: "", ne: "" },
        email: "",
        phoneNumber: { en: "", ne: "" },
        website: "",
        xLink: "",
        youtube: "",
        mapIframe: "",
      });
    }
    clearError();
  };

  const handleCreate = () => {
    setEditing(true);
    // Initialize empty form for creation
    setFormData({
      directorate: { en: "", ne: "" },
      officeName: { en: "", ne: "" },
      officeAddress: { en: "", ne: "" },
      email: "",
      phoneNumber: { en: "", ne: "" },
      website: "",
      xLink: "",
      youtube: "",
      mapIframe: "",
    });
    clearError();
  };

  if (loading && !settings) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className={`office-settings-form ${className || ""}`}>
      {error && (
        <div className="error-notification">
          <div className="notification-content">
            <h4>{t("errors.validationError")}</h4>
            <p>{safeErrorToString(error)}</p>
            <button onClick={clearError} className="notification-close">
              ×
            </button>
          </div>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Grid fullWidth>
          {/* Form Header with Action Buttons */}
          <Column lg={16} md={8} sm={4}>
            <div className="form-header">
              <div className="form-header-content">
                <h2 className="form-title font-dynamic">
                  {settings
                    ? isEditing
                      ? t("view.editSettings")
                      : t("view.viewSettings")
                    : t("view.createSettings")}
                </h2>
                <div className="form-header-actions">
                  {isEditing ? (
                    <div className="action-buttons">
                      <Button
                        type="submit"
                        renderIcon={Save}
                        disabled={loading}
                        kind="primary"
                      >
                        {loading
                          ? t("status.saving")
                          : settings
                            ? t("actions.update")
                            : t("actions.create")}
                      </Button>
                      <Button
                        kind="secondary"
                        renderIcon={Close}
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        {t("actions.cancel")}
                      </Button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      {settings ? (
                        <Button
                          renderIcon={Edit}
                          onClick={handleEdit}
                          disabled={loading}
                          kind="primary"
                        >
                          {t("actions.edit")}
                        </Button>
                      ) : (
                        <Button
                          renderIcon={Edit}
                          onClick={handleCreate}
                          disabled={loading}
                          kind="primary"
                        >
                          {t("actions.create")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Column>

          {/* Basic Information Section */}
          <Column lg={16} md={8} sm={4}>
            <Tile className="form-section-tile">
              <h3 className="section-title font-dynamic">
                {t("sections.basicInfo")}
              </h3>

              <FormGroup legendText="">
                <Grid fullWidth>
                  <Column lg={8} md={4} sm={4}>
                    <TranslatableField
                      label={t("form.directorate.label")}
                      value={formData.directorate}
                      onChange={(value) =>
                        setFormData({ ...formData, directorate: value })
                      }
                      placeholder={t.raw("form.directorate.placeholder")}
                      invalid={!!validationErrors.directorate}
                      invalidText={validationErrors.directorate}
                      disabled={!isEditing}
                      required
                    />
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <TranslatableField
                      label={t("form.officeName.label")}
                      value={formData.officeName}
                      onChange={(value) =>
                        setFormData({ ...formData, officeName: value })
                      }
                      placeholder={t.raw("form.officeName.placeholder")}
                      invalid={!!validationErrors.officeName}
                      invalidText={validationErrors.officeName}
                      disabled={!isEditing}
                      required
                    />
                  </Column>
                </Grid>

                <TranslatableField
                  label={t("form.officeAddress.label")}
                  value={formData.officeAddress}
                  onChange={(value) =>
                    setFormData({ ...formData, officeAddress: value })
                  }
                  placeholder={t.raw("form.officeAddress.placeholder")}
                  invalid={!!validationErrors.officeAddress}
                  invalidText={validationErrors.officeAddress}
                  disabled={!isEditing}
                  required
                />
              </FormGroup>
            </Tile>
          </Column>

          {/* Contact Information Section */}
          <Column lg={16} md={8} sm={4}>
            <Tile className="form-section-tile">
              <h3 className="section-title font-dynamic">
                {t("sections.contactInfo")}
              </h3>

              <FormGroup legendText="">
                <Grid fullWidth>
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="email"
                      labelText={`${t("form.email.label")} *`}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t("form.email.placeholder")}
                      invalid={!!validationErrors.email}
                      invalidText={validationErrors.email}
                      disabled={!isEditing}
                      className="font-english-only"
                    />
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <TranslatableField
                      label={t("form.phoneNumber.label")}
                      value={formData.phoneNumber}
                      onChange={(value) =>
                        setFormData({ ...formData, phoneNumber: value })
                      }
                      placeholder={t.raw("form.phoneNumber.placeholder")}
                      invalid={!!validationErrors.phoneNumber}
                      invalidText={validationErrors.phoneNumber}
                      disabled={!isEditing}
                      required
                    />
                  </Column>
                </Grid>
              </FormGroup>
            </Tile>
          </Column>

          {/* Social Media & Links Section */}
          <Column lg={16} md={8} sm={4}>
            <Tile className="form-section-tile">
              <h3 className="section-title font-dynamic">
                {t("sections.socialMedia")}
              </h3>

              <FormGroup legendText="">
                <Grid fullWidth>
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="website"
                      labelText={t("form.website.label")}
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder={t("form.website.placeholder")}
                      invalid={!!validationErrors.website}
                      invalidText={validationErrors.website}
                      disabled={!isEditing}
                      className="font-english-only"
                    />
                  </Column>
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="xLink"
                      labelText={t("form.xLink.label")}
                      value={formData.xLink}
                      onChange={(e) =>
                        setFormData({ ...formData, xLink: e.target.value })
                      }
                      placeholder={t("form.xLink.placeholder")}
                      invalid={!!validationErrors.xLink}
                      invalidText={validationErrors.xLink}
                      disabled={!isEditing}
                      className="font-english-only"
                    />
                  </Column>
                </Grid>

                <Grid fullWidth>
                  <Column lg={8} md={4} sm={4}>
                    <TextInput
                      id="youtube"
                      labelText={t("form.youtube.label")}
                      value={formData.youtube}
                      onChange={(e) =>
                        setFormData({ ...formData, youtube: e.target.value })
                      }
                      placeholder={t("form.youtube.placeholder")}
                      invalid={!!validationErrors.youtube}
                      invalidText={validationErrors.youtube}
                      disabled={!isEditing}
                      className="font-english-only"
                    />
                  </Column>
                </Grid>

                <TextArea
                  id="mapIframe"
                  labelText={t("form.mapIframe.label")}
                  value={formData.mapIframe}
                  onChange={(e) =>
                    setFormData({ ...formData, mapIframe: e.target.value })
                  }
                  placeholder={t("form.mapIframe.placeholder")}
                  disabled={!isEditing}
                  className="font-english-only"
                />
              </FormGroup>
            </Tile>
          </Column>

          {/* Appearance Section */}
          {settings && (
            <Column lg={16} md={8} sm={4}>
              <Tile className="form-section-tile">
                <h3 className="section-title font-dynamic">
                  {t("sections.appearance")}
                </h3>

                <BackgroundPhotoUpload
                  currentPhoto={settings.backgroundPhoto}
                  onUpload={handlePhotoUpload}
                  onRemove={handlePhotoRemove}
                  isUploading={isUploading}
                  disabled={!isEditing}
                />
              </Tile>
            </Column>
          )}
        </Grid>
      </Form>
    </div>
  );
};
