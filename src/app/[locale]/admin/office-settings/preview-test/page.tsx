"use client";

import React, { useState } from "react";
import { BackgroundPhotoPreview } from "@/domains/office-settings";
import { Button, TextInput, Tile } from "@carbon/react";
import { NotificationService } from '@/services/notification-service';
import { useTranslations } from "next-intl";

export default function BackgroundPhotoPreviewTest() {
  const t = useTranslations("office-settings");
  const [mediaId, setMediaId] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [useMediaId, setUseMediaId] = useState(true);

  const handleError = (error: Error) => {
    console.error("Preview error:", error);
    NotificationService.showError(`Error loading image: ${error.message}`);
  };

  const handleLoad = () => {
    console.log("Image loaded successfully");
  };

  return (
    <div className="preview-test-page">
      <div className="page-header">
        <h1 className="page-title font-dynamic">
          Background Photo Preview Test
        </h1>
        <p className="page-subtitle font-dynamic">
          Test the background photo preview functionality with different inputs
        </p>
      </div>


      <div className="test-controls">
        <Tile className="form-section-tile">
          <h3 className="section-title font-dynamic">Test Controls</h3>

          <div className="control-group">
            <label className="control-label font-dynamic">
              <input
                type="radio"
                name="inputType"
                checked={useMediaId}
                onChange={() => setUseMediaId(true)}
              />
              Use Media ID
            </label>
            <label className="control-label font-dynamic">
              <input
                type="radio"
                name="inputType"
                checked={!useMediaId}
                onChange={() => setUseMediaId(false)}
              />
              Use Direct URL
            </label>
          </div>

          {useMediaId ? (
            <div className="input-group">
              <TextInput
                id="mediaId"
                labelText="Media ID"
                value={mediaId}
                onChange={(e) => setMediaId(e.target.value)}
                placeholder="Enter media ID (e.g., 12345678-1234-1234-1234-123456789012)"
                className="font-english-only"
              />
            </div>
          ) : (
            <div className="input-group">
              <TextInput
                id="directUrl"
                labelText="Direct URL"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="Enter direct image URL"
                className="font-english-only"
              />
            </div>
          )}

          <div className="button-group">
            <Button
              kind="secondary"
              onClick={() => {
                setMediaId("");
                setDirectUrl("");
              }}
            >
              Clear
            </Button>
            <Button
              kind="primary"
              onClick={() => {
                if (useMediaId && mediaId) {
                  console.log("Testing with Media ID:", mediaId);
                } else if (!useMediaId && directUrl) {
                  console.log("Testing with Direct URL:", directUrl);
                } else {
                  NotificationService.showInfo("Please enter a Media ID or Direct URL");
                }
              }}
            >
              Test Preview
            </Button>
          </div>
        </Tile>
      </div>

      <div className="preview-section">
        <Tile className="form-section-tile">
          <h3 className="section-title font-dynamic">Preview Result</h3>

          <BackgroundPhotoPreview
            mediaId={useMediaId ? mediaId : undefined}
            directUrl={!useMediaId ? directUrl : undefined}
            alt="Test background photo"
            onError={handleError}
            onLoad={handleLoad}
          />
        </Tile>
      </div>

      <div className="info-section">
        <Tile className="form-section-tile">
          <h3 className="section-title font-dynamic">How to Test</h3>

          <div className="info-content">
            <h4 className="font-dynamic">Testing with Media ID:</h4>
            <ul className="font-dynamic">
              <li>Enter a valid media ID from your database</li>
              <li>
                The component will try to get a presigned URL from the backend
              </li>
              <li>If presigned URL fails, it will fallback to direct URL</li>
            </ul>

            <h4 className="font-dynamic">Testing with Direct URL:</h4>
            <ul className="font-dynamic">
              <li>
                Enter a direct image URL (e.g., https://example.com/image.jpg)
              </li>
              <li>The component will load the image directly</li>
              <li>Useful for testing with external images</li>
            </ul>

            <h4 className="font-dynamic">Error Handling:</h4>
            <ul className="font-dynamic">
              <li>Invalid media IDs will show error state</li>
              <li>Broken URLs will show error state</li>
              <li>Network errors will be handled gracefully</li>
            </ul>
          </div>
        </Tile>
      </div>

      <style jsx>{`
        .preview-test-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .test-controls,
        .preview-section,
        .info-section {
          margin-bottom: 2rem;
        }

        .control-group {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
        }

        .info-content h4 {
          margin: 1rem 0 0.5rem 0;
          color: var(--cds-text-01);
        }

        .info-content ul {
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
        }

        .info-content li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
