"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@carbon/react";
import { View, ViewOff } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { MediaService } from "@/services/media-service";

interface BackgroundPhotoPreviewProps {
  mediaId?: string;
  directUrl?: string;
  alt?: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const BackgroundPhotoPreview: React.FC<BackgroundPhotoPreviewProps> = ({
  mediaId,
  directUrl,
  alt = "Office background photo",
  className = "",
  onError,
  onLoad,
}) => {
  const t = useTranslations("office-settings");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Function to get fresh presigned URL and retry
  const handleImageError = async () => {
    // If we have a mediaId and this is the first retry, try to get a fresh presigned URL
    if (mediaId && retryCount === 0 && !mediaId.startsWith("http")) {
      try {
        setIsLoading(true);
        setHasError(false);

        // Get fresh presigned URL
        const freshUrl = await MediaService.getPresignedUrl(mediaId);
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(freshUrl)}`;

        setImageUrl(proxyUrl);
        setRetryCount(1);
        return;
      } catch (error) {
        console.error("Failed to get fresh presigned URL:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // If retry failed or no mediaId, show error
    setHasError(true);
    onError?.(new Error(`Failed to load image from: ${imageUrl}`));
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!mediaId && !directUrl) {
        setImageUrl(null);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        let url: string;

        // The backend provides presigned URLs, but we need to proxy them to avoid CORS issues
        // Use directUrl if provided (should be a presigned URL from backend)
        // Use mediaId as fallback (though this shouldn't happen with the new backend)
        if (directUrl) {
          // Use image proxy to avoid CORS issues with Backblaze
          url = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`;
        } else if (mediaId) {
          // This is a fallback - the backend should provide presigned URLs
          // If mediaId is a URL, proxy it; otherwise use it directly
          if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
            url = `/api/image-proxy?url=${encodeURIComponent(mediaId)}`;
          } else {
            url = mediaId;
          }
        } else {
          throw new Error("No media ID or direct URL provided");
        }

        setImageUrl(url);
        onLoad?.();
      } catch (error) {
        setHasError(true);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [mediaId, directUrl, onError, onLoad, retryCount]);

  if (!mediaId && !directUrl) {
    return (
      <div className={`background-photo-preview empty ${className}`}>
        <p className="font-dynamic text-secondary">
          {t("backgroundPhoto.preview.noImage")}
        </p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`background-photo-preview error ${className}`}>
        <p className="font-dynamic text-secondary">
          {t("backgroundPhoto.preview.error")}
        </p>
        <Button
          kind="secondary"
          size="sm"
          onClick={() => {
            setRetryCount(0);
            setHasError(false);
            setIsLoading(true);
            // Trigger a re-render by incrementing retry count
            setRetryCount((prev) => prev + 1);
          }}
        >
          {t("backgroundPhoto.preview.retry")}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`background-photo-preview loading ${className}`}>
        <p className="font-dynamic text-secondary">
          {t("backgroundPhoto.preview.loading")}
        </p>
      </div>
    );
  }

  if (!showImage) {
    return (
      <div className={`background-photo-preview hidden ${className}`}>
        <Button
          kind="secondary"
          renderIcon={View}
          onClick={() => setShowImage(true)}
        >
          {t("backgroundPhoto.preview.show")}
        </Button>
      </div>
    );
  }

  return (
    <div className={`background-photo-preview ${className}`}>
      <div className="preview-controls">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ViewOff}
          onClick={() => setShowImage(false)}
          hasIconOnly
          iconDescription={t("backgroundPhoto.preview.hide")}
        />
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className="preview-image"
          onError={handleImageError}
          onLoad={() => {
            onLoad?.();
          }}
        />
      )}
    </div>
  );
};
