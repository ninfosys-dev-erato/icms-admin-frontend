"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Layer, Breadcrumb, BreadcrumbItem, Dropdown, ButtonSet } from "@carbon/react";
import { SidePanel } from "@carbon/ibm-products";
import "@/lib/ibm-products/config";
import { Add, Close, Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { DocumentList } from "./document-list";
import { DocumentForm } from "./document-form";
import SidePanelForm from "@/components/shared/side-panel-form";
import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products"; // Not available in latest package
import { useDocumentStore } from "../stores/document-store";
import "../styles/documents.css";

export const DocumentContainer: React.FC = () => {
  const t = useTranslations("documents");
  const {
    panelOpen,
    panelMode,
    panelDocument,
    openCreatePanel,
    openEditPanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useDocumentStore();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published" | "archived" | "expired"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const handleEdit = (document: any) => openEditPanel(document);

  const handleCreateNew = () => openCreatePanel();
  const handleFormSuccess = () => closePanel();
  const handleResetFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
  };

  const handleView = (document: any) => {
    console.log("View document:", document);
  };

  const panelTitle =
    panelMode === "edit" ? t("form.editTitle") : t("form.createTitle");

  return (
    <Layer className="document-container">
      <div className="document-header">
        <Breadcrumb noTrailingSlash className="document-breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
        </Breadcrumb>
        <div className="document-header-row">
          <div className="document-header-title">
            <h1 className="document-title">
              {t("title", { default: "Documents" })}
            </h1>
            <p className="document-subtitle">
              {t("subtitle", {
                default:
                  "Manage official documents, reports, forms and policies.",
              })}
            </p>
          </div>
          <Button
            size="lg"
            renderIcon={Add}
            onClick={handleCreateNew}
            kind="primary"
          >
            {t("actions.createNew")}
          </Button>
        </div>
      </div>

      <div className="document-filters">
        <Button
          kind="ghost"
          size="md"
          renderIcon={Reset}
          onClick={handleResetFilters}
          disabled={
            statusFilter === "all" &&
            categoryFilter === "all" &&
            typeFilter === "all"
          }
        >
          {t("filters.reset")}
        </Button>
        <div className="document-filters-dropdowns">
          <Dropdown
            id="document-status-dropdown"
            size="md"
            label={t("filters.status")}
            titleText={t("filters.status")}
            items={[
              { id: "all", label: t("filters.all") },
              { id: "draft", label: t("status.draft") },
              { id: "published", label: t("status.published") },
              { id: "archived", label: t("status.archived") },
              { id: "expired", label: t("status.expired") },
            ]}
            selectedItem={{
              id: statusFilter,
              label:
                statusFilter === "all"
                  ? t("filters.all")
                  : t(`status.${statusFilter}`),
            }}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) =>
              setStatusFilter((selectedItem?.id || "all") as any)
            }
          />
          <Dropdown
            id="document-category-dropdown"
            size="md"
            label={t("filters.category")}
            titleText={t("filters.category")}
            items={[
              { id: "all", label: t("filters.all") },
              { id: "OFFICIAL", label: t("categories.official") },
              { id: "REPORT", label: t("categories.report") },
              { id: "FORM", label: t("categories.form") },
              { id: "POLICY", label: t("categories.policy") },
              { id: "PROCEDURE", label: t("categories.procedure") },
              { id: "GUIDELINE", label: t("categories.guideline") },
              { id: "NOTICE", label: t("categories.notice") },
              { id: "CIRCULAR", label: t("categories.circular") },
              { id: "OTHER", label: t("categories.other") },
            ]}
            selectedItem={{
              id: categoryFilter,
              label:
                categoryFilter === "all"
                  ? t("filters.all")
                  : t(`categories.${categoryFilter.toLowerCase()}`),
            }}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) =>
              setCategoryFilter((selectedItem?.id || "all") as any)
            }
          />
          <Dropdown
            id="document-type-dropdown"
            size="md"
            label={t("filters.type")}
            titleText={t("filters.type")}
            items={[
              { id: "all", label: t("filters.all") },
              { id: "PDF", label: "PDF" },
              { id: "DOC", label: "DOC" },
              { id: "DOCX", label: "DOCX" },
              { id: "XLS", label: "XLS" },
              { id: "XLSX", label: "XLSX" },
              { id: "PPT", label: "PPT" },
              { id: "PPTX", label: "PPTX" },
              { id: "TXT", label: "TXT" },
              { id: "OTHER", label: t("filters.other") },
            ]}
            selectedItem={{
              id: typeFilter,
              label: typeFilter === "all" ? t("filters.all") : typeFilter,
            }}
            itemToString={(item) => (item ? item.label : "")}
            onChange={({ selectedItem }) =>
              setTypeFilter((selectedItem?.id || "all") as any)
            }
          />
        </div>
      </div>

      <div className="document-list-wrapper">
        <DocumentList
          onEdit={handleEdit}
          onView={handleView}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
        />
      </div>

  <FeatureFlags enableSidepanelResizer>
      <SidePanelForm
        title={panelTitle}
        subtitle={panelMode === "edit" ? panelDocument?.title?.en : undefined}
        open={!!panelOpen}
        onRequestClose={() => {
          if (!isSubmitting) {
            closePanel();
          }
        }}
        primaryButtonText={
          isSubmitting
            ? panelMode === 'edit'
              ? t('actions.updating')
              : t('actions.creating')
            : panelMode === 'edit'
              ? t('actions.update')
              : t('actions.createNew')
        }
        secondaryButtonText={t('actions.cancel')}
        onRequestSubmit={() => {
          if (isSubmitting) return;
          setSubmitting(true);
          const formContainer = document.getElementById('document-form');

          if (formContainer) {
            const form = formContainer.closest('form') as HTMLFormElement;
            if (form) {
              const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
              form.dispatchEvent(submitEvent);
            } else {
              const customSubmitEvent = new CustomEvent('formSubmit', { bubbles: true });
              formContainer.dispatchEvent(customSubmitEvent);
            }
          }
        }}
        selectorPageContent="#main-content"
        // formTitle={t('sections.basicInfo')}
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
        className="document-sidepanel-form"
      >
        <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 10 }}>
          <Button
            kind="ghost"
            hasIconOnly
            size="sm"
            iconDescription={t("actions.cancel")}
            onClick={closePanel}
            renderIcon={Close}
          />
        </div>

        <div style={{ padding: 0 }}>
          <DocumentForm mode={(panelMode ?? "create") as "create" | "edit"} document={panelDocument as any} onSuccess={handleFormSuccess} onCancel={closePanel} />
        </div>
      </SidePanelForm>
  </FeatureFlags>
    </Layer>
  );
};
