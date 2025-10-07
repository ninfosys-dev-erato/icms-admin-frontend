"use client";

import React, { useState } from "react";
import {
  Button,
  Layer,
  Breadcrumb,
  BreadcrumbItem,
  Dropdown,
} from "@carbon/react";
import { SidePanel, CreateSidePanel } from "@carbon/ibm-products";
import "@/lib/ibm-products/config";
import { Add, Close, Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { ImportantLinksList } from "./important-links-list";
import { ImportantLinksForm } from "./important-links-form";
import { ImportantLinksStatistics } from "./important-links-statistics";
import { useImportantLinksStore } from "../stores/important-links-store";
import SidePanelForm from '@/components/shared/side-panel-form';
import {
  // CreateSidePanel,
  unstable_FeatureFlags as FeatureFlags,
} from "@carbon/ibm-products";
import "../styles/important-links.css";

export const ImportantLinksContainer: React.FC = () => {
  const t = useTranslations("important-links");

  const {
    panelOpen,
    panelMode,
    panelLink,
    openCreatePanel,
    openEditPanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useImportantLinksStore();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  const handleCreateNew = () => openCreatePanel();
  const handleEdit = (link: any) => openEditPanel(link);
  const handleFormSuccess = () => closePanel();
  const handleResetFilters = () => setStatusFilter("all");

  const panelTitle =
    panelMode === "edit" ? t("form.editTitle") : t("form.createTitle");

  return (
    <Layer className="important-links-container">
      {/* Page Header */}
      <div className="important-links-header">
        <Breadcrumb noTrailingSlash className="important-links-breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
        </Breadcrumb>

        <div className="important-links-header-content">
          <div className="important-links-header-left">
            <h1 className="important-links-title">
              {t("title", { default: "Important Links" })}
            </h1>
            <p className="important-links-subtitle">
              {t("subtitle", {
                default:
                  "Manage important links, URLs and visibility for the website.",
              })}
            </p>
          </div>

          <div className="important-links-header-right">
            <Button
              size="lg"
              renderIcon={Add}
              iconDescription={t("actions.createNew")}
              onClick={handleCreateNew}
              kind="primary"
            >
              {t("actions.createNew")}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {showStatistics && (
        <div className="important-links-statistics-wrapper">
          <ImportantLinksStatistics />
        </div>
      )}

      {/* Filters */}
      <div className="important-links-filters-container">
        <div className="important-links-filters">
          <div className="important-links-filters-left">
            <Button
              kind="ghost"
              size="md"
              renderIcon={Reset}
              onClick={handleResetFilters}
              disabled={statusFilter === "all" && !searchTerm}
            >
              {t("filters.reset")}
            </Button>
          </div>

          <div className="important-links-filters-right">
            <Dropdown
              id="link-status-dropdown"
              size="md"
              label={t("filters.status")}
              titleText={t("filters.status")}
              items={[
                { id: "all", label: t("filters.all") },
                { id: "active", label: t("status.active") },
                { id: "inactive", label: t("status.inactive") },
              ]}
              selectedItem={{
                id: statusFilter,
                label:
                  statusFilter === "all"
                    ? t("filters.all")
                    : statusFilter === "active"
                      ? t("status.active")
                      : t("status.inactive"),
              }}
              itemToString={(item) => (item ? item.label : "")}
              onChange={({ selectedItem }) =>
                setStatusFilter((selectedItem?.id || "all") as any)
              }
              className="important-links-dropdown"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="important-links-content-container">
        <ImportantLinksList
          onEdit={handleEdit}
          statusFilter={statusFilter}
          searchTerm={searchTerm}
        />
      </div>

      {/* Side Panel */}
      <FeatureFlags enableSidepanelResizer={true}>
      <SidePanelForm
        title={panelTitle}
        subtitle={panelMode === "edit" ? panelLink?.linkTitle?.en : undefined}
        open={panelOpen}
        onRequestClose={() => {
          if (!isSubmitting) closePanel();
        }}
        primaryButtonText={
          isSubmitting
            ? panelMode === "edit"
              ? t("actions.updating")
              : t("actions.creating")
            : panelMode === "edit"
              ? t("actions.update")
              : t("actions.createNew")
        }
        secondaryButtonText={t("actions.cancel")}
        onRequestSubmit={() => {
          if (isSubmitting) return;
          setSubmitting(true);
          const formContainer = document.getElementById("important-links-form");
          if (formContainer) {
            const form = formContainer.closest("form") as HTMLFormElement;
            if (form) {
              const submitEvent = new Event("submit", {
                cancelable: true,
                bubbles: true,
              });
              form.dispatchEvent(submitEvent);
            } else {
              const customSubmitEvent = new CustomEvent("formSubmit", {
                bubbles: true,
              });
              formContainer.dispatchEvent(customSubmitEvent);
            }
          } else {
            setSubmitting(false);
          }
        }}
        selectorPageContent="#main-content"
        // formTitle={t("sections.basicInfo")}
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
      >

        <div className="important-links-close-btn">
            <Button
              kind="ghost"
              hasIconOnly
              size="sm"
              onClick={closePanel}
              renderIcon={Close}
              iconDescription={t("actions.cancel")}
              tooltipPosition="bottom"
              tooltipAlignment="center"
              aria-label={t("actions.cancel")}
              className="close-panel-button"
            />
        </div>

        <div className="important-links-form-container">
          <ImportantLinksForm
            mode={panelMode}
            link={panelLink as any}
            onSuccess={handleFormSuccess}
            onCancel={closePanel}
          />
        </div>
      </SidePanelForm>
      </FeatureFlags>
    </Layer>
  );
};
