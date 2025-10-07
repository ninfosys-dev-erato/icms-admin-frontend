"use client";

import React from "react";
import { Tile, SkeletonPlaceholder } from "@carbon/react";
import { useTranslations } from "next-intl";
import { SliderStatistics as SliderStatisticsType } from "../types/slider";

import { Slider } from "../types/slider";

interface SliderStatisticsProps {
  sliders?: Slider[];
  statistics?: SliderStatisticsType | null;
  loading?: boolean;
}

export const SliderStatistics: React.FC<SliderStatisticsProps> = ({
  sliders = [],
  statistics,
  loading = false,
}) => {
  const t = useTranslations("sliders");

  // Calculate statistics from sliders if not provided
  const calculatedStatistics = statistics || {
    total: sliders.length,
    active: sliders.filter((s) => s.isActive).length,
    published: sliders.filter((s) => s.isPublished || false).length,
    totalViews: sliders.reduce((sum, s) => sum + ((s as any).views || 0), 0),
    totalClicks: sliders.reduce((sum, s) => sum + ((s as any).clicks || 0), 0),
    averageClickThroughRate:
      sliders.length > 0
        ? (sliders.reduce((sum, s) => sum + ((s as any).clicks || 0), 0) /
            sliders.reduce((sum, s) => sum + ((s as any).views || 0), 1)) *
          100
        : 0,
    byPosition: {},
  };

  if (loading || !calculatedStatistics) {
    return (
      <div className="slider-statistics slider-statistics-loading">
        <div className="statistics-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      value: calculatedStatistics.total,
      description: t("statistics.totalDescription"),
    },
    {
      key: "active",
      label: t("statistics.active"),
      value: calculatedStatistics.active,
      description: t("statistics.activeDescription"),
    },
    {
      key: "published",
      label: t("statistics.published"),
      value: calculatedStatistics.published,
      description: t("statistics.publishedDescription"),
    },
    {
      key: "totalViews",
      label: t("statistics.totalViews"),
      value: calculatedStatistics.totalViews.toLocaleString(),
      description: t("statistics.totalViewsDescription"),
    },
    {
      key: "totalClicks",
      label: t("statistics.totalClicks"),
      value: calculatedStatistics.totalClicks.toLocaleString(),
      description: t("statistics.totalClicksDescription"),
    },
    {
      key: "averageCtr",
      label: t("statistics.averageCtr"),
      value: `${calculatedStatistics.averageClickThroughRate.toFixed(2)}%`,
      description: t("statistics.averageCtrDescription"),
    },
  ];

  return (
    <div className="slider-statistics">
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
              <div className="statistic-value">{item.value}</div>
              <div className="statistic-label">{item.label}</div>
              <div className="statistic-description text-secondary">
                {item.description}
              </div>
            </div>
          </Tile>
        ))}
      </div>

      {/* Position Breakdown */}
      {Object.keys(calculatedStatistics.byPosition).length > 0 && (
        <div className="position-breakdown">
          <Tile className="breakdown-tile">
            <h3 className="breakdown-title">
              {t("statistics.byPosition")}
            </h3>
            <div className="position-grid">
              {Object.entries(calculatedStatistics.byPosition).map(
                ([position, count]) => (
                  <div key={position} className="position-item">
                    <div className="position-number">
                      {t("statistics.position")} {position}
                    </div>
                    <div className="position-count">
                      {count} {t("statistics.sliders")}
                    </div>
                  </div>
                )
              )}
            </div>
          </Tile>
        </div>
      )}
    </div>
  );
};
