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
import { useMedia } from "../hooks/use-media-queries";
import type { Media, MediaQuery } from "../types/media";
import { useMediaStore } from "../stores/media-store";
import { useTranslations } from "next-intl";
import MediaUrlService from "@/services/media-url-service";

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
  const [query, setQuery] = useState<Partial<MediaQuery>>({
    page: 1,
    limit: 12,
  });
  const { openEditPanel } = useMediaStore();
  const queryResult = useMedia(query);
  const t = useTranslations("media");

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

  return (
    <div className="media-list">
      {filteredItems.length > 0 ? (
        <div className="media-flex">
          {filteredItems.map((m) => {
            const src =
              m.presignedUrl || m.url
                ? MediaUrlService.toProxyUrl(m.presignedUrl ?? m.url ?? "")
                : null;
            return (
              <Tile key={m.id} className="media-card media-flex-item">
                <div className="card-image">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={m.altText || m.title || m.originalName}
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
                        /* to be wired */
                      }}
                    />
                  </OverflowMenu>
                </div>
                <div className="card-content card-content--compact">
                  <h3
                    className="card-title card-title--compact"
                    title={m.originalName}
                  >
                    {m.title || m.originalName}
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

      {!!pagination && items.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
            pageSizes={[12, 24, 48, 96]}
            totalItems={pagination.total}
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
