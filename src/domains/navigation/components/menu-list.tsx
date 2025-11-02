
"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Tag,
  Pagination,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import { Add, Menu, Location, Edit, TrashCan } from "@carbon/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { Menu as MenuType, MenuQuery, MenuLocation } from "../types/navigation";
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
  const locale = useLocale();

  const [query, setQuery] = useState<Partial<MenuQuery>>({
    page: 1,
    limit: 12,
  });

  const isActiveParam =
    statusFilter === "all" ? undefined : statusFilter === "active";
  const locationParam = locationFilter === "all" ? undefined : locationFilter;

  const queryResult = useMenus({
    ...(query as Partial<MenuQuery>),
    isActive: isActiveParam,
    location: locationParam,
  });

  const listData = queryResult.data;
  const isLoading = queryResult.isLoading || queryResult.isFetching;
  const pagination = listData?.pagination;

  const publishMutation = usePublishMenu();
  const unpublishMutation = useUnpublishMenu();
  const deleteMutation = useDeleteMenu();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuType | null>(null);

  const safeMenus: MenuType[] = Array.isArray(listData?.data)
    ? listData.data
    : Array.isArray(propMenus)
    ? propMenus
    : [];

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, locationFilter]);

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setQuery((prev) => ({ ...prev, page, limit: pageSize ?? prev.limit }));
  }, []);

  const handleDelete = (menu: MenuType) => {
    setMenuToDelete(menu);
    setDeleteModalOpen(true);
  };

  const goToManageItems = (menu: MenuType) => {
    const name = (menu.name?.en || menu.name?.ne || "untitled").trim();
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    router.push(`/admin/dashboard/navigation/${slug || menu.id}`);
  };

  const displayMenus = safeMenus.filter((menu) => {
    if (statusFilter !== "all") {
      const shouldBeActive = statusFilter === "active";
      const raw = menu.isActive as any;
      const normalized =
        typeof raw === "boolean"
          ? raw
          : typeof raw === "string"
          ? ["true", "active", "1"].includes(raw.toLowerCase())
          : typeof raw === "number"
          ? raw === 1
          : Boolean(raw);
      if (normalized !== shouldBeActive) return false;
    }
    if (locationFilter !== "all" && menu.location !== locationFilter)
      return false;
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

  useEffect(() => {
    function adjustOverflowMenus() {
      const dropdowns =
        document.querySelectorAll<HTMLElement>(".cds--overflow-menu-options");
      dropdowns.forEach((el) => {
        el.style.transform = "";
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth - 8) {
          const overflowAmount = rect.right - (window.innerWidth - 8);
          el.style.transform = `translateX(-${overflowAmount + 20}px)`;
        }
        if (rect.left < 8) {
          el.style.transform = `translateX(${Math.abs(rect.left) + 8}px)`;
        }
      });
    }
    document.addEventListener("click", adjustOverflowMenus);
    window.addEventListener("resize", adjustOverflowMenus);
    return () => {
      document.removeEventListener("click", adjustOverflowMenus);
      window.removeEventListener("resize", adjustOverflowMenus);
    };
  }, []);

  // ✅ Helper for Nepali digits
  const formatNumber = (n: number | string): string => {
    if (locale === "ne") {
      const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
      return String(n).replace(/[0-9]/g, (ch) => digits[Number(ch)] ?? ch);
    }
    return String(n);
  };

  return (
    <div className="menu-list">
      {isLoading && safeMenus.length === 0 ? (
        <div className="loading-container">
          <InlineLoading
            description={t("status.loading", { default: "Loading..." })}
          />
        </div>
      ) : (
        <>
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
                      <div className="menu-card-premium__header">
                        <div className="menu-card-premium__number">
                          #{index + 1}
                        </div>
                        <div className="menu-card-premium__actions">
                          <div className="menu-card-premium__overflow-wrapper">
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
                      </div>

                      <div className="menu-card-premium__content">
                        <div className="menu-card-premium__title-section">
                          <h3 className="menu-card-premium__title">
                            {displayName}
                          </h3>
                        </div>

                        <div className="menu-card-premium__meta-row">
                          <div className="menu-card-premium__status-tags">
                            <Tag
                              type={menu.isActive ? "green" : "gray"}
                              size="sm"
                              className="menu-card-premium__status-tag"
                            >
                              {menu.isActive
                                ? t("status.active", { default: "Active" })
                                : t("status.inactive", {
                                    default: "Inactive",
                                  })}
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

          {(() => {
            const totalItems = pagination?.total ?? 0;
            const shouldShowPagination =
              totalItems > 0 && displayMenus.length > 0;
            return shouldShowPagination ? (
              <div className="pagination-container">
                <Pagination
                  page={query.page}
                  pageSize={query.limit}
                  pageSizes={[12, 24, 48, 96]}
                  totalItems={pagination?.total ?? 0}
                  itemsPerPageText={
                    locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page"
                  }
                  itemRangeText={(min, max, total) =>
                    `${formatNumber(min)}–${formatNumber(max)} ${
                      locale === "ne" ? "मध्ये" : "of"
                    } ${formatNumber(total)}`
                  }
                  pageNumberText={locale === "ne" ? "पृष्ठ" : "Page"}
                  onChange={({ page, pageSize }) =>
                    handlePageChange(page ?? 1, pageSize)
                  }
                  size="md"
                />
              </div>
            ) : null;
          })()}
        </>
      )}

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={
          menuToDelete
            ? t("modals.deleteMenu.title", {
                default: 'Delete "{name}"',
                name:
                  menuToDelete.name?.en ||
                  menuToDelete.name?.ne ||
                  "menu",
              })
            : t("modals.confirm.title", { default: "Confirm Deletion" })
        }
        subtitle={
          menuToDelete
            ? t("modals.deleteMenu.subtitle", {
                default:
                  'Are you sure you want to delete "{name}"? This action cannot be undone.',
                name:
                  menuToDelete.name?.en ||
                  menuToDelete.name?.ne ||
                  "this menu",
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

      <PaginationNepaliFix locale={locale} />
    </div>
  );
};

// ✅ Nepali number + text patch for Carbon pagination
const PaginationNepaliFix = ({ locale }: { locale: string }) => {
  useEffect(() => {
    if (locale !== "ne") return;

    const digitMap: Record<string, string> = {
      "0": "०",
      "1": "१",
      "2": "२",
      "3": "३",
      "4": "४",
      "5": "५",
      "6": "६",
      "7": "७",
      "8": "८",
      "9": "९",
    };

    const convertToNepali = (text: string): string => {
      if (!text) return text;
      let result = text.replace(/[0-9]/g, (d) => digitMap[d] || d);
      result = result
        .replace(/\bof\b/gi, "मध्ये")
        .replace(/\bpage\b/gi, "पृष्ठ");
      return result;
    };

    const updatePaginationText = () => {
      document
        .querySelectorAll(
          ".cds--pagination__button, .cds--select-option, .cds--pagination__text"
        )
        .forEach((el) => {
          el.childNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
              n.textContent = convertToNepali(n.textContent || "");
            }
          });
        });
    };

    const observer = new MutationObserver(updatePaginationText);
    observer.observe(document.body, { subtree: true, childList: true });

    updatePaginationText();
    return () => observer.disconnect();
  }, [locale]);

  return null;
};
