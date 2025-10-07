"use client";

import React, { useState } from "react";
import {
  Grid,
  Column,
  Tile,
  TextInput,
  Button,
  Toggle,
  InlineNotification,
} from "@carbon/react";
import { SliderImagePreview } from "@/domains/sliders/components/slider-image-preview";

export default function SliderImagePreviewTest() {
  const [mediaId, setMediaId] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    subtitle: string;
  } | null>(null);

  const handleError = (error: Error) => {
    console.error("Preview error:", error);
    setNotification({
      type: "error",
      subtitle: `Image failed to load: ${error.message}`,
    });
  };

  const handleLoad = () => {
    console.log("Image loaded successfully");
    setNotification({
      type: "success",
      subtitle: "Image loaded successfully!",
    });
  };

  const testUrls = [
    {
      name: "Sample Backblaze URL",
      url: "https://f003.backblazeb2.com/file/iCMS-bucket/sliders/sample-slider.jpg",
    },
    {
      name: "Invalid URL",
      url: "https://invalid-url.com/image.jpg",
    },
    {
      name: "Local Test Image",
      url: "/next.svg",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Slider Image Preview Test</h1>
      <p>
        Test the SliderImagePreview component with different URLs and
        configurations.
      </p>

      {notification && (
        <InlineNotification
          kind={notification.type}
          title={notification.type === "success" ? "Success" : "Error"}
          subtitle={notification.subtitle}
          onClose={() => setNotification(null)}
          style={{ marginBottom: "1rem" }}
        />
      )}

      <Grid fullWidth style={{ marginBottom: "2rem" }}>
        <Column lg={8} md={4} sm={4}>
          <Tile style={{ padding: "1rem" }}>
            <h3>Configuration</h3>

            <TextInput
              id="mediaId"
              labelText="Media ID"
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
              placeholder="Enter media ID"
              style={{ marginBottom: "1rem" }}
            />

            <TextInput
              id="directUrl"
              labelText="Direct URL"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="Enter direct image URL"
              style={{ marginBottom: "1rem" }}
            />

            <Toggle
              id="showControls"
              labelText="Show Controls"
              toggled={showControls}
              onToggle={setShowControls}
              style={{ marginBottom: "1rem" }}
            />

            <div style={{ marginBottom: "1rem" }}>
              <h4>Test URLs:</h4>
              {testUrls.map((testUrl) => (
                <Button
                  key={testUrl.name}
                  kind="tertiary"
                  size="sm"
                  onClick={() => setDirectUrl(testUrl.url)}
                  style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
                >
                  {testUrl.name}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => {
                setMediaId("");
                setDirectUrl("");
                setNotification(null);
              }}
            >
              Clear All
            </Button>
          </Tile>
        </Column>

        <Column lg={8} md={4} sm={4}>
          <Tile style={{ padding: "1rem" }}>
            <h3>Preview Result</h3>

            <div
              style={{
                border: "2px dashed #ccc",
                padding: "1rem",
                borderRadius: "8px",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SliderImagePreview
                mediaId={mediaId || undefined}
                directUrl={directUrl || undefined}
                alt="Test slider image"
                onError={handleError}
                onLoad={handleLoad}
              />
            </div>
          </Tile>
        </Column>
      </Grid>

      <Tile style={{ padding: "1rem" }}>
        <h3>Instructions</h3>
        <ul>
          <li>
            Enter a <strong>Media ID</strong> to test the media service
            integration
          </li>
          <li>
            Enter a <strong>Direct URL</strong> to test direct image loading
          </li>
          <li>Use the test URL buttons to quickly test different scenarios</li>
          <li>
            Toggle <strong>Show Controls</strong> to show/hide the preview
            controls
          </li>
          <li>Check the browser console for detailed logs</li>
          <li>
            The component will automatically use the image proxy for external
            URLs
          </li>
        </ul>

        <h4>Expected Behavior:</h4>
        <ul>
          <li>
            ✅ <strong>Valid URLs</strong> should display the image with
            optional controls
          </li>
          <li>
            ❌ <strong>Invalid URLs</strong> should show an error state with
            retry button
          </li>
          <li>
            ⏳ <strong>Loading</strong> should show a loading indicator
          </li>
          <li>
            🔄 <strong>Retry</strong> should attempt to reload the image
          </li>
          <li>
            🖼️ <strong>No URL</strong> should show &quot;no image&quot;
            placeholder
          </li>
        </ul>
      </Tile>
    </div>
  );
}
