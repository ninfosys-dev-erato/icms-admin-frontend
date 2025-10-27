"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Tag,
  Pagination,
  InlineLoading,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
  Dropdown,
} from "@carbon/react";
import { Add, Menu, Location, Edit, TrashCan } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { Menu as MenuType, MenuQuery, MenuLocation } from "../types/navigation";
import { useNavigationStore } from "../stores/navigation-store";
import {
  useMenus,
  usePublishMenu,
  useUnpublishMenu,
  useDeleteMenu,
} from "../hooks/use-navigation-queries";
import { useRouter } from "@/lib/i18n/routing";
import ConfirmDeleteModal from "@/components/shared/confirm-delete-modal";

interface MenuListProps {
  menus?: MenuType[];
  onEdit?: (menu: MenuType) => void;
  onView?: (menu: MenuType) => void;
  onManageItems?: (menu: MenuType) => void;
  onCreate?: () => void;
  statusFilter?: "all" | "active" | "inactive";
  locationFilter?: MenuLocation | "all";
}

export const MenuList: React.FC<MenuListProps> = ({
  menus: propMenus,
  onEdit,
  onView,
  onManageItems,
  onCreate,
  statusFilter = "all",
  locationFilter = "all",
}) => {
  const t = useTranslations("navigation");
  const router = useRouter();
  const [currentQuery, setCurrentQuery] = useState<MenuQuery>({
    page: 1,
    limit: 12,
  });

  // Convert filters to backend query parameters
  const isActiveParam =
    statusFilter === "all" ? undefined : statusFilter === "active";
  const locationParam = locationFilter === "all" ? undefined : locationFilter;

  const queryResult = useMenus({
    ...currentQuery,
    isActive: isActiveParam,
    location: locationParam,
  });
  const listData = queryResult.data;
  const isLoading = queryResult.isLoading;
  const pagination = listData?.pagination;

  const publishMutation = usePublishMenu();
  const unpublishMutation = useUnpublishMenu();
  const deleteMutation = useDeleteMenu();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuType | null>(null);

  const safeMenus: MenuType[] = Array.isArray(propMenus)
    ? propMenus
    : Array.isArray(listData?.data)
      ? listData.data
      : [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, locationFilter]);

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const newQuery = { ...currentQuery, page };
      setCurrentQuery(newQuery);
    },
    [currentQuery]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const newQuery = { ...currentQuery, limit: pageSize, page: 1 };
      setCurrentQuery(newQuery);
    },
    [currentQuery]
  );

  // Handle single menu actions
  const handlePublish = (menu: MenuType) => {
    if (menu.isPublished) {
      unpublishMutation.mutate(menu.id);
    } else {
      publishMutation.mutate(menu.id);
    }
  };

  const handleDelete = (menu: MenuType) => {
    setMenuToDelete(menu);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!menuToDelete) return;
    deleteMutation.mutate(menuToDelete.id);
    setDeleteModalOpen(false);
    setMenuToDelete(null);
  };

  const goToManageItems = (menu: MenuType) => {
    const name = (menu.name?.en || menu.name?.ne || "untitled").trim();
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
      router.push(`/admin/navigation/${slug || menu.id}`);
    // router.push(`/admin/dashboard/navigation/${slug || menu.id}`);
  };

  // Apply client-side filtering as a fallback so the UI filters work even when
  // the server-side query isn't immediately reflecting filter changes.
  const displayMenus = safeMenus.filter((menu) => {
    // statusFilter: 'all' | 'active' | 'inactive'
    if (statusFilter !== "all") {
      const shouldBeActive = statusFilter === "active";
      // Normalize menu.isActive which may be boolean or string like 'ACTIVE'/'active'/'true'
      const menuIsActiveNormalized = (() => {
        const raw = menu.isActive as any;
        if (typeof raw === "boolean") return raw;
        if (typeof raw === "string") {
          const v = raw.toLowerCase();
          return v === "true" || v === "active" || v === "1";
        }
        if (typeof raw === "number") return raw === 1;
        return Boolean(raw);
      })();

      if (menuIsActiveNormalized !== shouldBeActive) return false;
    }

    // locationFilter: MenuLocation | 'all'
    if (locationFilter !== "all") {
      if (menu.location !== locationFilter) return false;
    }

    return true;
  });

  const getLocationColor = (location: MenuLocation) => {
    switch (location) {
      case "HEADER":
        return "blue";
      case "FOOTER":
        return "green";
      case "SIDEBAR":
        return "purple";
      case "MOBILE":
        return "teal";
      case "CUSTOM":
        return "gray";
      default:
        return "gray";
    }
  };

  const getLocationLabel = (location: MenuLocation) => {
    switch (location) {
      case "HEADER":
        return "Header";
      case "FOOTER":
        return "Footer";
      case "SIDEBAR":
        return "Sidebar";
      case "MOBILE":
        return "Mobile";
      case "CUSTOM":
        return "Custom";
      default:
        return location;
    }
  };

  return (
    <div className="menu-list">
      {/* Content area */}
      {isLoading && safeMenus.length === 0 ? (
        <div className="loading-container">
          <InlineLoading
            description={t("status.loading", { default: "Loading..." })}
          />
        </div>
      ) : (
        <>
          {/* Premium Menu Cards - Slider-Style Design */}
          {displayMenus.length > 0 ? (
            <div className="menu-cards-grid">
              {displayMenus.map((menu: MenuType, index: number) => {
                const displayName =
                  menu.name?.en ||
                  menu.name?.ne ||
                  t("table.noName", { default: "Untitled" });

                return (
                  <div key={menu.id} className="menu-card-wrapper">
                    <div className="menu-card-premium">
                      {/* Card Header with Number Badge */}
                      <div className="menu-card-premium__header">
                        <div className="menu-card-premium__number">
                          #{index + 1}
                        </div>
                        <div className="menu-card-premium__actions">
                          <OverflowMenu
                            size="sm"
                            aria-label={t("table.actions.menu", {
                              default: "Menu actions",
                            })}
                            className="menu-card-premium__overflow"
                          >
                            <OverflowMenuItem
                              itemText={t("table.actions.edit", {
                                default: "Edit",
                              })}
                              onClick={() => onEdit?.(menu)}
                            >
                              <Edit size={16} />
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              itemText={t("table.actions.manageItems", {
                                default: "Manage Items",
                              })}
                              onClick={() =>
                                onManageItems
                                  ? onManageItems(menu)
                                  : goToManageItems(menu)
                              }
                            >
                              <Menu size={16} />
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              hasDivider
                              isDelete
                              itemText={t("table.actions.delete", {
                                default: "Delete",
                              })}
                              onClick={() => handleDelete(menu)}
                            >
                              <TrashCan size={16} />
                            </OverflowMenuItem>
                          </OverflowMenu>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="menu-card-premium__content">
                        <div className="menu-card-premium__title-section">
                          <h3 className="menu-card-premium__title">
                            {displayName}
                          </h3>
                        </div>

                        {/* Status and Metadata Row */}
                        <div className="menu-card-premium__meta-row">
                          <div className="menu-card-premium__status-tags">
                            <Tag
                              type={menu.isActive ? "green" : "gray"}
                              size="sm"
                              className="menu-card-premium__status-tag"
                            >
                              {menu.isActive
                                ? t("status.active", { default: "Active" })
                                : t("status.inactive", { default: "Inactive" })}
                            </Tag>
                            <Tag
                              type={menu.isPublished ? "blue" : "gray"}
                              size="sm"
                              className="menu-card-premium__status-tag"
                            >
                              {menu.isPublished
                                ? t("status.published", {
                                    default: "Published",
                                  })
                                : t("status.draft", { default: "Draft" })}
                            </Tag>
                          </div>

                          <div className="menu-card-premium__location-info">
                            <Tag
                              type={getLocationColor(menu.location)}
                              size="sm"
                              className="menu-card-premium__location-tag"
                            >
                              <Location size={12} />
                              <span>{getLocationLabel(menu.location)}</span>
                            </Tag>
                            <span className="menu-card-premium__item-count">
                              {menu.menuItemCount}{" "}
                              {t("table.items", { default: "items" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State following IBM Carbon Design Guidelines */
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <Menu size={48} />
                </div>
                <h3 className="empty-state-title">
                  {statusFilter !== "all" || locationFilter !== "all"
                    ? t("empty.filteredTitle", {
                        status: t(`status.${statusFilter}`),
                        location:
                          locationFilter !== "all"
                            ? getLocationLabel(locationFilter)
                            : "",
                        default: "No menus found",
                      })
                    : t("empty.title", { default: "No menus yet" })}
                </h3>
                <p className="empty-state-description">
                  {statusFilter !== "all" || locationFilter !== "all"
                    ? t("empty.filteredMessage", {
                        default:
                          "Try adjusting your filters to see more results.",
                      })
                    : t("empty.message", {
                        default:
                          "Create your first menu to get started with navigation management.",
                      })}
                </p>
                {onCreate && (
                  <Button
                    kind="primary"
                    onClick={onCreate}
                    className="empty-state-action"
                  >
                    <Add size={16} style={{ marginRight: "0.5rem" }} />
                    {t("actions.createNew", { default: "Create New Menu" })}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const totalItems = pagination?.total ?? 0;
            const shouldShowPagination =
              totalItems > 0 && displayMenus.length > 0;
            return shouldShowPagination ? (
              <div className="pagination-container">
                <Pagination
                  page={pagination!.page}
                  pageSize={pagination!.limit}
                  pageSizes={[12, 24, 48, 96]}
                  totalItems={totalItems}
                  onChange={({ page, pageSize }) => {
                    if (page !== undefined) {
                      handlePageChange(page);
                    }
                    if (pageSize !== undefined) {
                      handlePageSizeChange(pageSize);
                    }
                  }}
                  size="md"
                />
              </div>
            ) : null;
          })()}
        </>
      )}
      {/* === UPDATED: i18n title + subtitle for the delete modal === */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={
          menuToDelete
            ? t("modals.deleteMenu.title", {
                default: 'Delete "{name}"',
                name: menuToDelete.name?.en || menuToDelete.name?.ne || "menu",
              })
            : t("modals.confirm.title", { default: "Confirm Deletion" })
        }
        subtitle={
          menuToDelete
            ? t("modals.deleteMenu.subtitle", {
                default:
                  'Are you sure you want to delete "{name}"? This action cannot be undone.',
                name:
                  menuToDelete.name?.en || menuToDelete.name?.ne || "this menu",
              })
            : undefined
        }
        onConfirm={() => {
          if (menuToDelete) deleteMutation.mutate(menuToDelete.id);
          setDeleteModalOpen(false);
          setMenuToDelete(null);
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMenuToDelete(null);
        }}
      />
    </div>
  );
};
