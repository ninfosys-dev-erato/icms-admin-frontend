"use client";

import React, { useState } from "react";
import {
  Layer,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Search,
  Dropdown,
} from "@carbon/react";
import { Add, Reset, Close } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { useOfficeDescriptionUIStore } from "../stores/office-description-ui-store";
import { useAdminOfficeDescriptions } from "../hooks/use-office-description-queries";
import { OfficeDescriptionType } from "../types/office-description";
import { OfficeDescriptionList } from "./office-description-list";
import { OfficeDescriptionForm } from "./office-description-form";
import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products"; // Not available in latest package
import SidePanelForm from "@/components/shared/side-panel-form";
import "@/lib/ibm-products/config";
import "../styles/office-description.css";

export const OfficeDescriptionContainer: React.FC = () => {
  const t = useTranslations("office-description");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<OfficeDescriptionType | "all">(
    "all"
  );

  const {
    panelOpen,
    panelMode,
    panelDescription,
    openCreatePanel,
    openEditPanel,
    closePanel,
    isSubmitting,
  } = useOfficeDescriptionUIStore();

  const {
    data: descriptions,
    isLoading,
    error,
    refetch,
  } = useAdminOfficeDescriptions();

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const filteredDescriptions =
    descriptions?.filter((description) => {
      const matchesSearch =
        !searchTerm ||
        description.content.en
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        description.content.ne.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        description.officeDescriptionType === typeFilter;

      return matchesSearch && matchesType;
    }) || [];

  const handleCreateSuccess = () => {
    closePanel();
    refetch();
  };

  const handleEditSuccess = () => {
    closePanel();
    refetch();
  };

  const handleRequestSubmit = () => {
    // Handle form submission
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <Layer className="office-description-container">
      {/* Page Header */}
      <div style={{ padding: "2rem 1rem 1rem 1rem" }}>
        <Breadcrumb noTrailingSlash style={{ marginBottom: "1.5rem" }}>
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
              {t("title", { default: "Office Descriptions" })}
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
                  "Manage different types of office descriptions and content",
              })}
            </p>
          </div>

          <Button
            size="lg"
            renderIcon={Add}
            onClick={() => openCreatePanel()}
            kind="primary"
          >
            {t("actions.createNew")}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: "0 1rem 1rem 1rem" }}>
        <div style={{ marginBottom: "0.75rem" }} className="search-box">
          <Search
            id="office-description-search"
            size="lg"
            labelText={t("filters.search")}
            placeholder={t("filters.searchPlaceholder")}
            closeButtonLabelText={t("filters.reset")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
            kind="ghost"
            size="md"
            renderIcon={Reset}
            onClick={handleResetFilters}
            disabled={!searchTerm && typeFilter === "all"}
          >
            {t("filters.reset")}
          </Button>
            <Dropdown
              id="office-description-type-dropdown"
              size="md"
              label={t("filters.type")}
              titleText={t("filters.type")}
              items={[
                { id: "all", label: t("filters.allTypes") },
                {
                  id: OfficeDescriptionType.INTRODUCTION,
                  label: t("types.INTRODUCTION"),
                },
                {
                  id: OfficeDescriptionType.OBJECTIVE,
                  label: t("types.OBJECTIVE"),
                },
                {
                  id: OfficeDescriptionType.WORK_DETAILS,
                  label: t("types.WORK_DETAILS"),
                },
                {
                  id: OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE,
                  label: t("types.ORGANIZATIONAL_STRUCTURE"),
                },
                {
                  id: OfficeDescriptionType.DIGITAL_CHARTER,
                  label: t("types.DIGITAL_CHARTER"),
                },
                {
                  id: OfficeDescriptionType.EMPLOYEE_SANCTIONS,
                  label: t("types.EMPLOYEE_SANCTIONS"),
                },
              ]}
              selectedItem={{
                id: typeFilter,
                label:
                  typeFilter === "all"
                    ? t("filters.allTypes")
                    : t(`types.${typeFilter}`),
              }}
              itemToString={(item) => (item ? item.label : "")}
              onChange={({ selectedItem }) =>
                setTypeFilter(
                  (selectedItem?.id || "all") as OfficeDescriptionType | "all"
                )
              }
            />
          </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 1rem 2rem 1rem", textAlign: "left" }}>
        <OfficeDescriptionList
          descriptions={filteredDescriptions}
          onEdit={openEditPanel}
          onCreate={() => openCreatePanel()}
        />
      </div>

      {/* Right side panel for create/edit */}
      <FeatureFlags enableSidepanelResizer>
        <SidePanelForm
          title={
            panelMode === "edit" ? t("form.editTitle") : t("form.createTitle")
          }
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
          onRequestSubmit={handleRequestSubmit}
          selectorPageContent="#main-content"
          formTitle={t("sections.basicInfo")}
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="office-description-sidepanel-form"
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
            <OfficeDescriptionForm
              mode={(panelMode ?? "create") as "create" | "edit"}
              description={panelDescription as any}
              onSuccess={
                panelMode === "create" ? handleCreateSuccess : handleEditSuccess
              }
              onCancel={closePanel}
            />
          </div>
        </SidePanelForm>
      </FeatureFlags>
    </Layer>
  );
};
