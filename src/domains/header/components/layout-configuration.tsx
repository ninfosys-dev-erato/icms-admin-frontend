"use client";

import React, { useState } from "react";
import { 
  NumberInput, 
  TextInput,
  FormGroup,
  Stack,
  Button,
  Tile
} from "@carbon/react";
import { useTranslations } from "next-intl";
import { LayoutConfiguration as LayoutConfigType } from "../types/header";
// Define PaddingSettings and MarginSettings types here if not exported from header types
type PaddingSettings = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type MarginSettings = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

interface LayoutConfigurationProps {
  value: LayoutConfigType;
  onChange: (layout: LayoutConfigType) => void;
  disabled?: boolean;
  className?: string;
}

export const LayoutConfiguration: React.FC<LayoutConfigurationProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const t = useTranslations("headers");
  const [activeBreakpoint, setActiveBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleChange = (field: keyof LayoutConfigType, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const handlePaddingChange = (field: keyof PaddingSettings, newValue: number) => {
    onChange({
      ...value,
      padding: {
        ...value.padding,
        [field]: newValue
      }
    });
  };

  const handleMarginChange = (field: keyof MarginSettings, newValue: number) => {
    onChange({
      ...value,
      margin: {
        ...value.margin,
        [field]: newValue
      }
    });
  };

  const handleResponsiveChange = (breakpoint: 'desktop' | 'tablet' | 'mobile', field: keyof LayoutConfigType, newValue: any) => {
    onChange({
      ...value,
      responsive: {
        ...value.responsive,
        [breakpoint]: {
          ...value.responsive?.[breakpoint],
          [field]: newValue
        }
      }
    });
  };

  const handleNumberChange = (field: keyof LayoutConfigType) => (event: any, state: { value: string | number; direction: string }) => {
    if (state.value !== undefined && typeof state.value === 'number') {
      handleChange(field, state.value);
    }
  };

  const handlePaddingNumberChange = (field: keyof PaddingSettings) => (event: any, state: { value: string | number; direction: string }) => {
    if (state.value !== undefined && typeof state.value === 'number') {
      handlePaddingChange(field, state.value);
    }
  };

  const handleMarginNumberChange = (field: keyof MarginSettings) => (event: any, state: { value: string | number; direction: string }) => {
    if (state.value !== undefined && typeof state.value === 'number') {
      handleMarginChange(field, state.value);
    }
  };

  const handleResponsiveNumberChange = (breakpoint: 'desktop' | 'tablet' | 'mobile', field: keyof LayoutConfigType) => (event: any, state: { value: string | number; direction: string }) => {
    if (state.value !== undefined && typeof state.value === 'number') {
      handleResponsiveChange(breakpoint, field, state.value);
    }
  };

  const renderSpacingControls = (
    title: string,
    spacing: PaddingSettings | MarginSettings,
    onChange: (field: keyof PaddingSettings | keyof MarginSettings, value: number) => void,
    disabled: boolean
  ) => (
    <div className="spacing-controls">
      <div className="spacing-control">
        <label>Top</label>
        <NumberInput
          id={`${title.toLowerCase()}-top`}
          label=""
          value={spacing.top}
          onChange={(event, state) => {
            if (state.value !== undefined && typeof state.value === 'number') {
              onChange('top', state.value);
            }
          }}
          min={0}
          step={1}
          disabled={disabled}
          size="sm"
        />
      </div>
      <div className="spacing-control">
        <label>Right</label>
        <NumberInput
          id={`${title.toLowerCase()}-right`}
          label=""
          value={spacing.right}
          onChange={(event, state) => {
            if (state.value !== undefined && typeof state.value === 'number') {
              onChange('right', state.value);
            }
          }}
          min={0}
          step={1}
          disabled={disabled}
          size="sm"
        />
      </div>
      <div className="spacing-control">
        <label>Bottom</label>
        <NumberInput
          id={`${title.toLowerCase()}-bottom`}
          label=""
          value={spacing.bottom}
          onChange={(event, state) => {
            if (state.value !== undefined && typeof state.value === 'number') {
              onChange('bottom', state.value);
            }
          }}
          min={0}
          step={1}
          disabled={disabled}
          size="sm"
        />
      </div>
      <div className="spacing-control">
        <label>Left</label>
        <NumberInput
          id={`${title.toLowerCase()}-left`}
          label=""
          value={spacing.left}
          onChange={(event, state) => {
            if (state.value !== undefined && typeof state.value === 'number') {
              onChange('left', state.value);
            }
          }}
          min={0}
          step={1}
          disabled={disabled}
          size="sm"
        />
      </div>
    </div>
  );

  const renderResponsiveControls = () => {
    const currentBreakpoint = value.responsive?.[activeBreakpoint];
    
    return (
      <div className="responsive-breakpoints">
        <h4 className="layout-section-title">{t('layout.responsive.title') || 'Responsive Breakpoints'}</h4>
        <p className="form-section-description">{t('layout.responsive.description') || 'Configure layout for different screen sizes'}</p>
        
        <div className="breakpoint-tabs">
          {(['desktop', 'tablet', 'mobile'] as const).map((breakpoint) => (
            <button
              key={breakpoint}
              type="button"
              className={`breakpoint-tab ${activeBreakpoint === breakpoint ? 'active' : ''}`}
              onClick={() => setActiveBreakpoint(breakpoint)}
              disabled={disabled}
            >
              {t(`layout.responsive.${breakpoint}`) || breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
            </button>
          ))}
        </div>

        <div className="responsive-controls">
          <Stack gap={4}>
            <div>
              <NumberInput
                id={`responsive-${activeBreakpoint}-height`}
                label={t('layout.headerHeight') || 'Header Height'}
                value={currentBreakpoint?.headerHeight || value.headerHeight}
                onChange={handleResponsiveNumberChange(activeBreakpoint, 'headerHeight')}
                min={40}
                max={200}
                step={1}
                disabled={disabled}
              />
            </div>

            <div>
              <FormGroup legendText={t('layout.backgroundColor') || 'Background Color'}>
                <div className="color-picker">
                  <input
                    type="color"
                    value={currentBreakpoint?.backgroundColor || value.backgroundColor}
                    onChange={(e) => handleResponsiveChange(activeBreakpoint, 'backgroundColor', e.target.value)}
                    disabled={disabled}
                    aria-label={t('layout.backgroundColor') || 'Background Color'}
                  />
                  <TextInput
                    id={`responsive-${activeBreakpoint}-bg-color`}
                    labelText=""
                    value={currentBreakpoint?.backgroundColor || value.backgroundColor}
                    onChange={(e) => handleResponsiveChange(activeBreakpoint, 'backgroundColor', e.target.value)}
                    disabled={disabled}
                    placeholder="#ffffff"
                  />
                </div>
              </FormGroup>
            </div>

            <div>
              <NumberInput
                id={`responsive-${activeBreakpoint}-border-width`}
                label={t('layout.borderWidth') || 'Border Width'}
                value={currentBreakpoint?.borderWidth || value.borderWidth || 0}
                onChange={handleResponsiveNumberChange(activeBreakpoint, 'borderWidth')}
                min={0}
                max={10}
                step={1}
                disabled={disabled}
              />
            </div>

            <div>
              <FormGroup legendText={t('layout.borderColor') || 'Border Color'}>
                <div className="color-picker">
                  <input
                    type="color"
                    value={currentBreakpoint?.borderColor || value.borderColor || '#e0e0e0'}
                    onChange={(e) => handleResponsiveChange(activeBreakpoint, 'borderColor', e.target.value)}
                    disabled={disabled}
                    aria-label={t('layout.borderColor') || 'Border Color'}
                  />
                  <TextInput
                    id={`responsive-${activeBreakpoint}-border-color`}
                    labelText=""
                    value={currentBreakpoint?.borderColor || value.borderColor || '#e0e0e0'}
                    placeholder="#e0e0e0"
                    disabled={disabled}
                  />
                </div>
              </FormGroup>
            </div>
          </Stack>
        </div>
      </div>
    );
  };

  return (
    <div className={`layout-configuration ${className}`}>
      <h3 className="form-section-title">{t('layout.title') || 'Layout Configuration'}</h3>
      <p className="form-section-description">{t('layout.description') || 'Configure the visual layout and spacing of the header'}</p>

      <div className="layout-section">
        <h4 className="layout-section-title">{t('layout.dimensions') || 'Dimensions'}</h4>
        <Stack gap={4}>
          <div>
            <NumberInput
              id="header-height"
              label={t('layout.headerHeight') || 'Header Height'}
              value={value.headerHeight}
              onChange={handleNumberChange('headerHeight')}
              min={40}
              max={200}
              step={1}
              disabled={disabled}
              invalid={value.headerHeight <= 0}
              invalidText={t('layout.headerHeightInvalid') || 'Header height must be greater than 0'}
            />
          </div>
        </Stack>
      </div>

      <div className="layout-section">
        <h4 className="layout-section-title">{t('layout.colors') || 'Colors'}</h4>
        <Stack gap={4}>
          <div>
            <FormGroup legendText={t('layout.backgroundColor') || 'Background Color'}>
              <div className="color-picker">
                <input
                  type="color"
                  value={value.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  disabled={disabled}
                  aria-label={t('layout.backgroundColor') || 'Background Color'}
                />
                <TextInput
                  id="bg-color"
                  labelText=""
                  value={value.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  disabled={disabled}
                  placeholder="#ffffff"
                  invalid={!value.backgroundColor}
                  invalidText={t('layout.backgroundColorRequired') || 'Background color is required'}
                />
              </div>
            </FormGroup>
          </div>

          <div>
            <FormGroup legendText={t('layout.borderColor') || 'Border Color'}>
              <div className="color-picker">
                <input
                  type="color"
                  value={value.borderColor || '#e0e0e0'}
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  disabled={disabled}
                  aria-label={t('layout.borderColor') || 'Border Color'}
                />
                <TextInput
                  id="border-color"
                  labelText=""
                  value={value.borderColor || '#e0e0e0'}
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  disabled={disabled}
                  placeholder="#e0e0e0"
                />
              </div>
            </FormGroup>
          </div>

          <div>
            <NumberInput
              id="border-width"
              label={t('layout.borderWidth') || 'Border Width'}
              value={value.borderWidth || 0}
              onChange={handleNumberChange('borderWidth')}
              min={0}
              max={10}
              step={1}
              disabled={disabled}
            />
          </div>
        </Stack>
      </div>

      <div className="layout-section">
        <h4 className="layout-section-title">{t('layout.padding') || 'Padding'}</h4>
        <p className="form-section-description">{t('layout.paddingDescription') || 'Set the internal spacing around the header content'}</p>
        {renderSpacingControls('Padding', value.padding, handlePaddingChange, disabled)}
      </div>

      <div className="layout-section">
        <h4 className="layout-section-title">{t('layout.margin') || 'Margin'}</h4>
        <p className="form-section-description">{t('layout.marginDescription') || 'Set the external spacing around the header'}</p>
        {renderSpacingControls('Margin', value.margin, handleMarginChange, disabled)}
      </div>

      {renderResponsiveControls()}

      {/* Live Preview */}
      <div className="layout-preview" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--cds-ui-03)', borderRadius: '0' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--cds-text-02)' }}>
          {t('layout.preview') || 'Layout Preview'}
        </h4>
        <div
          style={{
            height: `${value.headerHeight}px`,
            backgroundColor: value.backgroundColor || '#ffffff',
            border: value.borderWidth && value.borderColor ? `${value.borderWidth}px solid ${value.borderColor}` : 'none',
            padding: `${value.padding.top}px ${value.padding.right}px ${value.padding.bottom}px ${value.padding.left}px`,
            margin: `${value.margin.top}px ${value.margin.right}px ${value.margin.bottom}px ${value.margin.left}px`,
            borderRadius: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cds-text-01)',
            fontSize: '0.875rem'
          }}
        >
          {t('layout.previewText') || 'Header Preview'}
        </div>
      </div>
    </div>
  );
};
