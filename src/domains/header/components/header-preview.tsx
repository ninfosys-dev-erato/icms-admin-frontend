"use client";

import React, { useMemo } from "react";
import { 
  Button, 
  Tile, 
  Stack, 
  CodeSnippet,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels
} from "@carbon/react";
import { Copy, Download } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { HeaderConfig } from "../types/header";

interface HeaderPreviewProps {
  header: HeaderConfig;
  className?: string;
  onGenerateCSS?: () => void;
  cssContent?: string;
  isGeneratingCSS?: boolean;
}

export const HeaderPreview: React.FC<HeaderPreviewProps> = ({
  header,
  className = "",
  onGenerateCSS,
  cssContent,
  isGeneratingCSS = false,
}) => {
  const t = useTranslations("headers");

  // Generate CSS dynamically for live preview
  const generatedCSS = useMemo(() => {
    const css = `
.header-preview-${header.id} {
  height: ${header.layout.headerHeight}px;
  background-color: ${header.layout.backgroundColor};
  border: ${header.layout.borderWidth ? `${header.layout.borderWidth}px solid ${header.layout.borderColor || '#e0e0e0'}` : 'none'};
  padding: ${header.layout.padding.top}px ${header.layout.padding.right}px ${header.layout.padding.bottom}px ${header.layout.padding.left}px;
  margin: ${header.layout.margin.top}px ${header.layout.margin.right}px ${header.layout.margin.bottom}px ${header.layout.margin.left}px;
  display: flex;
  align-items: center;
  justify-content: ${header.alignment.toLowerCase()};
  position: relative;
  box-sizing: border-box;
}

.header-preview-${header.id} .header-content {
  font-family: ${header.typography.fontFamily};
  font-size: ${header.typography.fontSize}px;
  font-weight: ${header.typography.fontWeight};
  color: ${header.typography.color};
  line-height: ${header.typography.lineHeight};
  letter-spacing: ${header.typography.letterSpacing}px;
  text-align: ${header.alignment.toLowerCase()};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: ${header.alignment.toLowerCase()};
}

.header-preview-${header.id} .logo-left {
  ${header.logo.leftLogo ? `
  width: ${header.logo.leftLogo.width}px;
  height: ${header.logo.leftLogo.height}px;
  margin-right: ${header.logo.logoSpacing}px;
  ` : 'display: none;'}
}

.header-preview-${header.id} .logo-right {
  ${header.logo.rightLogo ? `
  width: ${header.logo.rightLogo.width}px;
  height: ${header.logo.rightLogo.height}px;
  margin-left: ${header.logo.logoSpacing}px;
  ` : 'display: none;'}
}

.header-preview-${header.id} .logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .header-preview-${header.id} {
    ${header.layout.responsive?.mobile ? `
    height: ${header.layout.responsive.mobile.headerHeight || header.layout.headerHeight}px;
    background-color: ${header.layout.responsive.mobile.backgroundColor || header.layout.backgroundColor};
    ` : ''}
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .header-preview-${header.id} {
    ${header.layout.responsive?.tablet ? `
    height: ${header.layout.responsive.tablet.headerHeight || header.layout.headerHeight}px;
    background-color: ${header.layout.responsive.tablet.backgroundColor || header.layout.backgroundColor};
    ` : ''}
  }
}
    `.trim();

    return css;
  }, [header]);

  const handleCopyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generatedCSS);
      // You could show a toast notification here
    } catch (err) {
      // console.error('Failed to copy CSS:', err);
    }
  };

  const handleDownloadCSS = () => {
    const blob = new Blob([generatedCSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `header-${header.id}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderLogo = (logoType: 'left' | 'right') => {
    const logo = logoType === 'left' ? header.logo.leftLogo : header.logo.rightLogo;
    if (!logo) return null;

    return (
      <div className={`logo logo-${logoType}`}>
        {logo.media?.presignedUrl ? (
          <img
            src={logo.media.presignedUrl}
            alt={logo.altText?.en || `Header ${logoType} logo`}
            style={{
              width: logo.width,
              height: logo.height,
              objectFit: 'contain'
            }}
          />
        ) : (
          <div
            style={{
              width: logo.width,
              height: logo.height,
              backgroundColor: 'var(--cds-ui-03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cds-text-02)',
              fontSize: '0.75rem',
              borderRadius: '0'
            }}
          >
            {logoType === 'left' ? 'L' : 'R'}
          </div>
        )}
      </div>
    );
  };

  const renderHeaderContent = () => {
    const hasLeftLogo = !!header.logo.leftLogo;
    const hasRightLogo = !!header.logo.rightLogo;
    const hasAnyLogo = hasLeftLogo || hasRightLogo;

    return (
      <div className={`header-preview-${header.id}`}>
        {renderLogo('left')}
        
        <div className="header-content">
          {hasAnyLogo ? (
            <span style={{ 
              fontFamily: header.typography.fontFamily,
              fontSize: header.typography.fontSize,
              fontWeight: header.typography.fontWeight,
              color: header.typography.color,
              lineHeight: header.typography.lineHeight,
              letterSpacing: header.typography.letterSpacing
            }}>
              {header.name?.en || 'Header Title'}
            </span>
          ) : (
            <span style={{ 
              fontFamily: header.typography.fontFamily,
              fontSize: header.typography.fontSize,
              fontWeight: header.typography.fontWeight,
              color: header.typography.color,
              lineHeight: header.typography.lineHeight,
              letterSpacing: header.typography.letterSpacing
            }}>
              {header.name?.en || 'Header Title'}
            </span>
          )}
        </div>

        {renderLogo('right')}
      </div>
    );
  };

  return (
    <div className={`header-preview ${className}`}>
      <h3 className="form-section-title">{t('preview.title') || 'Header Preview'}</h3>
      <p className="form-section-description">
        {t('preview.description') || 'Preview your header configuration in real-time. Generate CSS for production use.'}
      </p>

      <Tabs>
        <TabList aria-label="Header preview tabs">
          <Tab>{t('preview.live') || 'Live Preview'}</Tab>
          <Tab>{t('preview.css') || 'Generated CSS'}</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="preview-container">
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--cds-text-02)' }}>
                {t('preview.livePreview') || 'Live Preview'}
              </h4>
              
              <div className="preview-header">
                {renderHeaderContent()}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <Button
                  kind="secondary"
                  renderIcon={Download}
                  onClick={onGenerateCSS}
                  disabled={isGeneratingCSS}
                >
                  {isGeneratingCSS ? 'Generating...' : (t('preview.generateCSS') || 'Generate CSS')}
                </Button>
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="css-container">
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--cds-text-02)' }}>
                {t('preview.generatedCSS') || 'Generated CSS'}
              </h4>

              <div className="css-actions" style={{ marginBottom: '1rem' }}>
                <Stack gap={4} orientation="horizontal">
                  <Button
                    kind="secondary"
                    renderIcon={Copy}
                    onClick={handleCopyCSS}
                    size="sm"
                  >
                    {t('preview.copyCSS') || 'Copy CSS'}
                  </Button>
                  <Button
                    kind="secondary"
                    renderIcon={Download}
                    onClick={handleDownloadCSS}
                    size="sm"
                  >
                    {t('preview.downloadCSS') || 'Download CSS'}
                  </Button>
                </Stack>
              </div>

              <div className="css-content" style={{ maxHeight: '400px' }}>
                <CodeSnippet
                  type="multi"
                  feedback="Copied!"
                  copyButtonDescription="Copy CSS to clipboard"
                  aria-label="Generated CSS code"
                >
                  {cssContent || generatedCSS}
                </CodeSnippet>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--cds-text-02)' }}>
                <p style={{ margin: 0 }}>
                  {t('preview.cssNote') || 'This CSS includes all your header configuration settings. Copy and paste it into your stylesheet.'}
                </p>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Configuration Summary */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--cds-ui-03)', borderRadius: '0', backgroundColor: 'var(--cds-ui-02)' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--cds-text-02)' }}>
          {t('preview.configuration') || 'Configuration Summary'}
        </h4>
        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-01)' }}>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Height:</strong> {header.layout.headerHeight}px
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Background:</strong> {header.layout.backgroundColor}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Font:</strong> {header.typography.fontFamily} {header.typography.fontSize}px
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Alignment:</strong> {header.alignment}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Logos:</strong> {header.logo.leftLogo ? 'Left' : 'No left'}, {header.logo.rightLogo ? 'Right' : 'No right'}
          </p>
        </div>
      </div>
    </div>
  );
};
