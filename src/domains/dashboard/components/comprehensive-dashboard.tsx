
'use client';

import React, { useEffect } from 'react';
import { Grid, Column, Tile, SkeletonText, Button, Tag, Breadcrumb, BreadcrumbItem, Layer } from '@carbon/react';
import { PageHeader } from '@carbon/ibm-products';
import {
  UserAvatar,
  Document,
  Image,
  Building,
  ChartLine,
  Checkmark,
  Warning,
  Error,
  Information,
} from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import { safeErrorToString } from '@/shared/utils/error-utils';
import { DashboardProvider, useDashboardContext } from '../contexts/dashboard-context';
import { DashboardHeader } from './dashboard-header';
import { MetricCardWidget, CompositeMetricCard, StatisticMetricCard } from './widgets/metric-card-widget';
import { useComprehensiveDashboard } from '../hooks/use-dashboard-queries';
import { MetricCardData } from '@/types/dashboard';
import '@/domains/dashboard/styles/comprehensive-dashboard.css';

// ========================================
// DASHBOARD CONTENT COMPONENT
// ========================================

const DashboardContent: React.FC = () => {
  const t = useTranslations();

  return (
    <Layer className="dashboard-container">
      <div style={{ padding: '2rem 1rem 1rem 1rem' }}>
        <Breadcrumb noTrailingSlash style={{ marginBottom: '1.5rem' }}>
          <BreadcrumbItem href="#">{t('breadcrumbs.home', { defaultMessage: 'Home' })}</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Dashboard</BreadcrumbItem>
        </Breadcrumb>

        <h1 style={{ marginBottom: '2rem' }}>
          Dashboard
        </h1>
        <p>This is the dashboard content area.</p>

        {/* Add your Dashboard content here */}
      </div>
    </Layer>
  );
};

// ========================================
// MAIN DASHBOARD COMPONENT
// ========================================

interface ComprehensiveDashboardProps {
  className?: string;
}

export const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ className = '' }) => {
  return (
    <DashboardProvider>
      <div className={`comprehensive-dashboard-container ${className}`}>
        <DashboardContent />
      </div>
    </DashboardProvider>
  );
};
