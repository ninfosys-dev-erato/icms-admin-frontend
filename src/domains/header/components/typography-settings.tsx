"use client";

import React from "react";
import { 
  Select, 
  SelectItem, 
  NumberInput, 
  TextInput,
  FormGroup,
  Stack
} from "@carbon/react";
import { useTranslations } from "next-intl";
import { TypographySettings as TypographySettingsType } from "../types/header";

interface TypographySettingsProps {
  value: TypographySettingsType;
  onChange: (typography: TypographySettingsType) => void;
  disabled?: boolean;
  className?: string;
}

// Common web-safe fonts
const WEB_SAFE_FONTS = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Courier New, monospace',
  'Lucida Console, monospace',
  'Palatino, serif',
  'Garamond, serif',
  'Bookman, serif',
  'Avant Garde, sans-serif'
];

// Font weight options
const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'lighter', label: 'Lighter' },
  { value: 'bolder', label: 'Bolder' },
  { value: 100, label: '100 - Thin' },
  { value: 200, label: '200 - Extra Light' },
  { value: 300, label: '300 - Light' },
  { value: 400, label: '400 - Regular' },
  { value: 500, label: '500 - Medium' },
  { value: 600, label: '600 - Semi Bold' },
  { value: 700, label: '700 - Bold' },
  { value: 800, label: '800 - Extra Bold' },
  { value: 900, label: '900 - Black' }
];

export const TypographySettings: React.FC<TypographySettingsProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const t = useTranslations("headers");

  const handleChange = (field: keyof TypographySettingsType, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const handleFontFamilyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('fontFamily', event.target.value);
  };

  const handleFontWeightChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const weight = event.target.value;
    // Convert numeric strings back to numbers for font weights
    const numericWeight = ['100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(weight) 
      ? parseInt(weight, 10) 
      : weight;
    handleChange('fontWeight', numericWeight);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('color', event.target.value);
  };

  const handleNumberChange = (field: 'fontSize' | 'lineHeight' | 'letterSpacing') => (event: any, state: { value: string | number; direction: string }) => {
    if (state.value !== undefined && typeof state.value === 'number') {
      handleChange(field, state.value);
    }
  };

  return (
    <div className={`typography-settings ${className}`}>
      <h3 className="form-section-title">{t('typography.title')}</h3>
      <p className="form-section-description">{t('typography.description')}</p>

      <div className="typography-grid">
        <div className="font-family-selector">
          <Select
            id="font-family"
            labelText={t('typography.fontFamily')}
            value={value.fontFamily}
            onChange={handleFontFamilyChange}
            disabled={disabled}
            invalid={!value.fontFamily}
            invalidText={t('typography.fontFamilyRequired') || 'Font family is required'}
          >
            {WEB_SAFE_FONTS.map((font) => (
              <SelectItem key={font} value={font} text={font.split(',')[0] ?? font} />
            ))}
          </Select>
        </div>

        <div>
          <NumberInput
            id="font-size"
            label={t('typography.fontSize')}
            value={value.fontSize}
            onChange={handleNumberChange('fontSize')}
            min={8}
            max={72}
            step={1}
            disabled={disabled}
            invalid={value.fontSize <= 0}
            invalidText={t('typography.fontSizeInvalid')}
          />
        </div>

        <div>
          <Select
            id="font-weight"
            labelText={t('typography.fontWeight')}
            value={value.fontWeight.toString()}
            onChange={handleFontWeightChange}
            disabled={disabled}
          >
            {FONT_WEIGHTS.map((weight) => (
              <SelectItem key={weight.value.toString()} value={weight.value.toString()} text={weight.label} />
            ))}
          </Select>
        </div>

        <div>
          <FormGroup legendText={t('typography.color')}>
            <div className="color-picker">
              <input
                type="color"
                value={value.color}
                onChange={handleColorChange}
                disabled={disabled}
                aria-label={t('typography.color')}
              />
              <TextInput
                id="color-input"
                labelText=""
                value={value.color}
                onChange={handleColorChange}
                disabled={disabled}
                placeholder="#000000"
                invalid={!value.color}
                invalidText={t('typography.colorRequired')}
              />
            </div>
          </FormGroup>
        </div>

        <div>
          <NumberInput
            id="line-height"
            label={t('typography.lineHeight')}
            value={value.lineHeight}
            onChange={handleNumberChange('lineHeight')}
            min={0.5}
            max={3}
            step={0.1}
            disabled={disabled}
            invalid={value.lineHeight <= 0}
            invalidText={t('typography.lineHeightInvalid')}
          />
        </div>

        <div>
          <NumberInput
            id="letter-spacing"
            label={t('typography.letterSpacing')}
            value={value.letterSpacing}
            onChange={handleNumberChange('letterSpacing')}
            min={-2}
            max={10}
            step={0.1}
            disabled={disabled}
            invalid={value.letterSpacing < -2}
            invalidText={t('typography.letterSpacingInvalid')}
          />
        </div>
      </div>

      {/* Live Preview */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--cds-ui-03)', borderRadius: '0' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--cds-text-02)' }}>
          {t('typography.preview') || 'Preview'}
        </h4>
        <div
          style={{
            fontFamily: value.fontFamily || 'Arial, sans-serif',
            fontSize: `${value.fontSize}px`,
            fontWeight: value.fontWeight,
            color: value.color || '#000000',
            lineHeight: value.lineHeight,
            letterSpacing: `${value.letterSpacing}px`,
            padding: '1rem',
            backgroundColor: 'var(--cds-ui-01)',
            borderRadius: '0',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {t('typography.previewText')}
        </div>
      </div>
    </div>
  );
};
