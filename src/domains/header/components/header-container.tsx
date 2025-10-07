"use client";

import React, { useEffect, useRef } from "react";
import { Button, Layer, Breadcrumb, BreadcrumbItem } from "@carbon/react";
import {
  SidePanel,
//  unstable_FeatureFlags as FeatureFlags, // Not available in latest package
} from "@carbon/ibm-products";
import SidePanelForm from "@/components/shared/side-panel-form";
import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products"; // Not available in latest package
import "@/lib/ibm-products/config";
import { Add, ArrowLeft, Close } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { HeaderList } from "./header-list";
import { HeaderForm } from "./header-form";
import { useHeaderStore } from "../stores/header-store";
import { useHeaders } from "../hooks/use-header-queries";
import "../styles/headers.css";

// Flags are set by importing the config above

export const HeaderContainer: React.FC = () => {
  const t = useTranslations("headers");
  const hasLoadedRef = useRef(false);

  const {
    panelOpen,
    panelMode,
    panelHeader,
    openCreatePanel,
    openEditPanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useHeaderStore();

  const { data: listData, isLoading } = useHeaders({ page: 1, limit: 1 });

  const handleCreateNew = () => openCreatePanel();

  const handleEdit = (header: any) => openEditPanel(header);

  const handleBackToList = () => closePanel();

  const handleFormSuccess = () => closePanel();

  const panelTitle =
    panelMode === "edit" ? t("form.editTitle") : t("form.createTitle");

  return (
    <Layer className="header-container">
      {/* Page Header */}
      <div style={{ padding: "1.5rem 1rem 1rem 1rem" }}>
        <Breadcrumb noTrailingSlash style={{ marginBottom: "1rem" }}>
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
        </Breadcrumb>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "400",
                margin: "0 0 0.5rem 0",
                textAlign: "left",
              }}
            >
              {t("title", { default: "Header Configuration" })}
            </h1>
            <p
              style={{
                margin: "0",
                color: "var(--cds-text-secondary, #525252)",
                textAlign: "left",
              }}
            >
              {t("subtitle", {
                default:
                  "Manage your website header configuration, logos and styling.",
              })}
            </p>
          </div>

          
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 1rem 1.5rem 1rem", textAlign: "left" }}>
        <HeaderList onEdit={handleEdit} />
      </div>

      {/* Right side panel for create/edit */}
  <FeatureFlags enableSidepanelResizer>
        <SidePanelForm
          title={panelTitle}
          subtitle={panelMode === "edit" ? panelHeader?.name?.en : undefined}
          open={!!panelOpen}
          onRequestClose={() => {
            if (!isSubmitting) {
              closePanel();
            }
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
            
            // Simple form submission - let the form components handle their own submission
            const formContainer = document.getElementById("header-form");
            if (formContainer) {
              // Dispatch a custom event that the form components can listen to
              const customSubmitEvent = new CustomEvent("formSubmit", {
                bubbles: true,
                detail: { mode: panelMode }
              });
              formContainer.dispatchEvent(customSubmitEvent);
            } else {
              setSubmitting(false);
            }
          }}
          selectorPageContent="#main-content"
          formTitle={t("sections.basicInfo")}
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="header-sidepanel-form"
        >
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              zIndex: 10,
            }}
          >
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
            <HeaderForm
              mode={panelMode}
              header={panelHeader as any}
              onSuccess={handleFormSuccess}
              onCancel={closePanel}
            />
          </div>
  </SidePanelForm>
  </FeatureFlags>
    </Layer>
  );
};






