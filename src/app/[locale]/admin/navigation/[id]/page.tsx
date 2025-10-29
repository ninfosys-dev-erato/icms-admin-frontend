"use client";

import React, { useMemo, useState } from "react";
import SidePanelForm from "@/components/shared/side-panel-form";
// import { unstable_FeatureFlags as FeatureFlags } from "@carbon/ibm-products";
import { ArrowLeft, Close } from "@carbon/icons-react";
import { Layer, Breadcrumb, BreadcrumbItem, Button } from "@carbon/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { useParams } from "next/navigation";
import { Menu, useMenus, useNavigationStore } from "@/domains/navigation";
import { MenuItemTree } from "@/domains/navigation";
import { useDeleteMenuItem } from "@/domains/navigation/hooks/use-navigation-queries";
import "@/domains/navigation/styles/navigation.css";
import { MenuForm } from "@/domains/navigation/components/menu-form";
import { MenuItemFormWrapper } from "@/domains/navigation/components/menu-item-form-wrapper";
import { NotificationService } from "@/services/notification-service";
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';



interface PageProps {}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NavigationManageItemsPage({}: PageProps) {
  const params = useParams();
  const id = String(params?.id ?? "");
  const t = useTranslations("navigation");
  const router = useRouter();

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


  const handleCreateNew = () => openCreatePanel();

  const handleEdit = (menu: any) => openEditPanel(menu);

  const handleBackToList = () => closePanel();

  const handleFormSuccess = () => closePanel();


  
  // Fetch menus to resolve slug to actual menu object
  const { data: listData, isLoading } = useMenus({ page: 1, limit: 100 });
  const menus: Menu[] = listData?.data || [];

  const selectedMenu = useMemo(() => {
    if (!menus?.length) return null;
    const bySlug = menus.find(
      (m) => toSlug(m.name?.en || m.name?.ne || "") === id
    );
    if (bySlug) return bySlug;
    // fallback: maybe id is actual id
    const byId = menus.find((m) => m.id === id);
    return byId || null;
  }, [menus, id]);

  const displayTitle =
    selectedMenu?.name?.en ||
    selectedMenu?.name?.ne ||
    t("title", { default: "Navigation" });

  const deleteMenuItemMutation = useDeleteMenuItem();

  const handleCreateMenuItem = (parentId?: string) => {
    if (selectedMenu) {
      openCreateMenuItemPanel(selectedMenu.id);
    }
  };

  const handleEditMenuItem = (menuItem: any) => {
    if (selectedMenu) {
      openEditMenuItemPanel(menuItem);
    }
  };

  const handleMenuItemFormSuccess = () => {
    closePanel();
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<any | null>(null);

  const handleDeleteMenuItem = async (menuItem: any) => {
    // Open confirm modal
    setMenuItemToDelete(menuItem);
    setDeleteModalOpen(true);
  };

  const confirmDeleteMenuItem = async () => {
    const menuItem = menuItemToDelete;
    const display = menuItem?.title?.en || menuItem?.title?.ne || t("table.noName", { default: "Untitled" });
    try {
      if (menuItem) await deleteMenuItemMutation.mutateAsync(menuItem.id);
      NotificationService.showSuccess(t("menuItems.delete.success", { title: display }));
    } catch (error) {
      console.error(error);
      NotificationService.showError(t("menuItems.delete.error", { title: display }));
    } finally {
      setDeleteModalOpen(false);
      setMenuItemToDelete(null);
    }
  };

  return (
    <Layer className="navigation-container">
      {/* Page Header */}
      <div
        className="page-header-premium"
        style={{ padding: "2rem 1rem 1rem 1rem" }}
      >
        <Breadcrumb noTrailingSlash className="page-header-premium__breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push("/admin/navigation");
            }}
          >
            {t("title", { default: "Navigation" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{displayTitle}</BreadcrumbItem>
        </Breadcrumb>

        <div className="page-header-premium__content">
          <div className="page-header-premium__text">
            <h1 className="page-header-premium__title">{displayTitle}</h1>
          </div>
          <div>
            <Button
              kind="ghost"
              size="md"
              className="page-header-premium__button"
              // onClick={() => router.push("/admin/dashboard/navigation")}
              onClick={() => router.push("/admin/navigation")}
            >
              <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
              {t("actions.backToMenus", { default: "Back to Menus" })}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 1rem 2rem 1rem" }}>
        {selectedMenu ? (
          <MenuItemTree
            menu={selectedMenu}
            onAddItem={handleCreateMenuItem}
            onEditItem={handleEditMenuItem}
            onDeleteItem={handleDeleteMenuItem}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              {isLoading
                ? t("status.loading", { default: "Loading..." })
                : t("empty.title", { default: "No menus yet" })}
            </div>
          </div>
        )}
      </div>

      {/* Side panel (reuse same as container) */}
      {/* <FeatureFlags enableSidepanelResizer={true}> */}
        <SidePanelForm
          title={
            panelMenuItem
              ? panelMode === "edit"
                ? t("menuItems.form.editTitle", { default: "Edit Menu Item" })
                : t("menuItems.create.title", { default: "Create Menu Item" })
              : panelMode === "edit"
                ? t("form.editTitle", { default: "Edit Menu" })
                : t("form.createTitle", { default: "Create Menu" })
          }
          open={!!panelOpen}
          onRequestClose={() => {
            if (!isSubmitting) closePanel();
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
              const formContainer = document.getElementById("menu-item-form");
              if (formContainer) {
                const form = formContainer.closest("form") as HTMLFormElement;
                if (form) {
                  const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
                  form.dispatchEvent(submitEvent);
                } else {
                  const customSubmitEvent = new CustomEvent("menuItemFormSubmit", { bubbles: true });
                  formContainer.dispatchEvent(customSubmitEvent);
                }
              }
            } else {
              const formContainer = document.getElementById("menu-form");
              if (formContainer) {
                const form = formContainer.closest("form") as HTMLFormElement;
                if (form) {
                  const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
                  form.dispatchEvent(submitEvent);
                } else {
                  const customSubmitEvent = new CustomEvent("menuFormSubmit", { bubbles: true });
                  formContainer.dispatchEvent(customSubmitEvent);
                }
              }
            }

            setTimeout(() => {
              if (!document.getElementById("menu-form") && !document.getElementById("menu-item-form")) {
                setSubmitting(false);
              }
            }, 100);
          }}
          selectorPageContent="#main-content"
          formTitle={panelMenuItem ? t("sections.menuItemInfo", { default: "Menu Item Information" }) : t("sections.basicInfo", { default: "Basic Information" })}
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="navigation-sidepanel-form"
        >
          <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 10 }}>
            <Button kind="ghost" hasIconOnly size="sm" iconDescription={t("actions.cancel", { default: "Cancel" })} onClick={closePanel} renderIcon={Close} />
          </div>

          <div style={{ padding: 0 }}>
            {panelMenuItem ? (
              <MenuItemFormWrapper menu={selectedMenu as any} menuItem={panelMenuItem === "create" ? undefined : panelMenuItem} mode={panelMode} onSuccess={handleMenuItemFormSuccess} onCancel={closePanel} basicOnly={false} />
            ) : (
              <MenuForm mode={panelMode} menu={panelMenu as any} onSuccess={handleFormSuccess} onCancel={closePanel} />
            )}
          </div>
        </SidePanelForm>
      {/* </FeatureFlags> */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={t("menuItems.delete.title", { default: "Confirm Deletion" })}
        subtitle={menuItemToDelete ? t("menuItems.delete.confirmation", { title: menuItemToDelete?.title?.en || menuItemToDelete?.title?.ne || t("table.noName") }) : undefined}
        onConfirm={confirmDeleteMenuItem}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMenuItemToDelete(null);
        }}
      />
    </Layer>
  );
}
