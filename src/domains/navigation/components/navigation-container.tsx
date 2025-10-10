
"use client";

import SidePanelForm from "@/components/shared/side-panel-form";
import { useRouter } from "@/lib/i18n/routing";
import "@/lib/ibm-products/config";
import { NotificationService } from "@/services/notification-service";
import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products";
import { Add, Close, Reset } from "@carbon/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  Layer,
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import { useDeleteMenuItem, useMenus } from "../hooks/use-navigation-queries";
import { useNavigationStore } from "../stores/navigation-store";
import "../styles/navigation.css";
import ConfirmDeleteModal from "@/components/shared/confirm-delete-modal";
import { Menu, MenuItem, MenuLocation } from "../types/navigation";
import { MenuForm } from "./menu-form";
import { MenuItemFormWrapper } from "./menu-item-form-wrapper";
import { MenuItemTree } from "./menu-item-tree";
import { MenuList } from "./menu-list";

// Flags are set by importing the config above

export const NavigationContainer: React.FC = () => {
  const t = useTranslations("navigation");
  const hasLoadedRef = useRef(false);

  const {
    panelOpen,
    panelMode,
    panelMenu,
    panelMenuItem,
    openCreatePanel,
    openEditPanel,
    openCreateMenuItemPanel,
    openEditMenuItemPanel,
    closePanel,
    isSubmitting,
    setSubmitting,
  } = useNavigationStore();

  const { data: listData, isLoading } = useMenus({ page: 1, limit: 12 });
  const deleteMenuItemMutation = useDeleteMenuItem();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [locationFilter, setLocationFilter] = useState<MenuLocation | "all">(
    "all"
  );
  const [currentView, setCurrentView] = useState<
    "menus" | "menuItems" | "menuItemEdit"
  >("menus");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);
  const router = useRouter();

  const handleCreateNew = () => openCreatePanel();

  const handleEdit = (menu: any) => openEditPanel(menu);

  const handleBackToList = () => closePanel();

  const handleFormSuccess = () => closePanel();

  // Menu item management handlers
  const handleManageMenuItems = (menu: Menu) => {
    // Navigate to the dedicated manage-items page using a slug of the menu title
    const name = (menu.name?.en || menu.name?.ne || "untitled").trim();
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    router.push(`/admin/dashboard/navigation/${slug || menu.id}`);
  };

  const handleBackToMenus = () => {
    setCurrentView("menus");
    setSelectedMenu(null);
  };

  const handleCreateMenuItem = (parentId?: string) => {
    if (selectedMenu) {
      openCreateMenuItemPanel(selectedMenu.id);
    }
  };

  const handleEditMenuItem = (menuItem: any) => {
    if (selectedMenu) {
      // open full page edit for menu item
      // store the menuItem into panelMenuItem store so sidepanel doesn't open unexpectedly
      openEditMenuItemPanel(menuItem);
      setCurrentView("menuItemEdit");
    }
  };

  const handleMenuItemFormSuccess = () => {
    closePanel();
    // Refresh menu items if needed
  };

  const handleDeleteMenuItem = async (menuItem: MenuItem) => {
    // Open modal confirmation instead of native confirm
    setMenuItemToDelete(menuItem);
    setDeleteModalOpen(true);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setLocationFilter("all");
  };

  const panelTitle = panelMenuItem
    ? panelMode === "edit"
      ? t("menuItems.form.editTitle", { default: "Edit Menu Item" })
      : t("menuItems.create.title", { default: "Create Menu Item" })
    : panelMode === "edit"
      ? t("form.editTitle", { default: "Edit Menu" })
      : t("form.createTitle", { default: "Create Menu" });

  const panelSubtitle = panelMenuItem
    ? panelMode === "edit" &&
      typeof panelMenuItem === "object" &&
      panelMenuItem !== null
      ? `${panelMenuItem.title?.en || panelMenuItem.title?.ne || "Untitled"} • ${selectedMenu?.name?.en || selectedMenu?.name?.ne || "Untitled Menu"}`
      : `${t("menuItems.create.forMenu", { default: "For menu" })}: ${selectedMenu?.name?.en || selectedMenu?.name?.ne || "Untitled Menu"}`
    : panelMode === "edit"
      ? panelMenu?.name?.en
      : undefined;

  return (
    <Layer className="navigation-container">
      {/* Standard Page Header (Carbon-compliant) */}
      <div
        className="page-header-premium"
        style={{ padding: "2rem 1rem 1rem 1rem" }}
      >
        <Breadcrumb noTrailingSlash className="page-header-premium__breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            {currentView === "menus"
              ? t("title", { default: "Navigation" })
              : selectedMenu?.name?.en ||
                selectedMenu?.name?.ne ||
                t("title", { default: "Navigation" })}
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="page-header-premium__content">
          <div className="page-header-premium__text">
            <h1 className="page-header-premium__title">
              {currentView === "menus"
                ? t("title", { default: "Navigation" })
                : selectedMenu?.name?.en ||
                  selectedMenu?.name?.ne ||
                  t("title", { default: "Navigation" })}
            </h1>
            {currentView === "menus" && (
              <p className="page-header-premium__description">
                {t("subtitle", {
                  default: "Manage website navigation menus and structure.",
                })}
              </p>
            )}
          </div>

          <div>
            {currentView === "menus" && (
              <Button
                size="lg"
                renderIcon={Add}
                onClick={handleCreateNew}
                kind="primary"
                className="page-header-premium__button"
              >
                {t("actions.createNew", { default: "Create New Menu" })}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* === UPDATED: i18n title + subtitle for the delete modal === */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={
          menuItemToDelete
            ? t("modals.deleteMenuItem.title", {
                default: 'Delete "{name}"',
                name:
                  menuItemToDelete.title?.en ||
                  menuItemToDelete.title?.ne ||
                  "item",
              })
            : t("modals.confirm.title", { default: "Confirm Deletion" })
        }
        subtitle={
          menuItemToDelete
            ? t("modals.deleteMenuItem.subtitle", {
                default:
                  'Are you sure you want to delete "{name}"? This action cannot be undone.',
                name:
                  menuItemToDelete.title?.en ||
                  menuItemToDelete.title?.ne ||
                  "this item",
              })
            : undefined
        }
        onConfirm={async () => {
          if (!menuItemToDelete) return;
          try {
            await deleteMenuItemMutation.mutateAsync(menuItemToDelete.id);
            NotificationService.showSuccess(
              t("menuItems.delete.success", {
                title:
                  menuItemToDelete.title?.en || menuItemToDelete.title?.ne,
              })
            );
          } catch (error) {
            console.error("Failed to delete menu item:", error);
            NotificationService.showError(
              t("menuItems.delete.error", {
                title:
                  menuItemToDelete.title?.en || menuItemToDelete.title?.ne,
              })
            );
          } finally {
            setDeleteModalOpen(false);
            setMenuItemToDelete(null);
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMenuItemToDelete(null);
        }}
      />

      {/* Filters (reset left, filters right) */}
      <div
        className="filters-section-premium"
        style={{ padding: "0 1rem 1rem 1rem" }}
      >
        <div
          className="filters-row-premium"
          style={{ justifyContent: "space-between" }}
        >
          <div
            className="filter-actions-premium"
            style={{ marginRight: "auto" }}
          >
            <Button
              kind="ghost"
              size="md"
              renderIcon={Reset}
              onClick={handleResetFilters}
              disabled={statusFilter === "all" && locationFilter === "all"}
              className="reset-button-premium"
            >
              {t("filters.reset", { default: "Reset" })}
            </Button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <div className="filter-group-premium">
              <Dropdown
                id="menu-status-dropdown"
                size="md"
                label={t("filters.status", { default: "Status" })}
                titleText={t("filters.status", { default: "Status" })}
                items={[
                  { id: "all", label: t("filters.all", { default: "All" }) },
                  {
                    id: "active",
                    label: t("status.active", { default: "Active" }),
                  },
                  {
                    id: "inactive",
                    label: t("status.inactive", { default: "Inactive" }),
                  },
                ]}
                selectedItem={{
                  id: statusFilter,
                  label:
                    statusFilter === "all"
                      ? t("filters.all", { default: "All" })
                      : statusFilter === "active"
                        ? t("status.active", { default: "Active" })
                        : t("status.inactive", { default: "Inactive" }),
                }}
                itemToString={(item) => (item ? item.label : "")}
                onChange={({ selectedItem }) =>
                  setStatusFilter((selectedItem?.id || "all") as any)
                }
              />
            </div>
            <div className="filter-group-premium">
              <Dropdown
                id="menu-location-dropdown"
                size="md"
                label={t("filters.location", { default: "Location" })}
                titleText={t("filters.location", { default: "Location" })}
                items={[
                  { id: "all", label: t("filters.all", { default: "All" }) },
                  { id: "HEADER", label: "Header" },
                  { id: "FOOTER", label: "Footer" },
                  { id: "SIDEBAR", label: "Sidebar" },
                  { id: "MOBILE", label: "Mobile" },
                  { id: "CUSTOM", label: "Custom" },
                ]}
                selectedItem={{
                  id: locationFilter,
                  label:
                    locationFilter === "all"
                      ? t("filters.all", { default: "All" })
                      : (locationFilter as any),
                }}
                itemToString={(item) => (item ? item.label : "")}
                onChange={({ selectedItem }) =>
                  setLocationFilter((selectedItem?.id || "all") as any)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 1rem 2rem 1rem" }}>
        {currentView === "menus" ? (
          <MenuList
            onEdit={handleEdit}
            onManageItems={handleManageMenuItems}
            statusFilter={statusFilter}
            locationFilter={locationFilter}
          />
        ) : currentView === "menuItems" ? (
          <div>
            {/* REMOVED: Duplicate title and button section */}
            {selectedMenu && (
              <MenuItemTree
                menu={selectedMenu}
                onAddItem={handleCreateMenuItem}
                onEditItem={handleEditMenuItem}
                onDeleteItem={handleDeleteMenuItem}
                onReorder={() => {}} // TODO: Implement reorder
              />
            )}
          </div>
        ) : (
          // full page edit view for a single menu item (basic fields only)
          <div>
            {/* REMOVED: Duplicate title and button section */}
            {panelMenuItem && selectedMenu && (
              <div
                style={{
                  background: "var(--cds-ui-01, #fff)",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <MenuItemFormWrapper
                  menu={selectedMenu}
                  menuItem={
                    panelMenuItem === "create"
                      ? undefined
                      : (panelMenuItem as any)
                  }
                  mode={panelMode}
                  onSuccess={() => {
                    setCurrentView("menuItems");
                    closePanel();
                  }}
                  onCancel={() => {
                    setCurrentView("menuItems");
                    closePanel();
                  }}
                  hideActions
                  basicOnly
                />
                <div style={{ marginTop: "1rem" }}>
                  <Button
                    kind="primary"
                    size="lg"
                    style={{ width: "100%" }}
                    onClick={() => {
                      const formContainer =
                        document.getElementById("menu-item-form");
                      if (formContainer) {
                        const form = formContainer.closest(
                          "form"
                        ) as HTMLFormElement;
                        if (form) {
                          form.requestSubmit?.();
                        } else {
                          const evt = new CustomEvent("menuItemFormSubmit", {
                            bubbles: true,
                          });
                          formContainer.dispatchEvent(evt);
                        }
                      }
                    }}
                  >
                    {t("actions.update", { default: "Update" })}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side panel for create/edit */}
      <FeatureFlags enableSidepanelResizer={true}>
        <SidePanelForm
          title={panelTitle}
          open={!!panelOpen}
          onRequestClose={() => {
            if (!isSubmitting) {
              closePanel();
            }
          }}
          primaryButtonText={
            isSubmitting
              ? panelMode === "edit"
                ? t("actions.updating", { default: "Updating..." })
                : t("actions.creating", { default: "Creating..." })
              : panelMode === "edit"
                ? panelMenuItem
                  ? t("actions.update", { default: "Update" })
                  : t("actions.update", { default: "Update" })
                : panelMenuItem
                  ? t("actions.create", { default: "Create" })
                  : t("actions.createNew", { default: "Create" })
          }
          secondaryButtonText={t("actions.cancel", { default: "Cancel" })}
          onRequestSubmit={() => {
            if (isSubmitting) return;
            setSubmitting(true);

            if (panelMenuItem) {
              // Handle menu item form submission
              const formContainer = document.getElementById("menu-item-form");
              if (formContainer) {
                const form = formContainer.closest("form") as HTMLFormElement;
                if (form) {
                  const submitEvent = new Event("submit", {
                    cancelable: true,
                    bubbles: true,
                  });
                  form.dispatchEvent(submitEvent);
                } else {
                  // Fallback to custom event if no form found
                  const customSubmitEvent = new CustomEvent(
                    "menuItemFormSubmit",
                    { bubbles: true }
                  );
                  formContainer.dispatchEvent(customSubmitEvent);
                }
              }
            } else {
              // Handle menu form submission
              const formContainer = document.getElementById("menu-form");
              if (formContainer) {
                const form = formContainer.closest("form") as HTMLFormElement;
                if (form) {
                  const submitEvent = new Event("submit", {
                    cancelable: true,
                    bubbles: true,
                  });
                  form.dispatchEvent(submitEvent);
                } else {
                  // Fallback to custom event if no form found
                  const customSubmitEvent = new CustomEvent("menuFormSubmit", {
                    bubbles: true,
                  });
                  formContainer.dispatchEvent(customSubmitEvent);
                }
              }
            }

            // Reset submitting state after a delay to allow form processing
            setTimeout(() => {
              if (
                !document.getElementById("menu-form") &&
                !document.getElementById("menu-item-form")
              ) {
                setSubmitting(false);
              }
            }, 100);
          }}
          selectorPageContent="#main-content"
          // formTitle={
          //   panelMenuItem
          //     ? t("sections.menuItemInfo", { default: "Menu Item Information" })
          //     : t("sections.basicInfo", { default: "Basic Information" })
          // }
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="navigation-sidepanel-form"
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
              iconDescription={t("actions.cancel", { default: "Cancel" })}
              onClick={closePanel}
              renderIcon={Close}
            />
          </div>

          <div style={{ padding: 0 }}>
            {panelMenuItem ? (
              <MenuItemFormWrapper
                menu={selectedMenu as any}
                menuItem={
                  panelMenuItem === "create" ? undefined : panelMenuItem
                }
                mode={panelMode}
                onSuccess={handleMenuItemFormSuccess}
                onCancel={closePanel}
                basicOnly={false}
              />
            ) : (
              <MenuForm
                mode={panelMode}
                menu={panelMenu as any}
                onSuccess={handleFormSuccess}
                onCancel={closePanel}
              />
            )}
          </div>
        </SidePanelForm>
      </FeatureFlags>
    </Layer>
  );
};
