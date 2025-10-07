"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Tag, Pagination, InlineLoading, Tile, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { Add, Link, Launch } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { ImportantLink, ImportantLinkQuery } from "../types/important-links";
import { useImportantLinksStore } from "../stores/important-links-store";
import { 
  useImportantLinks, 
  useSearchImportantLinks, 
  useDeleteImportantLink, 
  useToggleImportantLinkStatus 
} from "../hooks/use-important-links-queries";
import { ImportantLinksService } from "../services/important-links-service";
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';
import { NotificationService } from '@/services/notification-service';

interface ImportantLinksListProps {
  onEdit?: (link: ImportantLink) => void;
  onView?: (link: ImportantLink) => void;
  onCreate?: () => void;
  statusFilter?: 'all' | 'active' | 'inactive';
  searchTerm?: string;
}

export const ImportantLinksList: React.FC<ImportantLinksListProps> = ({
  onEdit,
  onView,
  onCreate,
  statusFilter = 'all',
  searchTerm = '',
}) => {
  const t = useTranslations("important-links");
  const [currentQuery, setCurrentQuery] = useState<ImportantLinkQuery>({ page: 1, limit: 12 });
  
  // Convert status filter to backend query parameter
  const isActiveParam = statusFilter === 'all' ? undefined : statusFilter === 'active';
  
  // Use search query if search term is provided, otherwise use regular query
  const searchQuery = useSearchImportantLinks(searchTerm, { ...currentQuery, isActive: isActiveParam });
  const regularQuery = useImportantLinks({ ...currentQuery, isActive: isActiveParam });
  
  const queryResult = searchTerm.trim() ? searchQuery : regularQuery;
  const listData = queryResult.data as import("../types/important-links").ImportantLinkListResponse | undefined;
  const isLoading = queryResult.isLoading;
  const pagination = listData?.pagination;
  
  const toggleStatusMutation = useToggleImportantLinkStatus();
  const deleteMutation = useDeleteImportantLink();

  const safeLinks: ImportantLink[] = Array.isArray(listData?.data)
    ? (listData!.data as ImportantLink[])
    : [];

  // Reset to first page when status filter or search term changes
  useEffect(() => {
    setCurrentQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, searchTerm]);

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

  // Handle link actions
  const handleToggleStatus = (link: ImportantLink) => {
    toggleStatusMutation.mutate({ id: link.id, isActive: !link.isActive });
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ImportantLink | null>(null);

  const handleDelete = (link: ImportantLink) => {
    setLinkToDelete(link);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const link = linkToDelete;
    const display = link ? ImportantLinksService.getDisplayTitle(link) : '';
    try {
      if (link) await deleteMutation.mutateAsync(link.id);
      NotificationService.showSuccess(t('notifications.deleted', { default: `${display} deleted` }));
    } catch (error) {
      console.error(error);
      NotificationService.showError(t('notifications.deleteError', { default: `Failed to delete ${display}` }));
    } finally {
      setDeleteModalOpen(false);
      setLinkToDelete(null);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // No client-side filtering since search is server-side
  // Server should handle filtering via `isActive` param, but some backends or
  // HTTP serialization can omit falsey query params. As a safe fallback,
  // apply a client-side filter when `statusFilter` explicitly requests
  // active/inactive results.
  const displayLinks = (() => {
    if (statusFilter === 'all') return safeLinks;
    if (statusFilter === 'active') return safeLinks.filter((l) => l.isActive);
    if (statusFilter === 'inactive') return safeLinks.filter((l) => !l.isActive);
    return safeLinks;
  })();

  return (
    <div className="important-links-list">
      {/* Content area */}
      {isLoading && safeLinks.length === 0 ? (
        <div className="loading-container">
          <InlineLoading description={t("status.loading")} />
        </div>
      ) : (
        <>
        {/* Links Cards - Using CSS Grid for consistent sizing */}
        {displayLinks.length > 0 ? (
          <div className="links-grid">
            {displayLinks.map((link: ImportantLink) => {
              const displayTitle = ImportantLinksService.getDisplayTitle(link);
              const formattedUrl = ImportantLinksService.formatUrl(link.linkUrl);
              
              return (
                <Tile
                  key={link.id}
                  className="link-card link-card--compact"
                >
                  <div className="card-header">
                    {/* Order badge */}
                    <div className="order-badge">
                      <Tag type="blue" size="sm">#{link.order}</Tag>
                    </div>
                    
                    {/* Overflow menu positioned at top-right of card */}
                    <div className="card-overflow-menu">
                      <OverflowMenu 
                        flipped 
                        size="sm" 
                        aria-label={t('table.actions.menu')}
                      >
                        <OverflowMenuItem
                          itemText={t('table.actions.edit')}
                          onClick={() => onEdit?.(link)}
                        />
                        <OverflowMenuItem
                          itemText={t('table.actions.openLink')}
                          onClick={() => handleExternalLink(link.linkUrl)}
                        />
                        <OverflowMenuItem
                          itemText={
                            link.isActive
                              ? t('table.actions.unpublish')
                              : t('table.actions.publish')
                          }
                          onClick={() => handleToggleStatus(link)}
                        />
                        <OverflowMenuItem
                          hasDivider
                          isDelete
                          itemText={t('table.actions.delete')}
                          onClick={() => handleDelete(link)}
                        />
                      </OverflowMenu>
                    </div>
                  </div>

                  <div className="card-content card-content--compact">
                    <h3 className="card-title card-title--compact" title={displayTitle}>
                      {displayTitle}
                    </h3>
                    
                    {/* Simple anchor tag instead of styled URL box */}
                    <div className="simple-url-container">
                      <a 
                        href={link.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="simple-url-link"
                        title={link.linkUrl}
                      >
                        {formattedUrl}
                      </a>
                    </div>
                    
                    <div className="card-meta">
                      <Tag type={link.isActive ? 'green' : 'gray'} size="sm">
                        {link.isActive ? t('status.active') : t('status.inactive')}
                      </Tag>
                      
                    </div>
                  </div>
                </Tile>
              );
            })}
          </div>
        ) : (
          /* Improved Empty State following IBM Carbon Design Guidelines */
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">
                <Link size={48} />
              </div>
              <h3 className="empty-state-title">
                {searchTerm 
                  ? t('empty.searchTitle', { term: searchTerm })
                  : statusFilter !== 'all' 
                    ? t('empty.filteredTitle', { status: t(`status.${statusFilter}`) })
                    : t('empty.title')}
              </h3>
              <p className="empty-state-description">
                {searchTerm
                  ? t('empty.searchMessage')
                  : statusFilter !== 'all'
                    ? t('empty.filteredMessage')
                    : t('empty.message')}
              </p>
              {onCreate && (
                <Button
                  kind="primary"
                  renderIcon={Add}
                  onClick={onCreate}
                  className="empty-state-action"
                >
                  {t('actions.createNew')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {(() => {
          const totalItems = pagination?.total ?? 0;
          const shouldShowPagination = totalItems > 0 && displayLinks.length > 0;
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

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={t('delete.title', { default: 'Confirm Deletion' })}
        subtitle={linkToDelete ? t('delete.confirmation', { title: ImportantLinksService.getDisplayTitle(linkToDelete), default: `Are you sure you want to delete "${ImportantLinksService.getDisplayTitle(linkToDelete)}"? This action cannot be undone.` }) : undefined}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setLinkToDelete(null); }}
      />

      {/* All card and grid styles moved to important-links.css */}
    </div>
  );
};

