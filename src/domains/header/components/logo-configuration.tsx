"use client";

import React, { useCallback, useState } from "react";
import { 
  Button, 
  Tile, 
  Stack, 
  InlineLoading, 
  NumberInput,
  FormGroup,
  TextInput
} from "@carbon/react";
import { TrashCan, Image, Upload } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { LogoConfiguration as LogoConfig, LogoItem, TranslatableEntity } from "../types/header";
import { useLogoMedia } from "../hooks/use-header-queries";

interface LogoConfigurationProps {
  value: LogoConfig;
  onChange: (logo: LogoConfig) => void;
  disabled?: boolean;
  className?: string;
}

interface LogoUploadState {
  left?: File;
  right?: File;
}

// Logo-specific file validation
const validateLogoFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml"
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB for logos

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "JPEG, PNG, WebP, GIF, or SVG only.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size exceeds 5MB limit.",
    };
  }

  return { isValid: true };
};

export const LogoConfiguration: React.FC<LogoConfigurationProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const t = useTranslations("headers");
  const [dragOver, setDragOver] = useState<"left" | "right" | null>(null);
  const [validationError, setValidationError] = useState<Record<string, string>>({});

  const handleFileUpload = useCallback(
    (logoType: 'left' | 'right', event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate the file before uploading
        const validation = validateLogoFile(file);
        if (!validation.isValid) {
          setValidationError(prev => ({
            ...prev,
            [logoType]: validation.error || "Invalid file"
          }));
          return;
        }

        // Clear validation error
        setValidationError(prev => {
          const newErrors = { ...prev };
          delete newErrors[logoType];
          return newErrors;
        });

        // Update logo configuration with temporary preview
        const updatedLogo: LogoItem = {
          mediaId: `temp-${Date.now()}`, // Temporary ID for preview only
          altText: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.altText || { en: '', ne: '' },
          width: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.width || 150,
          height: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.height || 50
        };

        onChange({
          ...value,
          [logoType === 'left' ? 'leftLogo' : 'rightLogo']: updatedLogo
        });
      }
    },
    [value, onChange]
  );

  const handleDragOver = useCallback((event: React.DragEvent, logoType: 'left' | 'right') => {
    event.preventDefault();
    setDragOver(logoType);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, logoType: 'left' | 'right') => {
      event.preventDefault();
      setDragOver(null);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file) {
          // Validate the file before uploading
          const validation = validateLogoFile(file);
          if (!validation.isValid) {
            setValidationError(prev => ({
              ...prev,
              [logoType]: validation.error || "Invalid file"
            }));
            return;
          }

          // Clear validation error
          setValidationError(prev => {
            const newErrors = { ...prev };
            delete newErrors[logoType];
            return newErrors;
          });

          // Update logo configuration with temporary preview
          const updatedLogo: LogoItem = {
            mediaId: `temp-${Date.now()}`, // Temporary ID for preview only
            altText: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.altText || { en: '', ne: '' },
            width: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.width || 150,
            height: value[logoType === 'left' ? 'leftLogo' : 'rightLogo']?.height || 50
          };

          onChange({
            ...value,
            [logoType === 'left' ? 'leftLogo' : 'rightLogo']: updatedLogo
          });
        }
      }
    },
    [value, onChange]
  );

  const handleRemoveLogo = useCallback((logoType: 'left' | 'right') => {
    onChange({
      ...value,
      [logoType === 'left' ? 'leftLogo' : 'rightLogo']: undefined
    });
  }, [value, onChange]);

  const handleAltTextChange = useCallback((logoType: 'left' | 'right', altText: TranslatableEntity) => {
    const currentLogo = value[logoType === 'left' ? 'leftLogo' : 'rightLogo'];
    if (currentLogo) {
      onChange({
        ...value,
        [logoType === 'left' ? 'leftLogo' : 'rightLogo']: {
          ...currentLogo,
          altText
        }
      });
    }
  }, [value, onChange]);

  const handleDimensionChange = useCallback((logoType: 'left' | 'right', field: 'width' | 'height', newValue: number) => {
    const currentLogo = value[logoType === 'left' ? 'leftLogo' : 'rightLogo'];
    if (currentLogo) {
      onChange({
        ...value,
        [logoType === 'left' ? 'leftLogo' : 'rightLogo']: {
          ...currentLogo,
          [field]: newValue
        }
      });
    }
  }, [value, onChange]);

  const handleAlignmentChange = useCallback((alignment: 'left' | 'center' | 'right') => {
    onChange({
      ...value,
      logoAlignment: alignment
    });
  }, [value, onChange]);

  const handleSpacingChange = useCallback((spacing: number) => {
    onChange({
      ...value,
      logoSpacing: spacing
    });
  }, [value, onChange]);

  const renderLogoSection = (logoType: 'left' | 'right', logo?: LogoItem) => {
    const isLeft = logoType === 'left';
    const logoKey = isLeft ? 'leftLogo' : 'rightLogo';
    const hasLogo = !!logo;

    // Fetch media data if logo has mediaId and it's not a temporary ID
    const { data: logoMedia } = useLogoMedia(
      logo?.mediaId && !logo.mediaId.startsWith('temp-') ? logo.mediaId : undefined
    );

    return (
      <div className="logo-section">
        <h3 className="logo-section-title">
          {isLeft ? t('logo.leftLogo') : t('logo.rightLogo')}
        </h3>

        {validationError[logoType] && (
          <div style={{ marginBottom: "1rem", color: "var(--cds-text-error)", fontSize: "0.75rem" }}>
            {validationError[logoType]}
          </div>
        )}

        {hasLogo ? (
          <div className="logo-preview">
            {logoMedia?.presignedUrl || logoMedia?.url ? (
              <img
                src={logoMedia.presignedUrl || logoMedia.url}
                alt={logo.altText?.en || 'Logo preview'}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'var(--cds-text-02)' 
              }}>
                Loading logo...
              </div>
            )}
          </div>
        ) : (
          <Tile
            className={`logo-upload-area ${dragOver === logoType ? "drag-over" : ""}`}
            onDragOver={(e) => handleDragOver(e, logoType)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, logoType)}
          >
            <Stack gap={4} className="upload-content">
              <Image size={32} className="upload-icon" />
              <p style={{ margin: 0, fontSize: "0.875rem" }}>
                {t('logo.upload.placeholder')}
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--cds-text-02)" }}>
                JPEG, PNG, WebP, GIF, SVG up to 5MB
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={(e) => handleFileUpload(logoType, e)}
                disabled={disabled}
                className="file-input"
                id={`logo-input-${logoType}`}
                style={{ display: 'none' }}
              />
              <Button
                kind="secondary"
                disabled={disabled}
                type="button"
                size="sm"
                renderIcon={Upload}
                onClick={() => document.getElementById(`logo-input-${logoType}`)?.click()}
              >
                {t('logo.upload.button')}
              </Button>
            </Stack>
          </Tile>
        )}

        {hasLogo && (
          <>
            <div className="logo-controls">
              <Button
                kind="danger"
                renderIcon={TrashCan}
                onClick={() => handleRemoveLogo(logoType)}
                disabled={disabled}
                size="sm"
              >
                {t('logo.remove')}
              </Button>
            </div>

            <div className="logo-dimensions">
              <div className="logo-dimension-group">
                                 <NumberInput
                   id={`${logoType}-width`}
                   label={t('logo.width')}
                   value={logo.width}
                   onChange={(event, { value }) => {
                     if (value !== undefined && typeof value === 'number') {
                       handleDimensionChange(logoType, 'width', value);
                     }
                   }}
                   min={1}
                   step={1}
                   disabled={disabled}
                 />
              </div>
              <div className="logo-dimension-group">
                                 <NumberInput
                   id={`${logoType}-height`}
                   label={t('logo.height')}
                   value={logo.height}
                   onChange={(event, { value }) => {
                     if (value !== undefined && typeof value === 'number') {
                       handleDimensionChange(logoType, 'height', value);
                     }
                   }}
                   min={1}
                   step={1}
                   disabled={disabled}
                 />
              </div>
            </div>

            <FormGroup legendText={t('logo.altText')}>
              <TextInput
                id={`${logoType}-alt-en`}
                labelText={t('logo.altTextEn')}
                value={logo.altText?.en || ''}
                onChange={(e) => handleAltTextChange(logoType, {
                  ...logo.altText,
                  en: e.target.value
                })}
                disabled={disabled}
                placeholder={t('logo.altTextPlaceholder')}
              />
              <TextInput
                id={`${logoType}-alt-ne`}
                labelText={t('logo.altTextNe')}
                value={logo.altText?.ne || ''}
                onChange={(e) => handleAltTextChange(logoType, {
                  ...logo.altText,
                  ne: e.target.value
                })}
                disabled={disabled}
                placeholder={t('logo.altTextPlaceholder')}
                style={{ marginTop: '1rem' }}
              />
            </FormGroup>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`logo-configuration ${className}`}>
      <h3 className="form-section-title">{t('logo.title')}</h3>
      <p className="form-section-description">{t('logo.description')}</p>

      <div className="logo-sections">
        {renderLogoSection('left', value.leftLogo)}
        {renderLogoSection('right', value.rightLogo)}
      </div>

      <div className="logo-settings">
        <FormGroup legendText={t('logo.alignment')}>
          <div className="alignment-selector">
            {(['left', 'center', 'right'] as const).map((alignment) => (
              <button
                key={alignment}
                type="button"
                className={`alignment-option ${value.logoAlignment === alignment ? 'selected' : ''}`}
                onClick={() => handleAlignmentChange(alignment)}
                disabled={disabled}
              >
                {t(`logo.alignment.${alignment}`)}
              </button>
            ))}
          </div>
        </FormGroup>

        <FormGroup legendText={t('logo.spacing')}>
                     <NumberInput
             id="logo-spacing"
             label={t('logo.spacing')}
             value={value.logoSpacing}
             onChange={(event, { value }) => {
               if (value !== undefined && typeof value === 'number') {
                 handleSpacingChange(value);
               }
             }}
             min={0}
             step={1}
             disabled={disabled}
           />
        </FormGroup>
      </div>
    </div>
  );
};
