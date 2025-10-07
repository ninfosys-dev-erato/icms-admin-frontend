'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  TextInput,
  Select,
  SelectItem,
  Toggle,
  Slider,
  Tile,
  Grid,
  Column,
  SkeletonText,
} from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import { useDashboardContext } from '../contexts/dashboard-context';
import { useDashboardConfig, useUpdateDashboardConfig } from '../hooks/use-dashboard-queries';
import '@/domains/dashboard/styles/dashboard-settings.css';

interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  isOpen,
  onClose,
  role = 'admin',
}) => {
  const t = useTranslations();
  const { isNepali } = useLanguageFont();
  const { state, toggleAutoRefresh, updateRefreshInterval } = useDashboardContext();
  
  const { data: config, isLoading, error } = useDashboardConfig(role);
  const updateConfigMutation = useUpdateDashboardConfig();
  
  const [localConfig, setLocalConfig] = useState({
    autoRefresh: state.autoRefresh,
    refreshInterval: state.refreshInterval,
    layout: 'grid',
    showTrends: true,
    showCharts: true,
    showTables: true,
    compactMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handle form changes
  const handleConfigChange = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update local context
      if (localConfig.autoRefresh !== state.autoRefresh) {
        toggleAutoRefresh();
      }
      
      if (localConfig.refreshInterval !== state.refreshInterval) {
        updateRefreshInterval(localConfig.refreshInterval);
      }

      // Update backend config if available
      if (config) {
        await updateConfigMutation.mutateAsync({
          role,
          config: {
            autoRefresh: localConfig.autoRefresh,
            refreshInterval: localConfig.refreshInterval,
            layout: localConfig.layout as 'grid' | 'list' | 'custom',
          },
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save dashboard settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setLocalConfig({
      autoRefresh: true,
      refreshInterval: 30000,
      layout: 'grid',
      showTrends: true,
      showCharts: true,
      showTables: true,
      compactMode: false,
    });
  };

  // Format refresh interval for display
  const formatRefreshInterval = (ms: number) => {
    if (ms < 60000) return `${ms / 1000}s`;
    if (ms < 3600000) return `${ms / 60000}m`;
    return `${ms / 3600000}h`;
  };

  if (isLoading) {
    return (
      <Modal open={isOpen} onRequestClose={onClose} size="lg">
        <ModalHeader>
          <h2>{isNepali ? 'ड्यासबोर्ड सेटिङहरू' : 'Dashboard Settings'}</h2>
        </ModalHeader>
        <ModalBody>
          <div className="dashboard-settings-skeleton">
            <SkeletonText width="100%" />
            <SkeletonText width="80%" />
            <SkeletonText width="60%" />
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onRequestClose={onClose} size="lg">
      <ModalHeader>
        <h2>{isNepali ? 'ड्यासबोर्ड सेटिङहरू' : 'Dashboard Settings'}</h2>
        <p>{isNepali ? 'आफ्नो ड्यासबोर्ड अनुभव अनुकूलन गर्नुहोस्' : 'Customize your dashboard experience'}</p>
      </ModalHeader>
      
      <ModalBody>
        <Form className="dashboard-settings-form">
          {/* Auto-refresh Settings */}
          <FormGroup legendText={isNepali ? 'स्वचालित रिफ्रेश' : 'Auto-refresh'}>
            <div className="setting-item">
              <Toggle
                id="auto-refresh-toggle"
                labelText={isNepali ? 'स्वचालित रूपमा डाटा रिफ्रेश गर्नुहोस्' : 'Automatically refresh data'}
                labelA={isNepali ? 'होइन' : 'No'}
                labelB={isNepali ? 'हो' : 'Yes'}
                toggled={localConfig.autoRefresh}
                onChange={(checked) => handleConfigChange('autoRefresh', checked)}
              />
              
              {localConfig.autoRefresh && (
                <div className="refresh-interval-setting">
                  <label htmlFor="refresh-interval">
                    {isNepali ? 'रिफ्रेश अन्तराल:' : 'Refresh interval:'}
                  </label>
                  <Slider
                    id="refresh-interval"
                    min={5000}
                    max={300000}
                    step={5000}
                    value={localConfig.refreshInterval}
                    onChange={({ value }) => handleConfigChange('refreshInterval', value)}
                    labelText={formatRefreshInterval(localConfig.refreshInterval)}
                  />
                </div>
              )}
            </div>
          </FormGroup>

          {/* Layout Settings */}
          <FormGroup legendText={isNepali ? 'लेआउट सेटिङहरू' : 'Layout Settings'}>
            <div className="setting-item">
              <Select
                id="layout-select"
                labelText={isNepali ? 'ड्यासबोर्ड लेआउट' : 'Dashboard Layout'}
                value={localConfig.layout}
                onChange={(e) => handleConfigChange('layout', e.target.value)}
              >
                <SelectItem value="grid" text={isNepali ? 'ग्रिड' : 'Grid'} />
                <SelectItem value="list" text={isNepali ? 'सूची' : 'List'} />
                <SelectItem value="custom" text={isNepali ? 'कस्टम' : 'Custom'} />
              </Select>
            </div>
          </FormGroup>

          {/* Display Settings */}
          <FormGroup legendText={isNepali ? 'प्रदर्शन सेटिङहरू' : 'Display Settings'}>
            <div className="setting-item">
              <Toggle
                id="trends-toggle"
                labelText={isNepali ? 'ट्रेन्डहरू देखाउनुहोस्' : 'Show trends'}
                labelA={isNepali ? 'होइन' : 'No'}
                labelB={isNepali ? 'हो' : 'Yes'}
                toggled={localConfig.showTrends}
                onChange={(checked) => handleConfigChange('showTrends', checked)}
              />
            </div>
            
            <div className="setting-item">
              <Toggle
                id="charts-toggle"
                labelText={isNepali ? 'चार्टहरू देखाउनुहोस्' : 'Show charts'}
                labelA={isNepali ? 'होइन' : 'No'}
                labelB={isNepali ? 'हो' : 'Yes'}
                toggled={localConfig.showCharts}
                onChange={(checked) => handleConfigChange('showCharts', checked)}
              />
            </div>
            
            <div className="setting-item">
              <Toggle
                id="tables-toggle"
                labelText={isNepali ? 'तालिकाहरू देखाउनुहोस्' : 'Show tables'}
                labelA={isNepali ? 'होइन' : 'No'}
                labelB={isNepali ? 'हो' : 'Yes'}
                toggled={localConfig.showTables}
                onChange={(checked) => handleConfigChange('showTables', checked)}
              />
            </div>
            
            <div className="setting-item">
              <Toggle
                id="compact-toggle"
                labelText={isNepali ? 'कम्प्याक्ट मोड' : 'Compact mode'}
                labelA={isNepali ? 'होइन' : 'No'}
                labelB={isNepali ? 'हो' : 'Yes'}
                toggled={localConfig.compactMode}
                onChange={(checked) => handleConfigChange('compactMode', checked)}
              />
            </div>
          </FormGroup>

          {/* Current Configuration Display */}
          {config && (
            <FormGroup legendText={isNepali ? 'वर्तमान कन्फिगरेसन' : 'Current Configuration'}>
              <Tile className="current-config-tile">
                <Grid>
                  <Column lg={6} md={4} sm={4}>
                    <div className="config-info">
                      <span className="config-label">
                        {isNepali ? 'ड्यासबोर्ड नाम:' : 'Dashboard Name:'}
                      </span>
                      <span className="config-value">{config.name}</span>
                    </div>
                  </Column>
                  <Column lg={6} md={4} sm={4}>
                    <div className="config-info">
                      <span className="config-label">
                        {isNepali ? 'भूमिका:' : 'Role:'}
                      </span>
                      <span className="config-value">{config.role}</span>
                    </div>
                  </Column>
                  <Column lg={6} md={4} sm={4}>
                    <div className="config-info">
                      <span className="config-label">
                        {isNepali ? 'विजेटहरू:' : 'Widgets:'}
                      </span>
                      <span className="config-value">{config.widgets.length}</span>
                    </div>
                  </Column>
                  <Column lg={6} md={4} sm={4}>
                    <div className="config-info">
                      <span className="config-label">
                        {isNepali ? 'लेआउट:' : 'Layout:'}
                      </span>
                      <span className="config-value">{config.layout}</span>
                    </div>
                  </Column>
                </Grid>
              </Tile>
            </FormGroup>
          )}

          {/* Error Display */}
          {error && (
            <div className="settings-error">
              <p className="error-message">
                {isNepali ? 'कन्फिगरेसन लोड गर्न असफल:' : 'Failed to load configuration:'} {error.message}
              </p>
            </div>
          )}
        </Form>
      </ModalBody>
      
      <ModalFooter>
        <Button kind="secondary" onClick={handleReset} disabled={isSaving}>
          {isNepali ? 'रिसेट' : 'Reset'}
        </Button>
        <Button kind="secondary" onClick={onClose} disabled={isSaving}>
          {isNepali ? 'रद्द गर्नुहोस्' : 'Cancel'}
        </Button>
        <Button kind="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (isNepali ? 'सुरक्षित गर्दै...' : 'Saving...') : (isNepali ? 'सुरक्षित गर्नुहोस्' : 'Save')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

