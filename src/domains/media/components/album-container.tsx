"use client";

import React, { useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  Layer,
  Search,
} from "@carbon/react";
import { Add, Reset } from "@carbon/icons-react";
import SidePanelForm from "@/components/shared/side-panel-form";
import "@/lib/ibm-products/config";
import { useAlbumStore } from "../stores/album-store";
import { AlbumList } from "@/domains/media/components/album-list";
import { AlbumPanelForms } from "@/domains/media/components/album-panel-forms";
import { useTranslations } from "next-intl";

export const AlbumContainer: React.FC = () => {
  const {
    panelOpen,
    panelMode,
    openCreatePanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useAlbumStore();
  const t = useTranslations("media.albums");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const panelTitle = useMemo(
    () => (panelMode === "edit" ? t("form.editTitle") : t("form.createTitle")),
    [panelMode, t]
  );

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  return (
    <Layer className="media-container">
      <div className="p--card-padding">
        <Breadcrumb noTrailingSlash className="breadcrumb--spacing">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
        </Breadcrumb>

        <div className="flex--row-space">
          <div className="flex--1">
            <h1 className="media-title">{t("title")}</h1>
            <p className="media-subtitle">{t("subtitle")}</p>
          </div>

          <Button
            size="lg"
            renderIcon={Add}
            onClick={openCreatePanel}
            kind="primary"
          >
            {t("create")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p--card-padding-sm flex--row-gap filters-row--actions">
        <Search
          size="lg"
          labelText={t("filters.search", { default: "Search" })}
          placeholder={t("filters.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
        />
        <Dropdown
          id="album-status-dropdown"
          size="md"
          titleText={t("filters.status")}
          label={t("filters.status")}
          items={[
            { id: "all", label: t("filters.all") },
            { id: "active", label: t("filters.active") },
            { id: "inactive", label: t("filters.inactive") },
          ]}
          selectedItem={{
            id: statusFilter,
            label:
              statusFilter === "all"
                ? t("filters.all")
                : statusFilter === "active"
                  ? t("filters.active")
                  : t("filters.inactive"),
          }}
          itemToString={(item) => (item ? item.label : "")}
          onChange={({ selectedItem }) =>
            setStatusFilter(
              (selectedItem?.id || "all") as "all" | "active" | "inactive"
            )
          }
        />
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

      {/* Main Content */}
      <div className="p--card-padding-sm text--left">
        <AlbumList search={searchTerm} statusFilter={statusFilter} />
      </div>

      {/* Right side panel */}
      <SidePanelForm
        formTitle={t("albums.formTitle")}
        title={panelTitle}
        open={!!panelOpen}
        onRequestClose={() => {
          if (!isSubmitting) closePanel();
        }}
        primaryButtonText={
          isSubmitting
            ? t("form.saving")
            : panelMode === "edit"
              ? t("actions.update")
              : t("create")
        }
        secondaryButtonText={t("actions.cancel")}
        onRequestSubmit={() => {
          if (isSubmitting) return;
          setSubmitting(true);
          const formContainer = document.getElementById("album-form");
          if (formContainer) {
            // Prefer custom event to avoid relying on DOM structure
            formContainer.dispatchEvent(
              new Event("album:submit", { cancelable: true, bubbles: true })
            );
            // Also dispatch globally as a robust fallback
            document.dispatchEvent(
              new Event("album:submit", { cancelable: true, bubbles: true })
            );
          } else {
            // Global fallback
            document.dispatchEvent(
              new Event("album:submit", { cancelable: true, bubbles: true })
            );
            setSubmitting(false);
          }
        }}
        selectorPageContent="#main-content"
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
        className="album-sidepanel-form"
      >
        <div id="album-form">
          <AlbumPanelForms onSuccess={closePanel} />
        </div>
      </SidePanelForm>
    </Layer>
  );
};
