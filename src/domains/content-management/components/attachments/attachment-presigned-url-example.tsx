"use client";

import { Button, Dropdown, Stack, TextInput, Tile } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useAttachmentPresignedUrl } from "../../hooks/use-attachment-queries";
import { ContentAttachment } from "../../types/attachment";
import { AttachmentPreview } from "./attachment-preview";

interface AttachmentPresignedUrlExampleProps {
  attachment: ContentAttachment;
  className?: string;
}

export const AttachmentPresignedUrlExample: React.FC<AttachmentPresignedUrlExampleProps> = ({
  attachment,
  className = "",
}) => {
  const t = useTranslations("content-management");
  const [expiresIn, setExpiresIn] = useState<number>(3600); // 1 hour default
  const [operation, setOperation] = useState<'get' | 'put'>('get');

  // Get presigned URL with custom parameters
  const { 
    data: presignedUrl, 
    isLoading, 
    error,
    refetch 
  } = useAttachmentPresignedUrl(attachment.id, expiresIn, operation);

  const handleGetPresignedUrl = () => {
    refetch();
  };

  const handleOpenInNewTab = () => {
    if (presignedUrl) {
      window.open(presignedUrl, '_blank');
    }
  };

  const handleCopyUrl = () => {
    if (presignedUrl) {
      navigator.clipboard.writeText(presignedUrl);
      // You could show a toast notification here
    }
  };

  return (
    <Tile className={`attachment-presigned-url-example ${className}`}>
      <Stack gap={4}>
        <div>
          <h4>Presigned URL Example</h4>
          <p>This demonstrates how to use presigned URLs for attachments.</p>
        </div>

        {/* Attachment Preview */}
        <div>
          <h5>Attachment Preview</h5>
          <AttachmentPreview 
            attachment={attachment} 
            showActions={false}
          />
        </div>

        {/* Presigned URL Controls */}
        <div>
          <h5>Presigned URL Controls</h5>
          <Stack gap={3}>
            <div className="presigned-controls-row">
              <TextInput
                id="expires-in"
                labelText="Expires In (seconds)"
                value={expiresIn.toString()}
                onChange={(e) => setExpiresIn(Number(e.target.value) || 3600)}
                type="number"
                min={60}
                max={86400}
                className="presigned-input-width-200"
              />
              
              <Dropdown
                id="operation"
                titleText="Operation"
                label="Select operation"
                items={[
                  { id: 'get', label: 'Get (Read)' },
                  { id: 'put', label: 'Put (Write)' }
                ]}
                selectedItem={{ id: operation, label: operation === 'get' ? 'Get (Read)' : 'Put (Write)' }}
                itemToString={(item) => item?.label || ''}
                onChange={({ selectedItem }) => setOperation(selectedItem?.id as 'get' | 'put')}
                className="presigned-input-width-150"
              />
            </div>

            <Button onClick={handleGetPresignedUrl} disabled={isLoading}>
              {isLoading ? 'Getting URL...' : 'Get Presigned URL'}
            </Button>
          </Stack>
        </div>

        {/* Presigned URL Display */}
        {presignedUrl && (
          <div>
            <h5>Presigned URL</h5>
            <Stack gap={3}>
              <div className="presigned-url-box">
                {presignedUrl}
              </div>

              <div className="presigned-controls-actions">
                <Button 
                  kind="secondary" 
                  size="sm" 
                  onClick={handleOpenInNewTab}
                >
                  Open in New Tab
                </Button>
                <Button 
                  kind="ghost" 
                  size="sm" 
                  onClick={handleCopyUrl}
                >
                  Copy URL
                </Button>
              </div>
            </Stack>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="presigned-error-box">
            Error: {error.message}
          </div>
        )}

        {/* Usage Instructions */}
        <div>
          <h5>Usage Instructions</h5>
          <ul className="presigned-usage-list">
            <li><strong>Get Operation:</strong> Use for reading/viewing files</li>
            <li><strong>Put Operation:</strong> Use for uploading/replacing files</li>
            <li><strong>Expires In:</strong> URL validity duration in seconds</li>
            <li><strong>Security:</strong> URLs are temporary and secure</li>
          </ul>
        </div>
      </Stack>
    </Tile>
  );
};
