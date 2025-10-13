"use client";

import React from "react";
import { Button, Layer, Breadcrumb, BreadcrumbItem } from "@carbon/react";
// import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products"; // Not available in latest package
import SidePanelForm from "@/components/shared/side-panel-form";
import "@/lib/ibm-products/config";
import { Add, Close } from "@carbon/icons-react";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";
import { useUserUIStore } from "../stores/user-ui-store";
import { useTranslations } from "next-intl";
import "../styles/users.css";

export const UserContainer: React.FC = () => {
  const t = useTranslations("users");
  const {
    panelOpen,
    panelMode,
    panelUser,
    openCreatePanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useUserUIStore();

  const panelTitle =
    panelMode === "edit" ? t("form.editTitle") : t("form.createTitle");

  return (
    <Layer className="users-container">
      <div style={{ padding: "2rem 1rem 1rem 1rem" }}>
        <Breadcrumb noTrailingSlash style={{ marginBottom: "1.5rem" }}>
          <BreadcrumbItem href="#">{t("breadcrumbs.home")}</BreadcrumbItem>
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
                fontWeight: 400,
                margin: "0 0 0.5rem 0",
                textAlign: "left",
              }}
            >
              {t("title")}
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--cds-text-secondary, #525252)",
                textAlign: "left",
              }}
            >
              {t("subtitle")}
            </p>
          </div>
          <Button
            size="lg"
            renderIcon={Add}
            onClick={openCreatePanel}
            kind="primary"
          >
            {t("actions.create")}
          </Button>
        </div>
      </div>

      <div style={{ padding: "0 1rem 2rem 1rem", textAlign: "left" }}>
        <UserList hideHeader />
      </div>
        <SidePanelForm
          title={panelTitle}
          subtitle={panelMode === "edit" ? panelUser?.email : undefined}
          open={!!panelOpen}
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
                : t("actions.create")
          }
          secondaryButtonText={t("actions.cancel")}
          onRequestSubmit={() => {
            if (isSubmitting) return;
            setSubmitting(true);
            const formContainer = document.getElementById("user-form");
            if (formContainer) {
              const form = formContainer.closest(
                "form"
              ) as HTMLFormElement | null;
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
          formTitle={t("sections.basicInfo")}
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="users-sidepanel-form"
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
            <UserForm
              mode={panelMode}
              user={panelUser ?? undefined}
              onSuccess={closePanel}
            />
          </div>
  </SidePanelForm>
    </Layer>
  );
};
