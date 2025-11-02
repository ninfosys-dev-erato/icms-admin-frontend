"use client";

import { Folder } from "@carbon/icons-react";
import {
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@carbon/react";
import { RowActions } from "@/components/shared/row-actions";
import { useTranslations } from "next-intl";
import { useLanguageFont } from "@/shared/hooks/use-language-font";
import React, { useCallback, useMemo, useState } from "react";
import {
  useCategories,
  useDeleteCategory,
} from "../../hooks/use-category-queries";
import ConfirmDeleteModal from "@/components/shared/confirm-delete-modal";
import { useContentStore } from "../../stores/content-store";

import type { Category } from "../../types/content";

interface CategoryListProps {
  onCreate?: () => void;
}

const CategoryListComponent: React.FC<CategoryListProps> = ({ onCreate }) => {
  const { locale } = useLanguageFont();
  const t = useTranslations("content-management");
  const { openEditCategoryPanel, closePanel, panelOpen } = useContentStore();
  const deleteMutation = useDeleteCategory();

  // Local pagination state (default 10 per page)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Use TanStack Query for category data with controlled pagination
  const {
    data: categoryResponse,
    isLoading,
    error,
  } = useCategories({ page, limit: pageSize });

  // Memoize data to prevent unnecessary re-renders
  const categories = useMemo(
    () => categoryResponse?.data || [],
    [categoryResponse?.data]
  );

  const pagination = useMemo(
    () =>
      categoryResponse?.pagination || {
        page: page,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    [categoryResponse?.pagination, page, pageSize]
  );

  // Ensure displayed categories respect pagination even if backend returned full list
  const displayCategories = useMemo(() => {
    const total = pagination?.total ?? categories.length;
    const limit = pagination?.limit ?? pageSize;
    const currentPage = pagination?.page ?? page;

    // If backend returned all items in one go (categories length === total and > limit), slice client-side
    if (
      Array.isArray(categories) &&
      categories.length > limit &&
      total === categories.length
    ) {
      const start = (currentPage - 1) * limit;
      return categories.slice(start, start + limit);
    }

    // Otherwise assume server already paged the data
    return categories;
  }, [categories, pagination, page, pageSize]);

  // Debug output to help diagnose pagination issues (can be removed later)
  // eslint-disable-next-line no-console
  console.debug("CategoryList pagination state", {
    page,
    pageSize,
    pagination,
    categoriesLength: categories.length,
    displayLength: displayCategories.length,
  });

  // Memoize the edit handler to prevent child re-renders
  const handleEditCategory = useCallback(
    (category: Category) => {
      openEditCategoryPanel(category);
    },
    [openEditCategoryPanel]
  );

  // Handle row click - close panel if it's open
  const handleRowClick = useCallback(() => {
    if (panelOpen) {
      closePanel();
    }
  }, [panelOpen, closePanel]);

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  // Handler to open modal
  const handleDeleteCategory = useCallback((category: Category) => {
    setCatToDelete(category);
    setDeleteModalOpen(true);
  }, []);

  // Handle pagination change from Carbon Pagination component
  const handlePageChange = useCallback(
    ({
      page: newPage,
      pageSize: newPageSize,
    }: {
      page: number;
      pageSize: number;
    }) => {
      if (newPageSize !== pageSize) {
        // If page size changed, reset to first page
        setPageSize(newPageSize);
        setPage(1);
      } else {
        setPage(newPage);
      }
    },
    [pageSize]
  );

  // Reusable pagination element (rendered for both table and empty state)
  const paginationElement = (
    <div className="pagination-wrapper">
      <Pagination
        page={page}
        pageSize={pageSize}
        pageSizes={[10, 20, 30]}
        totalItems={pagination.total}
        onChange={handlePageChange}
        backwardText={t("pagination.previous", { default: "Previous" })}
        forwardText={t("pagination.next", { default: "Next" })}
        itemsPerPageText={t("pagination.itemsPerPage", {
          default: "Items per page:",
        })}
        pageNumberText={t("pagination.pageNumber", {
          default: "Page Number",
          pageNumber: page,
        })}
      />
    </div>
  );

  if (isLoading && categories.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading
          description={t("status.loading", { default: "Loading" })}
        />
      </div>
    );
  }

  // Helper to get name in selected language
  const getCategoryName = (cat: Category) => {
    if (locale === "ne") {
      return cat.name?.ne || cat.name?.en || cat.slug || "";
    }
    return cat.name?.en || cat.name?.ne || cat.slug || "";
  };

  const getParentName = (cat: Category) => {
    if (!cat.parent) return "";
    if (locale === "ne") {
      return (
        cat.parent.name?.ne || cat.parent.name?.en || cat.parent.slug || ""
      );
    }
    return cat.parent.name?.en || cat.parent.name?.ne || cat.parent.slug || "";
  };

  return (
    <div className="category-list">
      {categories.length > 0 ? (
        <>
          <TableContainer>
            <Table size="md" useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableHeader>
                    {t("categories.form.name.label", { default: "Name" })}
                  </TableHeader>
                  <TableHeader>
                    {t("categories.card.parent", { default: "Parent" })}
                  </TableHeader>
                  <TableHeader>
                    {t("categories.form.order.label", { default: "Order" })}
                  </TableHeader>
                  <TableHeader>
                    {t("categories.card.active", { default: "Active" })}
                  </TableHeader>
                  <TableHeader>
                    {t("categories.card.actions", { default: "Actions" })}
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayCategories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    onClick={handleRowClick}
                    style={{ cursor: panelOpen ? "pointer" : "default" }}
                  >
                    <TableCell
                      className={locale === "ne" ? "font-ne" : "font-en"}
                    >
                      {getCategoryName(cat)}
                    </TableCell>
                    <TableCell
                      className={locale === "ne" ? "font-ne" : "font-en"}
                    >
                      {getParentName(cat)}
                    </TableCell>
                    <TableCell>{cat.order ?? 0}</TableCell>
                    <TableCell>
                      <Tag type={cat.isActive ? "green" : "gray"} size="sm">
                        {cat.isActive
                          ? t("categories.card.active", { default: "Active" })
                          : t("categories.card.inactive", {
                              default: "Inactive",
                            })}
                      </Tag>
                    </TableCell>
                    <TableCell className="table-cell-right">
                      <div
                        onClick={(e) => {
                          // Prevent row click from closing the panel when interacting with RowActions
                          e.stopPropagation();
                        }}
                      >
                        <RowActions
                          ariaLabel={t("categories.card.actions", {
                            default: "Actions",
                          })}
                          actions={[
                            {
                              key: "edit",
                              itemText: t("categories.card.edit", {
                                default: "Edit",
                              }),
                              onClick: () => handleEditCategory(cat),
                            },
                            {
                              key: "delete",
                              itemText: t("categories.card.delete", {
                                default: "Delete",
                              }),
                              onClick: () => handleDeleteCategory(cat),
                              hasDivider: true,
                              isDelete: true,
                            },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Always show pagination for the table view */}
          {paginationElement}
          {/* Confirm Delete Modal for category deletion */}
          <ConfirmDeleteModal
            open={deleteModalOpen}
            title={t("categories.deleteModal.title", {
              default: "Confirm Deletion",
            })}
            subtitle={
              catToDelete
                ? t(`categories.deleteModal.subtitle`, {
                    default: `Are you sure you want to delete "${getCategoryName(catToDelete)}"? This action cannot be undone.`,
                  })
                : undefined
            }
            onConfirm={() => {
              if (catToDelete) deleteMutation.mutate(catToDelete.id);
              setDeleteModalOpen(false);
              setCatToDelete(null);
            }}
            onCancel={() => {
              setDeleteModalOpen(false);
              setCatToDelete(null);
            }}
          />
        </>
      ) : (
        /* Carbon Design System compliant empty state */
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <Folder size={48} />
            </div>
            {/* Pagination controls */}
            {paginationElement}
            <h3 className="empty-state-title">
              {t("categories.list.empty", { default: "No categories yet" })}
            </h3>
            <p className="empty-state-description">
              {t("categories.list.emptyDescription", {
                default: "Create your first category to organize content.",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CategoryList = React.memo(CategoryListComponent);
CategoryList.displayName = "CategoryList";
