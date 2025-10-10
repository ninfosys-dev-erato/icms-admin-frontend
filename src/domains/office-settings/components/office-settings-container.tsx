"use client";

import React, { useEffect } from "react";
import { InlineLoading } from "@carbon/react";
import { useTranslations } from "next-intl";
import { OfficeSettingsForm } from "./office-settings-form";
import { useOfficeSettingsStore } from "../stores/office-settings-store";
import { safeErrorToString } from "@/shared/utils/error-utils";
import "../styles/office-settings.css";

export const OfficeSettingsContainer: React.FC = () => {
  const t = useTranslations("office-settings");
  const { settings, loading, error, loadSettings, clearError } =
    useOfficeSettingsStore();

  useEffect(() => {
    // Load settings on component mount
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only load on mount

  const handleSuccess = () => {
    // Reload settings after successful operation
    loadSettings();
  };

  if (loading && !settings) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="office-settings-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h1 className="page-title font-dynamic">{t("title")}</h1>
            <p className="page-subtitle font-dynamic">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="error-notification">
          <div className="notification-content">
            <h4>{t("errors.loadFailed")}</h4>
            <p>{safeErrorToString(error)}</p>
            <button onClick={clearError} className="notification-close">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="office-settings-content">
        <OfficeSettingsForm settings={settings} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

