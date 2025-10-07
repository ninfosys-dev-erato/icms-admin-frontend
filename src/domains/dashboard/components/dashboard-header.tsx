'use client';

import React, { useState } from 'react';
import {
  Grid,
  Column,
  Button,
  ButtonSet,
  Dropdown,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  Toggle,
  Tooltip,
  SkeletonText,
} from '@carbon/react';
import { PageHeader } from '@carbon/ibm-products';
import {
  Download,
  Repeat,
  Settings,
  Filter,
  Calendar,
  ChartLine,
  View,
} from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import { useDashboardContext } from '../contexts/dashboard-context';
import { useExportDashboard, useRefreshDashboard } from '../hooks/use-dashboard-queries';
import { DashboardFilters } from '@/types/dashboard';
import { DashboardSettings } from './dashboard-settings';
import '@/domains/dashboard/styles/dashboard-header.css';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  showSettings?: boolean;
  onFiltersChange?: (filters: DashboardFilters) => void;
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
  onRefresh?: () => void;
  onSettings?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  showSettings = true,
  onFiltersChange,
  onExport,
  onRefresh,
  onSettings,
}) => {
  const t = useTranslations();
  const { isNepali } = useLanguageFont();
  const { filters, updateFilters, resetFilters } = useDashboardContext();
  const { state } = useDashboardContext();
  
  const exportMutation = useExportDashboard();
  const refreshMutation = useRefreshDashboard();
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Default title and subtitle
  const defaultTitle = isNepali ? 'ड्यासबोर्ड' : 'Dashboard';
  const defaultSubtitle = isNepali 
    ? 'आफ्नो iCMS प्रणालीको सामान्य अवलोकन र प्रबन्धन'
    : 'Overview and management of your iCMS system';

  // Handle filter changes
  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle date range changes
  const handleDateRangeChange = (type: 'from' | 'to', value: Date | null) => {
    const newDateRange = { ...filters.dateRange, [type]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    updateFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle export
  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format);
      return;
    }

    setIsExporting(true);
    try {
      await exportMutation.mutateAsync({
        query: {
          dateFrom: filters.dateRange.from,
          dateTo: filters.dateRange.to,
          category: filters.category,
          granularity: filters.granularity,
          includeTrends: filters.includeTrends,
        },
        format,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    refreshMutation.mutate({
      dateFrom: filters.dateRange.from,
      dateTo: filters.dateRange.to,
      category: filters.category,
      granularity: filters.granularity,
      includeTrends: filters.includeTrends,
    });
  };

  // Format last updated time
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return isNepali ? 'अहिले' : 'Just now';
    if (diffInMinutes < 60) return isNepali ? `${diffInMinutes} मिनेट अघि` : `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return isNepali ? `${diffInHours} घन्टा अघि` : `${diffInHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-header">
      {/* Page Header */}
      <PageHeader
        title={title || defaultTitle}
        subtitle={subtitle || defaultSubtitle}
        fullWidthGrid
        narrowGrid
      />

      {/* Controls and Filters */}
      <div className="dashboard-header-controls">
        <Grid>
          {/* Left side - Filters */}
          <Column lg={8} md={4} sm={4}>
            {showFilters && (
              <div className="dashboard-filters">
                <div className="dashboard-filters-basic">
                  {/* Category Filter */}
                  <Select
                    id="category-filter"
                    labelText={isNepali ? 'श्रेणी' : 'Category'}
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="dashboard-filter-select"
                  >
                    <SelectItem value="all" text={isNepali ? 'सबै' : 'All'} />
                    <SelectItem value="system" text={isNepali ? 'प्रणाली' : 'System'} />
                    <SelectItem value="content" text={isNepali ? 'सामग्री' : 'Content'} />
                    <SelectItem value="users" text={isNepali ? 'प्रयोगकर्ताहरू' : 'Users'} />
                    <SelectItem value="hr" text={isNepali ? 'मानव संसाधन' : 'HR'} />
                    <SelectItem value="marketing" text={isNepali ? 'मार्केटिङ' : 'Marketing'} />
                  </Select>

                  {/* Granularity Filter */}
                  <Select
                    id="granularity-filter"
                    labelText={isNepali ? 'समय सीमा' : 'Time Range'}
                    value={filters.granularity}
                    onChange={(e) => handleFilterChange('granularity', e.target.value)}
                    className="dashboard-filter-select"
                  >
                    <SelectItem value="hourly" text={isNepali ? 'घन्टाको' : 'Hourly'} />
                    <SelectItem value="daily" text={isNepali ? 'दैनिक' : 'Daily'} />
                    <SelectItem value="weekly" text={isNepali ? 'साप्ताहिक' : 'Weekly'} />
                    <SelectItem value="monthly" text={isNepali ? 'मासिक' : 'Monthly'} />
                  </Select>

                  {/* Advanced Filters Toggle */}
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Filter}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="dashboard-filter-toggle"
                  >
                    {isNepali ? 'अधिक फिल्टरहरू' : 'More Filters'}
                  </Button>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="dashboard-filters-advanced">
                    <Grid>
                      <Column lg={6} md={4} sm={4}>
                        {/* Date Range */}
                        <div className="dashboard-date-range">
                          <DatePicker
                            dateFormat="Y-m-d"
                            datePickerType="range"
                            onChange={(dates) => {
                              if (dates && dates.length === 2) {
                                handleDateRangeChange('from', dates[0] || null);
                                handleDateRangeChange('to', dates[1] || null);
                              }
                            }}
                          >
                            <DatePickerInput
                              id="date-picker-from"
                              labelText={isNepali ? 'सुरुवात मिति' : 'Start Date'}
                              placeholder="YYYY-MM-DD"
                              size="sm"
                            />
                            <DatePickerInput
                              id="date-picker-to"
                              labelText={isNepali ? 'अन्तिम मिति' : 'End Date'}
                              placeholder="YYYY-MM-DD"
                              size="sm"
                            />
                          </DatePicker>
                        </div>
                      </Column>

                      <Column lg={6} md={4} sm={4}>
                        {/* Trends Toggle */}
                        <div className="dashboard-trends-toggle">
                          <Toggle
                            id="trends-toggle"
                            labelText={isNepali ? 'ट्रेन्डहरू समावेश गर्नुहोस्' : 'Include Trends'}
                            labelA={isNepali ? 'होइन' : 'No'}
                            labelB={isNepali ? 'हो' : 'Yes'}
                            toggled={filters.includeTrends}
                            onChange={(checked) => handleFilterChange('includeTrends', checked)}
                            size="sm"
                          />
                        </div>

                        {/* Reset Filters */}
                        <Button
                          kind="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="dashboard-reset-filters"
                        >
                          {isNepali ? 'फिल्टरहरू रिसेट गर्नुहोस्' : 'Reset Filters'}
                        </Button>
                      </Column>
                    </Grid>
                  </div>
                )}
              </div>
            )}
          </Column>

          {/* Right side - Actions */}
          <Column lg={4} md={4} sm={4}>
            <div className="dashboard-actions">
              <ButtonSet>
                {/* Export Button */}
                {showExport && (
                  <Dropdown
                    id="export-dropdown"
                    titleText={isNepali ? 'निर्यात गर्नुहोस्' : 'Export'}
                    label={isNepali ? 'निर्यात गर्नुहोस्' : 'Export'}
                    items={[
                      { id: 'json', text: 'JSON' },
                      { id: 'csv', text: 'CSV' },
                      { id: 'pdf', text: 'PDF' },
                    ]}
                    itemToString={(item) => item?.text || ''}
                    onChange={(item) => {
                      if (item?.selectedItem) {
                        handleExport(item.selectedItem.id as 'json' | 'csv' | 'pdf');
                      }
                    }}
                    disabled={isExporting}
                    size="sm"
                  />
                )}

                {/* Refresh Button */}
                {showRefresh && (
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Repeat}
                    onClick={handleRefresh}
                    disabled={refreshMutation.isPending}
                    className="dashboard-refresh-btn"
                  >
                    {isNepali ? 'रिफ्रेश' : 'Refresh'}
                  </Button>
                )}

                {/* Settings Button */}
                {showSettings && (
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Settings}
                    onClick={onSettings}
                    className="dashboard-settings-btn"
                  >
                    {isNepali ? 'सेटिङहरू' : 'Settings'}
                  </Button>
                )}
              </ButtonSet>
            </div>
          </Column>
        </Grid>
      </div>

      {/* Status Bar */}
      <div className="dashboard-status-bar">
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <div className="dashboard-status-info">
              <span className="dashboard-status-label">
                {isNepali ? 'अन्तिम अपडेट:' : 'Last Updated:'}
              </span>
              <span className="dashboard-status-value">
                {state.lastUpdated ? formatLastUpdated(state.lastUpdated) : isNepali ? 'कहिल्यै' : 'Never'}
              </span>
            </div>
          </Column>

          <Column lg={6} md={4} sm={4}>
            <div className="dashboard-status-actions">
              {state.loading && (
                <div className="dashboard-loading-indicator">
                  <SkeletonText width="100px" />
                </div>
              )}
              
              {state.error && (
                <div className="dashboard-error-indicator">
                  <span className="dashboard-error-text">
                    {isNepali ? 'त्रुटि:' : 'Error:'} {state.error}
                  </span>
                </div>
              )}
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
