"use client";

import React from "react";
import { Tile, SkeletonPlaceholder } from "@carbon/react";
import { useTranslations } from "next-intl";
import { ImportantLinkStatistics as ImportantLinkStatisticsType } from "../types/important-links";
import { useImportantLinksStatistics } from "../hooks/use-important-links-queries";

interface ImportantLinksStatisticsProps {
  statistics?: ImportantLinkStatisticsType | null;
  loading?: boolean;
}

export const ImportantLinksStatistics: React.FC<ImportantLinksStatisticsProps> = ({
  statistics,
  loading = false,
}) => {
  const t = useTranslations("important-links");
  const { data: fetchedStatistics, isLoading: isFetching } = useImportantLinksStatistics();

  // Use provided statistics or fetched ones
  const displayStatistics = statistics || fetchedStatistics;
  const isDisplayLoading = loading || isFetching;

  if (isDisplayLoading || !displayStatistics) {
    return (
      <div className="important-links-statistics important-links-statistics-loading">
        <div className="statistics-grid">
          {[1, 2, 3, 4].map((i) => (
            <Tile key={i} className="statistic-tile">
              <SkeletonPlaceholder className="statistic-skeleton" />
            </Tile>
          ))}
        </div>
      </div>
    );
  }

  const statisticItems = [
    {
      key: "total",
      label: t("statistics.total"),
      value: displayStatistics.total,
      description: t("statistics.totalDescription"),
      type: "default" as const,
    },
    {
      key: "active",
      label: t("statistics.active"),
      value: displayStatistics.active,
      description: t("statistics.activeDescription"),
      type: "green" as const,
    },
    {
      key: "inactive",
      label: t("statistics.inactive"),
      value: displayStatistics.inactive,
      description: t("statistics.inactiveDescription"),
      type: "gray" as const,
    },
    {
      key: "lastUpdated",
      label: t("statistics.lastUpdated"),
      value: displayStatistics.lastUpdated 
        ? new Date(displayStatistics.lastUpdated).toLocaleDateString()
        : t("statistics.never"),
      description: t("statistics.lastUpdatedDescription"),
      type: "blue" as const,
    },
  ];

  return (
    <div className="important-links-statistics">
      <div className="statistics-header">
        <h2>{t("statistics.title")}</h2>
        <p className="text-secondary">
          {t("statistics.subtitle")}
        </p>
      </div>

      <div className="statistics-grid">
        {statisticItems.map((item) => (
          <Tile key={item.key} className="statistic-tile">
            <div className="statistic-content">
              <div className={`statistic-value statistic-value--${item.type}`}>
                {item.value}
              </div>
              <div className="statistic-label">{item.label}</div>
              <div className="statistic-description text-secondary">
                {item.description}
              </div>
            </div>
          </Tile>
        ))}
      </div>

      {/* Additional Insights */}
      {displayStatistics.total > 0 && (
        <div className="statistics-insights">
          <Tile className="insights-tile">
            <h3 className="insights-title">
              {t("statistics.insights")}
            </h3>
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-label">
                  {t("statistics.activePercentage")}
                </div>
                <div className="insight-value">
                  {((displayStatistics.active / displayStatistics.total) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">
                  {t("statistics.inactivePercentage")}
                </div>
                <div className="insight-value">
                  {((displayStatistics.inactive / displayStatistics.total) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">
                  {t("statistics.averageOrder")}
                </div>
                <div className="insight-value">
                  {displayStatistics.total > 0 
                    ? Math.round(displayStatistics.total / 2) 
                    : 0}
                </div>
              </div>
            </div>
          </Tile>
        </div>
      )}
    </div>
  );
};


