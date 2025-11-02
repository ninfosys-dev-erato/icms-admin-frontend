"use client";

import MediaUrlService from "@/services/media-url-service";
import { Add, Image } from "@carbon/icons-react";
import { Button, InlineLoading, OverflowMenu, OverflowMenuItem, Pagination, Tag, Tile } from "@carbon/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDeleteSlider, usePublishSlider, useSliders, useUnpublishSlider } from "../hooks/use-slider-queries";
import { Slider, SliderQuery } from "../types/slider";
import { SliderImagePreview } from "./slider-image-preview";

interface SliderListProps {
  sliders?: Slider[];
  onEdit?: (slider: Slider) => void;
  onView?: (slider: Slider) => void;
  onAnalytics?: (slider: Slider) => void;
  onCreate?: () => void;
  statusFilter?: 'all' | 'active' | 'inactive';
}

export const SliderList: React.FC<SliderListProps> = ({
  sliders: propSliders,
  onEdit,
  onView,
  onAnalytics,
  onCreate,
  statusFilter = 'all',
}) => {
  const t = useTranslations("sliders");
  const [currentQuery, setCurrentQuery] = useState<SliderQuery>({ page: 1, limit: 12 });
  const router = useParams();
  const { locale } = router;
  
  // Convert status filter to backend query parameter
  const isActiveParam = statusFilter === 'all' ? undefined : statusFilter === 'active';
  
  const queryResult = useSliders({ ...currentQuery, isActive: isActiveParam });
  const listData = queryResult.data as import("../types/slider").SliderListResponse | undefined;
  const isLoading = queryResult.isLoading;
  const pagination = listData?.pagination;
  const publishMutation = usePublishSlider();
  const unpublishMutation = useUnpublishSlider();
  const deleteMutation = useDeleteSlider();

  const safeSliders: Slider[] = Array.isArray(propSliders)
    ? propSliders
    : Array.isArray(listData?.data)
      ? (listData!.data as Slider[])
      : [];

  // Reset to first page when status filter changes
  useEffect(() => {
    setCurrentQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter]);

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const newQuery = { ...currentQuery, page };
      setCurrentQuery(newQuery);
      // Updating state will update the query key, which refetches
    },
    [currentQuery]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const newQuery = { ...currentQuery, limit: pageSize, page: 1 };
      setCurrentQuery(newQuery);
      // Updating state will update the query key, which refetches
    },
    [currentQuery]
  );

  // Handle single slider actions
  // Minimal card design requested; edit/delete/publish actions removed from card UI

  // Bulk actions kept intact below the grid if needed elsewhere (not shown on cards)

  // No client-side filtering since search is server-side
  const displaySliders = safeSliders;

  // Debug logging removed for performance

  return (
    <div className="slider-list">
      {/* Content area */}
      {isLoading && safeSliders.length === 0 ? (
        <div className="loading-container slider-list-loading-container">
          <InlineLoading description={t("status.loading")} />
        </div>
      ) : (
        <>
        {/* Slider Cards - Flex layout with wrapping */}
        {displaySliders.length > 0 ? (
          <div className="slider-flex slider-list-flex">
            {displaySliders.map((slider: Slider) => {
              const img = MediaUrlService.getImageSourceFromSlider(slider);
                console.log(`Slider: ${slider}`)
              
              // Debug logging removed

              return (
                <Tile
                  key={slider.id}
                  className="slider-card slider-card--compact slider-flex-item"
                >
                  <div className="card-image">
                    {/* Position badge */}
                    <div className="position-badge">
                      <Tag type="blue" size="sm">#{slider.position}</Tag>
                    </div>
                    <SliderImagePreview
                      mediaId={img.mediaId}
                      directUrl={img.directUrl}
                      alt={img.alt || slider.title?.en || 'Slider image'}
                      className="card-image-preview"
                    />
                  </div>

                  {/* Overflow menu positioned at bottom-right of card */}
                  <div className="card-overflow-menu">
                    <OverflowMenu 
                      flipped 
                      size="sm" 
                      aria-label={t('table.actions.menu')}
                    >
                      <OverflowMenuItem
                        itemText={t('table.actions.edit')}
                        onClick={() => onEdit?.(slider)}
                      />
                      <OverflowMenuItem
                        itemText={
                          slider.isActive
                            ? t('table.actions.unpublish')
                            : t('table.actions.publish')
                        }
                        onClick={() =>
                          slider.isActive
                            ? unpublishMutation.mutate(slider.id)
                            : publishMutation.mutate(slider.id)
                        }
                      />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={t('table.actions.delete')}
                        onClick={() => deleteMutation.mutate(slider.id)}
                      />
                    </OverflowMenu>
                  </div>

                  <div className="card-content card-content--compact">
                    <h3 className="card-title card-title--compact">
                      {locale === 'ne' ? slider.title?.ne : slider.title?.en || t('table.noTitle')}
                      
                    </h3>
                    <div className="card-meta">
                      <Tag type={slider.isActive ? 'green' : 'gray'} size="sm">
                        {slider.isActive ? t('status.active') : t('status.inactive')}
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
                <Image size={48} />
              </div>
              <h3 className="empty-state-title">
                {statusFilter !== 'all' 
                  ? t('empty.filteredTitle', { status: t(`status.${statusFilter}`) })
                  : t('empty.title')}
              </h3>
              <p className="empty-state-description">
                {statusFilter !== 'all'
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
          const shouldShowPagination = totalItems > 0 && displaySliders.length > 0;
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
    </div>
  );
};
