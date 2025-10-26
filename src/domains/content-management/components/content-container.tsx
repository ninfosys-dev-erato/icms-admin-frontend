"use client";

import { useAdminContents } from "@/domains/content-management/hooks/use-content-queries";
import { useAttachmentStore } from "@/domains/content-management/stores/attachment-store";
import { useContentStore } from "@/domains/content-management/stores/content-store";
import "@/domains/content-management/styles/content-management.css";
import type { ContentQuery } from "@/domains/content-management/types/content";
import "@/lib/ibm-products/config";
// import { CreateSidePanel } from "@carbon/ibm-products";
import SidePanelForm from '@/components/shared/side-panel-form';
import { Add, Close } from "@carbon/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem, Button,
  Layer, Pagination
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { AttachmentList } from "./attachments/attachment-list";
import { CategoryForm } from "./categories/category-form";
import { CategoryList } from "./categories/category-list";
import { ContentForm } from "./content-form";
import { ContentList } from "./content-list";


// Flags are set by importing the config above

export const ContentContainer: React.FC = () => {
  const t = useTranslations("content-management");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentQuery, setCurrentQuery] = useState<ContentQuery>({
    page: 1,
    limit: 10,
    filters: {}
  });

  // Attachment modal state
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedContentIdForModal, setSelectedContentIdForModal] = useState<string | null>(null);

  // Use TanStack Query for data fetching
  const { data: contentResponse, isLoading, error } = useAdminContents(currentQuery);
  
  const contents = contentResponse?.data || [];
  const pagination = contentResponse?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Use UI store for panel management and form state
  const {
    panelOpen,
    panelMode,
    panelContent,
    panelCategory,
    activeEntity,
    isSubmitting,
    openCreateContentPanel,
    openEditContentPanel,
    openCreateCategoryPanel,
    closePanel,
  } = useContentStore();

  // Use attachment store for attachment management
  const { setSelectedContentId } = useAttachmentStore();

  // Get active entity based on selected tab
  const currentActiveEntity = selectedTabIndex === 0 ? 'content' : 'category';

  const handleCreateNew = useCallback(() => {
    if (selectedTabIndex === 0) {
      openCreateContentPanel();
    } else {
      openCreateCategoryPanel();
    }
  }, [selectedTabIndex, openCreateContentPanel, openCreateCategoryPanel]);

  const handleEdit = useCallback((content: import("@/domains/content-management/types/content").Content) =>
    openEditContentPanel(content), [openEditContentPanel]);

  // Handle attachment management
  const handleManageAttachments = useCallback((contentId: string) => {
    setSelectedContentIdForModal(contentId);
    setSelectedContentId(contentId); // Set in attachment store
    setShowAttachmentModal(true);
  }, [setSelectedContentId]);

  // Close attachment modal
  const handleCloseAttachmentModal = useCallback(() => {
    setShowAttachmentModal(false);
    setSelectedContentIdForModal(null);
    setSelectedContentId(null); // Clear from attachment store
  }, [setSelectedContentId]);

  // Hide the Cancel secondary action in the attachments CreateSidePanel.
  // The CreateSidePanel requires `secondaryButtonText` prop, so we keep
  // passing it for types but remove the rendered button from the DOM when
  // the attachments panel is opened so only the primary (Close) button
  // remains visible.
  useEffect(() => {
    if (!showAttachmentModal) return;

    const cancelLabel = t("attachments.modal.cancel", { default: "Cancel" });

  const removeCancelButton = (root: Element | Document) => {
      // More robust strategy:
      // - Scan all actionable elements (buttons and role="button") in the
      //   document (or provided root)
      // - Match by visible text content (trimmed, case-insensitive equality)
      // - Ensure the matched element is inside a sidepanel (c4p--side-panel) or
      //   the attachments panel root (id=attachments-sidepanel)
      // - Hide it visually and from assistive technology

      const candidates = Array.from(root.querySelectorAll('button, [role="button"]')) as HTMLElement[];
      for (const el of candidates) {
        const text = el.textContent ? el.textContent.trim() : '';
        if (!text) continue;

        // case-insensitive match to account for potential whitespace/case differences
        if (text.toLowerCase() === String(cancelLabel).toLowerCase()) {
          // only hide if this button belongs to a side panel (avoid hiding other Cancel buttons)
          const sidePanel = el.closest('.c4p--side-panel') || el.closest('#attachments-sidepanel');
          if (sidePanel) {
            // Additionally ensure that this sidepanel's title matches the attachments panel title
            const titleEl = sidePanel.querySelector('.c4p--side-panel__title, .c4p--side-panel__header__title');
            const titleText = titleEl ? (titleEl.textContent || '').trim() : '';
            const attachmentsTitle = String(t('attachments.modal.title', { default: 'Manage Attachments' }));
            const titleMatches = titleText && titleText.toLowerCase() === attachmentsTitle.toLowerCase();
            // If it's the explicit attachments panel element (#attachments-sidepanel) or the title matches,
            // hide the button.
            if (sidePanel.id === 'attachments-sidepanel' || titleMatches) {
              el.style.setProperty('display', 'none', 'important');
              el.style.visibility = 'hidden';
              el.style.pointerEvents = 'none';
              el.setAttribute('aria-hidden', 'true');
            }
          }
        }
      }
    };

    // Run once immediately in case the panel content is already mounted
    removeCancelButton(document);

  // Observe mutations under the sidepanel (or entire body) to catch dynamic re-renders
  const attachmentsPanel = document.getElementById('attachments-sidepanel');
  const observerRoot = attachmentsPanel || document.body;
  // Run once more on the observed root to catch buttons that mount later
  removeCancelButton(observerRoot);
  const mo = new MutationObserver(() => removeCancelButton(observerRoot));
  mo.observe(observerRoot, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [showAttachmentModal, t, setSelectedContentId]);

  const handleFormSuccess = useCallback(() => {
    closePanel();
    // TanStack Query will automatically refetch data when mutations succeed
  }, [closePanel]);

  const handleRequestSubmit = useCallback(() => {
    // Handle form submission - use the same pattern as slider container
    const formContainer = document.getElementById('content-form');
    
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
  }, []);

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setCurrentQuery(prev => ({
      ...prev,
      page,
      limit: pageSize ?? prev.limit,
    }));
  }, []);

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentQuery(prev => ({
      ...prev,
      page: 1,
      filters: { 
        ...prev.filters, 
        search 
      }
    }));
  }, []);

  const panelTitle =
    activeEntity === "category"
      ? panelMode === "edit"
        ? t("categories.form.editTitle", { default: "Edit Category" })
        : t("categories.form.createTitle", { default: "Create Category" })
      : panelMode === "edit"
        ? t("form.editTitle")
        : t("form.createTitle");

  return (
    <Layer className="content-management-container">
      {/* Page Header */}
      <div className="cm-page-header">
        <Breadcrumb noTrailingSlash className="cm-breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{t("title")}</BreadcrumbItem>
        </Breadcrumb>

        <div className="cm-page-header-row">
          <div className="cm-page-header-left">
            <h1 className="cm-page-title">
              {t("title", { default: "Content Management" })}
            </h1>
            <p className="cm-page-subtitle">
              {t("subtitle", {
                default: "Manage your content, articles, and pages.",
              })}
            </p>
          </div>

          <Button
            size="lg"
            renderIcon={Add}
            onClick={handleCreateNew}
            kind="primary"
          >
            {selectedTabIndex === 0
              ? t("actions.createNew")
              : t("categories.actions.createNew", {
                  default: "Create Category",
                })}
          </Button>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="error-notification">
          <div className="notification-content">
            <div>
              <h4>Error</h4>
              <p>{error instanceof Error ? error.message : String(error)}</p>
            </div>
            <button className="notification-close" onClick={() => {}}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation (Content / Categories) */}
      <div className="cm-tabs-wrapper">
        <div className="hr-main-tabs">
          <button
            type="button"
            className={`hr-tab-button ${selectedTabIndex === 0 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(0)}
          >
            {t("list.title", { default: "Contents" })}
          </button>
          <button
            type="button"
            className={`hr-tab-button ${selectedTabIndex === 1 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(1)}
          >
            {t("categories.list.title", { default: "Categories" })}
          </button>
        </div>
      </div>


      {/* Tab Content */}
      <div className="cm-tab-content-wrapper">
        {selectedTabIndex === 0 ? (
          <ContentList
            onEdit={handleEdit}
            onCreate={handleCreateNew}
            onManageAttachments={handleManageAttachments}
            contents={contents}
            isLoading={isLoading}
          />
        ) : (
          <CategoryList onCreate={handleCreateNew} />
        )}
      </div>

      {/* Pagination (Carbon UI) - only show for Content tab; Categories renders its own pagination */}
      {selectedTabIndex === 0 && (
        <div className="cm-pagination-wrapper">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
            pageSizes={[10, 20, 30]}
            totalItems={pagination.total}
            onChange={({ page, pageSize }) => handlePageChange(page, pageSize)}
            backwardText="Previous"
            forwardText="Next"
            itemsPerPageText="Items per page:"
            pageNumberText="Page Number"
          />
        </div>
      )}

      {/* Create/Edit Side Panel */}
      <SidePanelForm
        open={panelOpen}
        onRequestClose={() => {
          if (!isSubmitting) {
            closePanel();
          }
        }}
        onRequestSubmit={handleRequestSubmit}
        title={panelTitle}
        primaryButtonText={
          isSubmitting
            ? activeEntity === "category"
              ? panelMode === 'edit'
                ? t('categories.actions.updating', { default: 'Updating...' })
                : t('categories.actions.creating', { default: 'Creating...' })
              : panelMode === 'edit'
                ? t('actions.updating', { default: 'Updating...' })
                : t('actions.creating', { default: 'Creating...' })
            : activeEntity === "category"
              ? panelMode === "edit"
                ? t("categories.form.update", { default: "Update" })
                : t("categories.form.create", { default: "Create" })
              : panelMode === "edit"
                ? t("form.update")
                : t("form.create")
        }
        secondaryButtonText={t("form.cancel")}
        id="cm-sidepanel"
        selectorPageContent="#main-content"
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
      >
        <div className="cm-panel-close-area">
          <Button
            kind="ghost"
            hasIconOnly
            size="sm"
            iconDescription={t("actions.cancel")}
            onClick={closePanel}
            renderIcon={Close}
          />
        </div>
        <div id="cm-form-anchor">
          {activeEntity === "content" ? (
            <ContentForm
              mode={panelMode}
              content={panelContent}
              onSuccess={handleFormSuccess}
              onCancel={closePanel}
            />
          ) : (
            <CategoryForm
              mode={panelMode}
              category={panelCategory}
              onSuccess={handleFormSuccess}
              onCancel={closePanel}
            />
          )}
        </div>
      </SidePanelForm>

      {/* Attachment Management Side Panel */}
      <SidePanelForm
        id="attachments-sidepanel"
        title={t("attachments.modal.title", { default: "Manage Attachments" })}
        subtitle={t("attachments.modal.subtitle", { default: "Upload and manage content attachments" })}
        open={showAttachmentModal}
        onRequestClose={handleCloseAttachmentModal}
        primaryButtonText={t("attachments.modal.close", { default: "Close" })}
        secondaryButtonText={t("attachments.modal.cancel", { default: "Cancel" })}
        onRequestSubmit={handleCloseAttachmentModal}
        selectorPageContent="#main-content"
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
      >
        <div className="cm-sidepanel-attachment-wrap">
          {selectedContentIdForModal && (
            <AttachmentList 
              className="sidepanel-attachment-list"
            />
          )}
        </div>
      </SidePanelForm>
    </Layer>
  );
};

// Hide the cancel action in the attachments sidepanel by removing the
// secondary action button that matches the localized "Cancel" label.
// We do this via a DOM effect because the sidepanel implementation composes
// actions internally and doesn't expose a prop to omit the secondary action
// while keeping prop types satisfied. The effect observes mutations so that
// dynamic re-renders won't bring the Cancel button back.
export default ContentContainer;
