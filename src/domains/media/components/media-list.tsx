"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  InlineLoading,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Tile,
} from "@carbon/react";
import { Image, TrashCan } from "@carbon/icons-react";
import { useMedia, useDeleteMedia } from "../hooks/use-media-queries";
import type { Media, MediaQuery } from "../types/media";
import { useMediaStore } from "../stores/media-store";
import { useTranslations, useLocale } from "next-intl";
import MediaUrlService from "@/services/media-url-service";
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';

interface MediaListProps {
  search?: string;
  statusFilter?: "all" | "active" | "inactive";
  visibilityFilter?: "all" | "public" | "private";
}

export const MediaList: React.FC<MediaListProps> = ({
  search = "",
  statusFilter = "all",
  visibilityFilter = "all",
}) => {
  const locale = useLocale();
  const [query, setQuery] = useState<Partial<MediaQuery>>({
    page: 1,
    limit: 12,
  });
  const { openEditPanel } = useMediaStore();
  const queryResult = useMedia(query);
  const deleteMutation = useDeleteMedia();
  const t = useTranslations("media");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setQuery((prev) => ({
      ...prev,
      page,
      limit: pageSize ?? prev.limit,
    }));
  }, []);

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      search: search || undefined,
      isActive: statusFilter === 'active' ? true : undefined,
      isPublic: visibilityFilter === 'public' ? true : undefined,
    }));
  }, [search, statusFilter, visibilityFilter]);

  const data = queryResult.data;
  const items = (data?.data ?? []) as Media[];
  const parseBool = (v: any) => {
    if (v === true || v === 'true' || v === 1 || v === '1') return true;
    if (v === false || v === 'false' || v === 0 || v === '0') return false;
    return Boolean(v);
  };

  const filteredItems = items.filter((m) => {
    if (statusFilter !== "all") {
      const shouldBeActive = statusFilter === "active";
      const actualActive = parseBool((m as any).isActive);
      if (actualActive !== shouldBeActive) return false;
    }
    if (visibilityFilter !== "all") {
      const shouldBePublic = visibilityFilter === "public";
      const actualPublic = parseBool((m as any).isPublic);
      if (actualPublic !== shouldBePublic) return false;
    }
    return true;
  });
  const pagination = data?.pagination || {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  if (queryResult.isLoading && items.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("list.loading")} />
      </div>
    );
  }

  // Helpers to safely display localized or plain string fields
  const toDisplayText = (value: unknown, fallback: string = ''): string => {
    if (typeof value === 'string') return value || fallback;
    if (value && typeof value === 'object') {
      const v: any = value as any;
      // Prefer current locale, then English, then Nepali
      const localized = (typeof locale === 'string' && v[locale]) || v.en || v.ne;
      if (typeof localized === 'string') return localized || fallback;
    }
    return fallback;
  };

  return (
    <div className="media-list">
      {filteredItems.length > 0 ? (
        <div className="media-flex">
          {filteredItems.map((m) => {
            const src =
              m.presignedUrl || m.url
                ? MediaUrlService.toProxyUrl(m.presignedUrl ?? m.url ?? "")
                : null;
            const displayTitle = toDisplayText(m.title, m.originalName);
            const displayAlt = toDisplayText((m as any).altText, displayTitle || m.originalName);
            return (
              <Tile key={m.id} className="media-card media-flex-item">
                <div className="card-image">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={displayAlt || displayTitle || m.originalName}
                      className="preview-image"
                    />
                  ) : (
                    <div className="media-card__placeholder">
                      <Image size={32} />
                    </div>
                  )}
                </div>
                <div className="card-overflow-menu">
                  <OverflowMenu
                    flipped
                    size="sm"
                    aria-label={t("card.actions")}
                  >
                    <OverflowMenuItem
                      itemText={t("card.edit")}
                      onClick={() => openEditPanel(m)}
                    />
                    <OverflowMenuItem
                      isDelete
                      hasDivider
                      itemText={t("card.delete")}
                      onClick={() => {
                        setSelectedItem(m);
                        setIsConfirmOpen(true);
                      }}
                    />
                  </OverflowMenu>
                </div>
                <div className="card-content card-content--compact">
                  <h3
                    className="card-title card-title--compact"
                    title={displayTitle || m.originalName}
                  >
                    {displayTitle || m.originalName}
                  </h3>
                  <div className="media-card__meta">
                    <Tag size="sm" type={m.isActive ? "green" : "gray"}>
                      {m.isActive ? "Active" : "Inactive"}
                    </Tag>
                    <Tag size="sm" type={m.isPublic ? "teal" : "purple"}>
                      {m.isPublic ? "Public" : "Private"}
                    </Tag>
                    <span className="text-small">
                      {(m.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
              </Tile>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <Image size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.emptyTitle")}</h3>
            <p className="empty-state-description">
              {t("list.emptyDescription")}
            </p>
            {(statusFilter !== 'all' || visibilityFilter !== 'all' || (query?.search && query.search !== '')) && (
              <p className="empty-state-help">{t('list.noResultsForFilters', { default: 'No media match the selected filters.' } as any)}</p>
            )}
          </div>
        </div>
      )}

      {isConfirmOpen && selectedItem && (
        <ConfirmDeleteModal
          open={isConfirmOpen}
          title={t('card.confirmDeleteTitle', { default: 'Confirm deletion' } as any)}
          subtitle={t('card.confirmDeleteSubtitle', { name: toDisplayText(selectedItem.title, selectedItem.originalName), default: `Are you sure you want to delete "${toDisplayText(selectedItem.title, selectedItem.originalName)}"? This action cannot be undone.` } as any)}
          confirmLabel={t('actions.delete', { default: 'Delete' } as any)}
          cancelLabel={t('actions.cancel', { default: 'Cancel' } as any)}
          onCancel={() => {
            setIsConfirmOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={() => {
            if (!selectedItem) return;
            try {
              deleteMutation.mutate(selectedItem.id);
            } finally {
              setIsConfirmOpen(false);
              setSelectedItem(null);
            }
          }}
        />
      )}

      {!!pagination && filteredItems.length > 0 && (
        <div className="pagination-container">
          <Pagination
              page={Number(pagination.page) || 1}
              pageSize={Number(pagination.limit) || 12}
            pageSizes={[12, 24, 48, 96]}
              totalItems={(statusFilter !== 'all' || visibilityFilter !== 'all' || (query?.search && query.search !== '')) ? filteredItems.length : (pagination.total || filteredItems.length)}
            onChange={({ page, pageSize }) => handlePageChange(page, pageSize)}
            backwardText="Previous"
            forwardText="Next"
            itemsPerPageText="Items per page:"
            pageNumberText="Page Number"
          />
        </div>
      )}
    </div>
  );
};
