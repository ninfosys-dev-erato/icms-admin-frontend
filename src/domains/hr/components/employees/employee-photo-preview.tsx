"use client";

import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { MediaService } from "@/services/media-service";
import MediaUrlService from "@/services/media-url-service";

interface EmployeePhotoPreviewProps {
  mediaId?: string;
  directUrl?: string;
  alt?: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const EmployeePhotoPreview: React.FC<EmployeePhotoPreviewProps> = ({
  mediaId,
  directUrl,
  alt = "Employee photo",
  className = "",
  onError,
  onLoad,
}) => {
  const t = useTranslations("hr-employees");
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
    onError?.(new Error("Failed to load image"));
  };

  // Function to get presigned URL from fileId
  const getPresignedUrlFromFileId = async (fileId: string) => {
    try {
      const presignedUrl = await MediaService.getPresignedUrl(fileId);
      return presignedUrl;
    } catch (error) {
      console.error("Presigned URL fetch failed:", error);
      throw error;
    }
  };

  const lastSourceKeyRef = useRef<string>("");
  const onLoadRef = useRef<(() => void) | undefined>(onLoad);
  const onErrorRef = useRef<((e: Error) => void) | undefined>(onError);

  useEffect(() => { onLoadRef.current = onLoad; }, [onLoad]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => {
    const sourceKey = `${directUrl ?? ""}|${mediaId ?? ""}`;
    if (sourceKey === lastSourceKeyRef.current) return;
    lastSourceKeyRef.current = sourceKey;

    const loadImage = async () => {
      if (!mediaId && !directUrl) {
        setImageUrl(null);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        let url: string;

        if (directUrl) {
          if (directUrl.startsWith("blob:")) {
            url = directUrl;
          } else {
            url = MediaUrlService.toProxyUrl(directUrl);
          }
        } else if (mediaId) {
          if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
            url = MediaUrlService.toProxyUrl(mediaId);
          } else {
            const presignedUrl = await getPresignedUrlFromFileId(mediaId);
            url = MediaUrlService.toProxyUrl(presignedUrl);
          }
        } else {
          throw new Error("No media ID or direct URL provided");
        }

        setImageUrl((prev) => (prev === url ? prev : url));
        onLoadRef.current?.();
      } catch (error) {
        setHasError(true);
        onErrorRef.current?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [mediaId, directUrl, retryCount]);

  const renderPlaceholder = () => (
    <div className={`employee-photo-preview empty ${className}`}>
      <ImageIcon size={24} />
    </div>
  );

  if (!mediaId && !directUrl) {
    return renderPlaceholder();
  }

  if (hasError) {
    return renderPlaceholder();
  }

  if (isLoading) {
    return (
      <div className={`employee-photo-preview loading ${className}`}>
        <p className="text-secondary">
          {t("form.photo.loading")}
        </p>
      </div>
    );
  }

  if (!showImage) {
    return (
      <div className={`employee-photo-preview hidden ${className}`}>
        {/* hidden */}
      </div>
    );
  }

  return (
    <div className={`employee-photo-preview ${className}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className="preview-image"
          onError={handleImageError}
          onLoad={() => {
            onLoadRef.current?.();
          }}
        />
      )}
    </div>
  );
};
