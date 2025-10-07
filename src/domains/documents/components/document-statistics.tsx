"use client";

import React from "react";
import "../styles/documents.css";
import { Tile, SkeletonPlaceholder } from "@carbon/react";
import { useTranslations } from "next-intl";
import { useDocumentStatistics } from "../hooks/use-document-queries";
import { DocumentStatistics as DocumentStatisticsType } from "../types/document";

interface DocumentStatisticsProps {
  statistics?: DocumentStatisticsType | null;
  loading?: boolean;
}

export const DocumentStatistics: React.FC<DocumentStatisticsProps> = ({
  statistics: propStatistics,
  loading = false,
}) => {
  const t = useTranslations("documents");
  const { data: queryStatistics, isLoading: queryLoading } =
    useDocumentStatistics();

  const statistics = propStatistics || queryStatistics;
  const isLoading = loading || queryLoading;

  if (isLoading || !statistics) {
    return (
      <div className="document-statistics loading">
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
      value: statistics.total,
      description: t("statistics.totalDescription"),
    },
    {
      key: "published",
      label: t("statistics.published"),
      value: statistics.published,
      description: t("statistics.publishedDescription"),
    },
    {
      key: "draft",
      label: t("statistics.draft"),
      value: statistics.draft,
      description: t("statistics.draftDescription"),
    },
    {
      key: "archived",
      label: t("statistics.archived"),
      value: statistics.archived,
      description: t("statistics.archivedDescription"),
    },
    {
      key: "totalDownloads",
      label: t("statistics.totalDownloads"),
      value: statistics.totalDownloads.toLocaleString(),
      description: t("statistics.totalDownloadsDescription"),
    },
    {
      key: "averageDownloads",
      label: t("statistics.averageDownloads"),
      value: Math.round(
        statistics.averageDownloadsPerDocument
      ).toLocaleString(),
      description: t("statistics.averageDownloadsDescription"),
    },
  ];

  return (
    <div className="document-statistics">
      <div className="statistics-header">
        <h2>{t("statistics.title")}</h2>
        <p className="text-secondary">{t("statistics.subtitle")}</p>
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

      {/* Document Type Breakdown */}
      {Object.keys(statistics.byType).length > 0 && (
        <div className="type-breakdown">
          <Tile className="breakdown-tile">
            <h3 className="breakdown-title">{t("statistics.byType")}</h3>
            <div className="type-grid">
              {Object.entries(statistics.byType)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                  <div key={type} className="type-item">
                    <div className="type-icon">
                      {type === "PDF" && "📄"}
                      {type === "DOC" && "📝"}
                      {type === "DOCX" && "📝"}
                      {type === "XLS" && "📊"}
                      {type === "XLSX" && "📊"}
                      {type === "PPT" && "📽️"}
                      {type === "PPTX" && "📽️"}
                      {type === "TXT" && "📃"}
                      {type === "CSV" && "📋"}
                      {type === "ZIP" && "📦"}
                      {type === "RAR" && "📦"}
                      {type === "OTHER" && "📎"}
                    </div>
                    <div className="type-info">
                      <div className="type-name">{type}</div>
                      <div className="type-count">
                        {count} {t("statistics.documents")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Tile>
        </div>
      )}

      {/* Document Category Breakdown */}
      {Object.keys(statistics.byCategory).length > 0 && (
        <div className="category-breakdown">
          <Tile className="breakdown-tile">
            <h3 className="breakdown-title">{t("statistics.byCategory")}</h3>
            <div className="category-grid">
              {Object.entries(statistics.byCategory)
                .filter(([_, count]) => count > 0)
                .map(([category, count]) => (
                  <div key={category} className="category-item">
                    <div className="category-name">
                      {t(`categories.${category.toLowerCase()}`)}
                    </div>
                    <div className="category-count">
                      {count} {t("statistics.documents")}
                    </div>
                  </div>
                ))}
            </div>
          </Tile>
        </div>
      )}

      {/* Storage Information */}
      <div className="storage-info">
        <Tile className="storage-tile">
          <h3 className="storage-title">{t("statistics.storage")}</h3>
          <div className="storage-grid">
            <div className="storage-item">
              <div className="storage-label">{t("statistics.totalSize")}</div>
              <div className="storage-value">
                {formatBytes(statistics.totalSize)}
              </div>
            </div>
            <div className="storage-item">
              <div className="storage-label">{t("statistics.averageSize")}</div>
              <div className="storage-value">
                {formatBytes(statistics.averageSize)}
              </div>
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
};

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
