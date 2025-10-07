"use client";

import { SkeletonPlaceholder, Tile } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import "../styles/content-management.css";
import { ContentStatistics as ContentStatisticsType } from "../types/content";

interface ContentStatisticsProps {
  statistics?: ContentStatisticsType | null;
  loading?: boolean;
}

export const ContentStatistics: React.FC<ContentStatisticsProps> = ({
  statistics,
  loading = false,
}) => {
  const t = useTranslations("content-management");
  // TODO: Implement loadContentStatistics in the store or use a different approach
  // const { loadContentStatistics } = useContentStore();

  // Load statistics when component mounts
  useEffect(() => {
    // TODO: Implement statistics loading
    // loadContentStatistics();
  }, []);

  // Mock statistics for demonstration - replace with actual data from store
  const mockStatistics: ContentStatisticsType = {
    total: 25,
    published: 18,
    draft: 5,
    archived: 2,
    scheduled: 0,
    byCategory: {
      "general": 10,
      "tutorials": 8,
      "news": 7
    },
    byStatus: {
      "DRAFT": 5,
      "PUBLISHED": 18,
      "ARCHIVED": 2,
    },
    byVisibility: {
      "public": 20,
      "private": 3,
      "role-based": 2
    },
    totalViews: 1250,
    totalLikes: 89,
    totalShares: 45,
    averageViewsPerContent: 50,
    topViewedContent: [
      { id: "1", title: "Welcome to iCMS", views: 150 },
      { id: "2", title: "Getting Started Guide", views: 120 },
      { id: "3", title: "Advanced Features", views: 95 }
    ],
    recentActivity: [
      { id: "1", action: "published", timestamp: "2024-01-15T10:30:00Z" },
      { id: "2", action: "updated", timestamp: "2024-01-14T15:45:00Z" },
      { id: "3", action: "created", timestamp: "2024-01-13T09:20:00Z" }
    ]
  };

  const displayStatistics = statistics || mockStatistics;

  if (loading) {
    return (
      <div className="content-statistics loading">
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
      value: displayStatistics.total,
      description: t("statistics.totalDescription"),
      color: "blue"
    },
    {
      key: "published",
      label: t("statistics.published"),
      value: displayStatistics.published,
      description: t("statistics.publishedDescription"),
      color: "green"
    },
    {
      key: "draft",
      label: t("statistics.draft"),
      value: displayStatistics.draft,
      description: t("statistics.draftDescription"),
      color: "blue"
    },
    {
      key: "archived",
      label: t("statistics.archived"),
      value: displayStatistics.archived,
      description: t("statistics.archivedDescription"),
      color: "gray"
    },
    {
      key: "totalViews",
      label: t("statistics.totalViews"),
      value: displayStatistics.totalViews.toLocaleString(),
      description: t("statistics.totalViewsDescription"),
      color: "purple"
    },
    {
      key: "averageViews",
      label: t("statistics.averageViews"),
      value: displayStatistics.averageViewsPerContent.toLocaleString(),
      description: t("statistics.averageViewsDescription"),
      color: "teal"
    }
  ];

  return (
    <div className="content-statistics">
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
              <div className={`statistic-value statistic-value--${item.color}`}>
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

      {/* Category Breakdown */}
      {Object.keys(displayStatistics.byCategory).length > 0 && (
        <div className="category-breakdown">
          <Tile className="breakdown-tile">
            <h3 className="breakdown-title">
              {t("statistics.byCategory")}
            </h3>
            <div className="category-grid">
              {Object.entries(displayStatistics.byCategory).map(
                ([category, count]) => (
                  <div key={category} className="category-item">
                    <div className="category-name">
                      {t(`categories.${category}`) || category}
                    </div>
                    <div className="category-count">
                      {count} {t("statistics.content")}
                    </div>
                  </div>
                )
              )}
            </div>
          </Tile>
        </div>
      )}

      {/* Top Viewed Content */}
      {displayStatistics.topViewedContent.length > 0 && (
        <div className="top-content">
          <Tile className="top-content-tile">
            <h3 className="breakdown-title">
              {t("statistics.topViewedContent")}
            </h3>
            <div className="top-content-list">
              {displayStatistics.topViewedContent.map((content, index) => (
                <div key={content.id} className="top-content-item">
                  <div className="content-rank">#{index + 1}</div>
                  <div className="content-title">{content.title}</div>
                  <div className="content-views">{content.views} {t("statistics.views")}</div>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      )}

      {/* Recent Activity */}
      {displayStatistics.recentActivity.length > 0 && (
        <div className="recent-activity">
          <Tile className="activity-tile">
            <h3 className="breakdown-title">
              {t("statistics.recentActivity")}
            </h3>
            <div className="activity-list">
              {displayStatistics.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-action">
                    {t(`activity.${activity.action}`)}
                  </div>
                  <div className="activity-time">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      )}
    </div>
  );
}; 