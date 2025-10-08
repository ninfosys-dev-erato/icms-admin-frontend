
"use client";

import React, { useEffect } from "react";
import { InlineLoading, Breadcrumb, BreadcrumbItem } from "@carbon/react";
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
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = () => {
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
        {/* Breadcrumb (align + spacing like Header page) */}
        <div className="breadcrumb-wrapper" style={{ padding: "1.5rem 1rem 1rem 1rem" }}>
          <Breadcrumb noTrailingSlash style={{ marginBottom: "1rem" }}>
            <BreadcrumbItem href="#">
              {t("breadcrumbs.home", { default: "Home" })}
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
          </Breadcrumb>
        </div>

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
      <div className="office-settings-content font-dynamic">
        <OfficeSettingsForm settings={settings} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

