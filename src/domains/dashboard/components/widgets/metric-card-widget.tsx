'use client';

import React from 'react';
import { Tile, Tag, SkeletonText } from '@carbon/react';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import { safeErrorToString } from '@/shared/utils/error-utils';
import { MetricCardData } from '@/types/dashboard';
import '@/domains/dashboard/styles/metric-card-widget.css';

interface MetricCardWidgetProps {
  data: MetricCardData;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onClick?: () => void;
  showTrend?: boolean;
  showSubtitle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const MetricCardWidget: React.FC<MetricCardWidgetProps> = ({
  data,
  loading = false,
  error = null,
  className = '',
  onClick,
  showTrend = true,
  showSubtitle = true,
  size = 'medium',
}) => {
  const { isNepali } = useLanguageFont();

  // Handle click events
  const handleClick = () => {
    if (onClick && !loading && !error) {
      onClick();
    }
  };

  // Get trend color and icon
  const getTrendDisplay = () => {
    if (!data.trend || !showTrend) return null;

    const isPositive = data.trend.includes('+');
    const isNegative = data.trend.includes('-');
    
    let type: 'green' | 'red' | 'blue' = 'blue';
    if (isPositive) type = 'green';
    else if (isNegative) type = 'red';

    return (
      <Tag type={type} size="sm" className="metric-trend-tag">
        {data.trend}
      </Tag>
    );
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'metric-card-small';
      case 'large':
        return 'metric-card-large';
      default:
        return 'metric-card-medium';
    }
  };

  // Get icon color
  const getIconColor = () => {
    if (data.color) return data.color;
    
    // Default color based on trend
    if (data.trend?.includes('+')) return 'var(--cds-support-success)';
    if (data.trend?.includes('-')) return 'var(--cds-support-error)';
    return 'var(--cds-interactive-01)';
  };

  if (loading) {
    return (
      <Tile className={`metric-card-widget ${getSizeClasses()} ${className} metric-card-loading`}>
        <div className="metric-card-content">
          <div className="metric-card-icon">
            <SkeletonText width="2rem" />
          </div>
          <div className="metric-card-info">
            <SkeletonText width="60%" />
            <SkeletonText width="40%" />
            {showSubtitle && <SkeletonText width="80%" />}
          </div>
        </div>
      </Tile>
    );
  }

  if (error) {
    return (
      <Tile className={`metric-card-widget ${getSizeClasses()} ${className} metric-card-error`}>
        <div className="metric-card-content">
          <div className="metric-card-icon">
            <div className="metric-icon-error">!</div>
          </div>
          <div className="metric-card-info">
            <h3 className="metric-card-title">
              {isNepali ? 'त्रुटि' : 'Error'}
            </h3>
            <p className="metric-card-error-text">{safeErrorToString(error)}</p>
          </div>
        </div>
      </Tile>
    );
  }

  return (
    <Tile 
      className={`metric-card-widget ${getSizeClasses()} ${className} ${onClick ? 'metric-card-clickable' : ''}`}
      onClick={handleClick}
    >
      <div className="metric-card-content">
        {/* Icon */}
        <div 
          className="metric-card-icon"
          style={{ color: getIconColor() }}
        >
          {React.createElement(data.icon, { 
            size: size === 'large' ? 32 : size === 'small' ? 20 : 24 
          })}
        </div>

        {/* Content */}
        <div className="metric-card-info">
          {/* Title */}
          <h3 className="metric-card-title">
            {data.title}
          </h3>

          {/* Value */}
          <div className="metric-card-value">
            <span className="metric-value-number">
              {typeof data.value === 'number' 
                ? data.value.toLocaleString() 
                : data.value
              }
            </span>
            
            {/* Trend */}
            {showTrend && getTrendDisplay()}
          </div>

          {/* Subtitle */}
          {showSubtitle && data.subtitle && (
            <p className="metric-card-subtitle">
              {data.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Click indicator */}
      {onClick && (
        <div className="metric-card-click-indicator">
          <div className="click-arrow">→</div>
        </div>
      )}
    </Tile>
  );
};

// ========================================
// COMPOSITE METRIC CARDS
// ========================================

interface CompositeMetricCardProps {
  title: string;
  metrics: MetricCardData[];
  loading?: boolean;
  error?: string | null;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const CompositeMetricCard: React.FC<CompositeMetricCardProps> = ({
  title,
  metrics,
  loading = false,
  error = null,
  layout = 'horizontal',
  className = '',
}) => {
  const { isNepali } = useLanguageFont();

  if (loading) {
    return (
      <Tile className={`composite-metric-card ${className}`}>
        <h3 className="composite-metric-title">
          {title}
        </h3>
        <div className={`composite-metric-content composite-metric-${layout}`}>
          {metrics.map((_, index) => (
            <div key={index} className="composite-metric-skeleton">
              <SkeletonText width="100%" />
              <SkeletonText width="60%" />
            </div>
          ))}
        </div>
      </Tile>
    );
  }

  if (error) {
    return (
      <Tile className={`composite-metric-card ${className} composite-metric-error`}>
        <h3 className="composite-metric-title">
          {title}
        </h3>
        <div className="composite-metric-error-content">
          <p className="composite-metric-error-text">
            {isNepali ? 'त्रुटि:' : 'Error:'} {safeErrorToString(error)}
          </p>
        </div>
      </Tile>
    );
  }

  return (
    <Tile className={`composite-metric-card ${className}`}>
      <h3 className="composite-metric-title">
        {title}
      </h3>
      <div className={`composite-metric-content composite-metric-${layout}`}>
        {metrics.map((metric, index) => (
          <MetricCardWidget
            key={index}
            data={metric}
            size="small"
            showTrend={false}
            showSubtitle={false}
            className="composite-metric-item"
          />
        ))}
      </div>
    </Tile>
  );
};

// ========================================
// STATISTIC METRIC CARD
// ========================================

interface StatisticMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<any>;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const StatisticMetricCard: React.FC<StatisticMetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  error = null,
  className = '',
}) => {
  const { isNepali } = useLanguageFont();

  if (loading) {
    return (
      <Tile className={`statistic-metric-card ${className}`}>
        <div className="statistic-metric-content">
          {icon && (
            <div className="statistic-metric-icon">
              <SkeletonText width="2rem" />
            </div>
          )}
          <div className="statistic-metric-info">
            <SkeletonText width="80%" />
            <SkeletonText width="60%" />
          </div>
        </div>
      </Tile>
    );
  }

  if (error) {
    return (
      <Tile className={`statistic-metric-card ${className} statistic-metric-error`}>
        <div className="statistic-metric-content">
          <div className="statistic-metric-info">
            <h3 className="statistic-metric-title">
              {isNepali ? 'त्रुटि' : 'Error'}
            </h3>
            <p className="statistic-metric-error-text">{safeErrorToString(error)}</p>
          </div>
        </div>
      </Tile>
    );
  }

  const getChangeTagType = () => {
    switch (changeType) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Tile className={`statistic-metric-card ${className}`}>
      <div className="statistic-metric-content">
        {icon && (
          <div className="statistic-metric-icon">
            {React.createElement(icon, { size: 24 })}
          </div>
        )}
        
        <div className="statistic-metric-info">
          <h3 className="statistic-metric-title">
            {title}
          </h3>
          
          <div className="statistic-metric-value">
            <span className="statistic-value-number">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="statistic-value-unit">{unit}</span>}
          </div>
          
          {change && (
            <div className="statistic-metric-change">
              <Tag type={getChangeTagType()} size="sm">
                {change}
              </Tag>
            </div>
          )}
        </div>
      </div>
    </Tile>
  );
};
