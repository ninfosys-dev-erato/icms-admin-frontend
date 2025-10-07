"use client";

import React from "react";
import { Tile, SkeletonPlaceholder } from "@carbon/react";
import { useUserStatistics } from "../hooks/use-user-queries";

export const UserAnalytics: React.FC = () => {
  const { data, isLoading } = useUserStatistics();

  if (isLoading || !data) {
    return (
      <div className="slider-statistics loading">
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

  const items = [
    { key: "total", label: "Total Users", value: data.total },
    { key: "active", label: "Active", value: data.active },
    { key: "inactive", label: "Inactive", value: data.inactive },
    { key: "pending", label: "Pending", value: data.pending },
  ];

  return (
    <div className="slider-statistics">
      <div className="statistics-grid">
        {items.map((item) => (
          <Tile key={item.key} className="statistic-tile">
            <div className="statistic-content">
              <div className="statistic-value">{item.value}</div>
              <div className="statistic-label">{item.label}</div>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};
