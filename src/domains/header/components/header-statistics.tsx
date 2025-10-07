"use client";

import React from "react";
import { 
  Tile, 
  Stack, 
  Grid, 
  Column,
  ProgressBar,
  Tag
} from "@carbon/react";
import { 
  ChartLine, 
  View, 
  Edit, 
  TrashCan,
  Checkmark,
  Close
} from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { HeaderStatistics as HeaderStatisticsType, HeaderAlignment } from "../types/header";

interface HeaderStatisticsProps {
  statistics?: HeaderStatisticsType | null;
  loading?: boolean;
  className?: string;
}

export const HeaderStatistics: React.FC<HeaderStatisticsProps> = ({
  statistics,
  loading = false,
  className = "",
}) => {
  const t = useTranslations("headers");

  if (loading) {
    return (
      <div className={`header-statistics ${className}`}>
        <h3 className="form-section-title">{t('statistics.title') || 'Header Statistics'}</h3>
        <div className="loading-container">
          <div>Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={`header-statistics ${className}`}>
        <h3 className="form-section-title">{t('statistics.title') || 'Header Statistics'}</h3>
        <div className="empty-state">
          <div className="empty-state-content">
            <ChartLine size={32} className="empty-state-icon" />
            <h4 className="empty-state-title">
              {t('statistics.noData') || 'No Statistics Available'}
            </h4>
            <p className="empty-state-description">
              {t('statistics.noDataDescription') || 'Statistics will appear here once you have headers configured.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getAlignmentColor = (alignment: HeaderAlignment) => {
    switch (alignment) {
      case HeaderAlignment.LEFT:
        return 'blue';
      case HeaderAlignment.CENTER:
        return 'green';
      case HeaderAlignment.RIGHT:
        return 'purple';
      case HeaderAlignment.JUSTIFY:
        return 'warm-gray';
      default:
        return 'gray';
    }
  };

  const getAlignmentIcon = (alignment: HeaderAlignment) => {
    switch (alignment) {
      case HeaderAlignment.LEFT:
        return '←';
      case HeaderAlignment.CENTER:
        return '↔';
      case HeaderAlignment.RIGHT:
        return '→';
      case HeaderAlignment.JUSTIFY:
        return '↔↔';
      default:
        return '?';
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getStatusTag = (isActive: boolean, isPublished: boolean) => {
    if (isPublished) {
      return <Tag type="green" size="sm">Published</Tag>;
    }
    if (isActive) {
      return <Tag type="blue" size="sm">Active</Tag>;
    }
    return <Tag type="red" size="sm">Inactive</Tag>;
  };

  return (
    <div className={`header-statistics ${className}`}>
      <h3 className="form-section-title">{t('statistics.title') || 'Header Statistics'}</h3>
      <p className="form-section-description">
        {t('statistics.description') || 'Overview of your header configurations and usage statistics.'}
      </p>

      <div className="statistics-grid">
        {/* Total Headers */}
        <Grid narrow>
          <Column lg={3} md={6} sm={4}>
            <Tile className="statistic-tile">
              <div className="statistic-value">{statistics.total}</div>
              <div className="statistic-label">
                {t('statistics.totalHeaders') || 'Total Headers'}
              </div>
              <div className="statistic-description">
                {t('statistics.totalHeadersDescription') || 'All configured headers'}
              </div>
            </Tile>
          </Column>

          {/* Active Headers */}
          <Column lg={3} md={6} sm={4}>
            <Tile className="statistic-tile">
              <div className="statistic-value" style={{ color: 'var(--cds-interactive-01)' }}>
                {statistics.active}
              </div>
              <div className="statistic-label">
                {t('statistics.activeHeaders') || 'Active Headers'}
              </div>
              <div className="statistic-description">
                {t('statistics.activeHeadersDescription') || 'Currently enabled headers'}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <ProgressBar
                  value={calculatePercentage(statistics.active, statistics.total)}
                  size="small"
                  label={`${calculatePercentage(statistics.active, statistics.total)}% Active`}
                />
              </div>
            </Tile>
          </Column>

          {/* Published Headers */}
          <Column lg={3} md={6} sm={4}>
            <Tile className="statistic-tile">
              <div className="statistic-value" style={{ color: 'var(--cds-support-success)' }}>
                {statistics.published}
              </div>
              <div className="statistic-label">
                {t('statistics.publishedHeaders') || 'Published Headers'}
              </div>
              <div className="statistic-description">
                {t('statistics.publishedHeadersDescription') || 'Live on website'}
                <div style={{ marginTop: '0.5rem' }}>
                  <ProgressBar
                    value={calculatePercentage(statistics.published, statistics.total)}
                    size="small"
                    label={`${calculatePercentage(statistics.published, statistics.total)}% Published`}
                  />
                </div>
              </div>
            </Tile>
          </Column>

          {/* Average Order */}
          <Column lg={3} md={6} sm={4}>
            <Tile className="statistic-tile">
              <div className="statistic-value" style={{ color: 'var(--cds-interactive-02)' }}>
                {statistics.averageOrder.toFixed(1)}
              </div>
              <div className="statistic-label">
                {t('statistics.averageOrder') || 'Average Order'}
              </div>
              <div className="statistic-description">
                {t('statistics.averageOrderDescription') || 'Mean position value'}
              </div>
            </Tile>
          </Column>
        </Grid>

        {/* Alignment Distribution */}
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--cds-text-01)' }}>
            {t('statistics.alignmentDistribution') || 'Alignment Distribution'}
          </h4>
          <Grid narrow>
            {Object.entries(statistics.byAlignment).map(([alignment, count]) => (
              <Column key={alignment} lg={3} md={6} sm={4}>
                <Tile style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--cds-ui-03)', 
                  borderRadius: '0',
                  backgroundColor: 'var(--cds-ui-01)'
                }}>
                  <Stack gap={3}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'var(--cds-interactive-01)'
                    }}>
                      <span>{getAlignmentIcon(alignment as HeaderAlignment)}</span>
                      <span>{count}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                      <ProgressBar
                        value={calculatePercentage(count, statistics.total)}
                        size="small"
                        label={`${calculatePercentage(count, statistics.total)}%`}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-02)' }}>
                        {calculatePercentage(count, statistics.total)}% of total
                      </div>
                    </div>
                  </Stack>
                </Tile>
              </Column>
            ))}
          </Grid>
        </div>

        {/* Quick Actions Summary */}
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--cds-text-01)' }}>
            {t('statistics.quickActions') || 'Quick Actions'}
          </h4>
          <Grid narrow>
            <Column lg={3} md={6} sm={4}>
              <Tile style={{ 
                padding: '1rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)',
                textAlign: 'center'
              }}>
                <View size={24} style={{ marginBottom: '0.5rem', color: 'var(--cds-interactive-01)' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                  {t('statistics.viewHeaders') || 'View All Headers'}
                </div>
              </Tile>
            </Column>
            <Column lg={3} md={6} sm={4}>
              <Tile style={{ 
                padding: '1rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)',
                textAlign: 'center'
              }}>
                <Edit size={24} style={{ marginBottom: '0.5rem', color: 'var(--cds-interactive-02)' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                  {t('statistics.editHeaders') || 'Edit Headers'}
                </div>
              </Tile>
            </Column>
            <Column lg={3} md={6} sm={4}>
              <Tile style={{ 
                padding: '1rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)',
                textAlign: 'center'
              }}>
                <Checkmark size={24} style={{ marginBottom: '0.5rem', color: 'var(--cds-support-success)' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                  {t('statistics.publishHeaders') || 'Publish Headers'}
                </div>
              </Tile>
            </Column>
            <Column lg={3} md={6} sm={4}>
              <Tile style={{ 
                padding: '1rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)',
                textAlign: 'center'
              }}>
                <TrashCan size={24} style={{ marginBottom: '0.5rem', color: 'var(--cds-support-error)' }} />
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                  {t('statistics.deleteHeaders') || 'Delete Headers'}
                </div>
              </Tile>
            </Column>
          </Grid>
        </div>

        {/* Status Summary */}
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--cds-text-01)' }}>
            {t('statistics.statusSummary') || 'Status Summary'}
          </h4>
          <Grid narrow>
            <Column lg={4} md={8} sm={4}>
              <Tile style={{ 
                padding: '1.5rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)'
              }}>
                <Stack gap={4}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Checkmark size={16} style={{ color: 'var(--cds-support-success)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                      {t('statistics.published') || 'Published'}: {statistics.published}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <View size={16} style={{ color: 'var(--cds-interactive-01)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                      {t('statistics.active') || 'Active'}: {statistics.active}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Close size={16} style={{ color: 'var(--cds-support-error)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                      {t('statistics.inactive') || 'Inactive'}: {statistics.total - statistics.active}
                    </span>
                  </div>
                </Stack>
              </Tile>
            </Column>
            <Column lg={8} md={8} sm={4}>
              <Tile style={{ 
                padding: '1.5rem', 
                border: '1px solid var(--cds-ui-03)', 
                borderRadius: '0',
                backgroundColor: 'var(--cds-ui-01)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-01)' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>{t('statistics.insights') || 'Insights'}:</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>
                      {t('statistics.insight1') || `${calculatePercentage(statistics.published, statistics.total)}% of headers are live on the website`}
                    </li>
                    <li>
                      {t('statistics.insight2') || `${calculatePercentage(statistics.active, statistics.total)}% of headers are currently enabled`}
                    </li>
                    <li>
                      {t('statistics.insight3') || `Average header order is ${statistics.averageOrder.toFixed(1)}`}
                    </li>
                  </ul>
                </div>
              </Tile>
            </Column>
          </Grid>
        </div>
      </div>
    </div>
  );
};
