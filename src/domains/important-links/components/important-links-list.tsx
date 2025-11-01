"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Tag, Pagination, InlineLoading, Tile, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { Add, Link } from "@carbon/icons-react";
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
import { useLanguageFont } from '@/shared/hooks/use-language-font';
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
  
  // Always fetch all links from backend (ignore server-side isActive filtering)
  const searchQuery = useSearchImportantLinks(searchTerm, currentQuery);
  const regularQuery = useImportantLinks(currentQuery);
  const queryResult = searchTerm.trim() ? searchQuery : regularQuery;

  const listData = queryResult.data as import("../types/important-links").ImportantLinkListResponse | undefined;
  const isLoading = queryResult.isLoading;
  const pagination = listData?.pagination;

  const toggleStatusMutation = useToggleImportantLinkStatus();
  const deleteMutation = useDeleteImportantLink();

  const safeLinks: ImportantLink[] = Array.isArray(listData?.data) ? listData.data : [];
  
  // Prefer titles based on current locale (show Nepali when locale === 'ne')
  const { locale } = useLanguageFont();

  const getLocalizedTitle = (link: ImportantLink | null | undefined) => {
    if (!link) return '';
    const en = link.linkTitle?.en?.trim();
    const ne = link.linkTitle?.ne?.trim();
    if (locale === 'ne') return ne || en || 'Untitled Link';
    return en || ne || 'Untitled Link';
  };
  // Reset to first page when status filter or search term changes
  useEffect(() => {
    setCurrentQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, searchTerm]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentQuery(prev => ({ ...prev, page }));
    },
    []
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setCurrentQuery(prev => ({ ...prev, limit: pageSize, page: 1 }));
    },
    []
  );

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
  const display = link ? getLocalizedTitle(link) : '';
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

  // **Client-side filtering for status**
  const displayLinks = safeLinks
    .filter(link => 
      statusFilter === 'active' ? link.isActive :
      statusFilter === 'inactive' ? !link.isActive :
      true
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="important-links-list">
      {isLoading && safeLinks.length === 0 ? (
        <div className="loading-container">
          <InlineLoading description={t("status.loading")} />
        </div>
      ) : (
        <>
        {displayLinks.length > 0 ? (
          <div className="links-grid">
            {displayLinks.map((link: ImportantLink) => {
              const displayTitle = getLocalizedTitle(link);
              const formattedUrl = ImportantLinksService.formatUrl(link.linkUrl);
              return (
                <Tile key={link.id} className="link-card link-card--compact">
                  <div className="card-header">
                    <div className="order-badge">
                      <Tag type="blue" size="sm">#{link.order}</Tag>
                    </div>
                    <div className="card-overflow-menu">
                      <OverflowMenu flipped size="sm" aria-label={t('table.actions.menu')}>
                        <OverflowMenuItem itemText={t('table.actions.edit')} onClick={() => onEdit?.(link)} />
                        <OverflowMenuItem itemText={t('table.actions.openLink')} onClick={() => handleExternalLink(link.linkUrl)} />
                        <OverflowMenuItem 
                          itemText={link.isActive ? t('table.actions.unpublish') : t('table.actions.publish')} 
                          onClick={() => handleToggleStatus(link)} 
                        />
                        <OverflowMenuItem hasDivider isDelete itemText={t('table.actions.delete')} onClick={() => handleDelete(link)} />
                      </OverflowMenu>
                    </div>
                  </div>

                  <div className="card-content card-content--compact">
                    <h3 className="card-title card-title--compact" title={displayTitle}>{displayTitle}</h3>
                    <div className="simple-url-container">
                      <a href={link.linkUrl} target="_blank" rel="noopener noreferrer" className="simple-url-link" title={link.linkUrl}>{formattedUrl}</a>
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
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-state-icon"><Link size={48} /></div>
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
                <Button kind="primary" renderIcon={Add} onClick={onCreate} className="empty-state-action">
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
                  if (page !== undefined) handlePageChange(page);
                  if (pageSize !== undefined) handlePageSizeChange(pageSize);
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
        subtitle={linkToDelete ? t('delete.confirmation', { title: getLocalizedTitle(linkToDelete), default: `Are you sure you want to delete "${getLocalizedTitle(linkToDelete)}"? This action cannot be undone.` }) : undefined}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setLinkToDelete(null); }}
      />
    </div>
  );
};
