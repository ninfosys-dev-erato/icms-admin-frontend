"use client";

import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { MediaService } from "@/services/media-service";
import MediaUrlService from "@/services/media-url-service";

interface HeaderLogoPreviewProps {
  mediaId?: string;
  presignedUrl?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const HeaderLogoPreview: React.FC<HeaderLogoPreviewProps> = ({
  mediaId,
  presignedUrl,
  alt = "Header logo",
  className = "",
  width = 200,
  height = 80,
  onError,
  onLoad,
}) => {
  // Debug logging
  // console.log("🔍 HeaderLogoPreview - Props:", {
  //   mediaId,
  //   presignedUrl,
  //   alt,
  //   width,
  //   height,
  // });
  const t = useTranslations("headers");
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

        // Get fresh presigned URL using MediaService
        const freshUrl = await MediaService.getPresignedUrl(mediaId);
        const proxyUrl = MediaUrlService.toProxyUrl(freshUrl);

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
    onError?.(new Error("Failed to load logo"));
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

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    const sourceKey = `${presignedUrl ?? ""}|${mediaId ?? ""}`;
    if (sourceKey === lastSourceKeyRef.current) return;
    lastSourceKeyRef.current = sourceKey;

    const loadImage = async () => {
      // console.log("🔍 HeaderLogoPreview - loadImage called with:", {
      //   mediaId,
      //   presignedUrl,
      // });

      if (!mediaId && !presignedUrl) {
        // console.log(
        //   "🔍 HeaderLogoPreview - No mediaId or presignedUrl, setting imageUrl to null"
        // );
        setImageUrl(null);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        let url: string;

        if (presignedUrl) {
          if (presignedUrl.startsWith("blob:")) {
            url = presignedUrl;
          } else {
            url = MediaUrlService.toProxyUrl(presignedUrl);
          }
          // console.log("🔍 HeaderLogoPreview - Using presignedUrl:", {
          //   presignedUrl,
          //   proxyUrl: url,
          // });
        } else if (mediaId) {
          if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
            url = MediaUrlService.toProxyUrl(mediaId);
            // console.log("🔍 HeaderLogoPreview - Using mediaId as URL:", {
            //   mediaId,
            //   proxyUrl: url,
            // });
          } else {
            // console.log(
            //   "🔍 HeaderLogoPreview - Fetching presigned URL for mediaId:",
            //   mediaId
            // );
            const presignedUrl = await getPresignedUrlFromFileId(mediaId);
            url = MediaUrlService.toProxyUrl(presignedUrl);
            // console.log("🔍 HeaderLogoPreview - Got presigned URL:", {
            //   presignedUrl,
            //   proxyUrl: url,
            // });
          }
        } else {
          throw new Error("No media ID or presigned URL provided");
        }

        // console.log("🔍 HeaderLogoPreview - Final URL:", url);
        setImageUrl((prev) => (prev === url ? prev : url));
        onLoadRef.current?.();
      } catch (error) {
        console.error("🔍 HeaderLogoPreview - Error in loadImage:", error);
        setHasError(true);
        onErrorRef.current?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [mediaId, presignedUrl, retryCount]);

  const renderPlaceholder = () => (
    <div
      className={`header-logo-preview empty ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--cds-ui-02)",
        border: "1px dashed var(--cds-ui-03)",
        borderRadius: "4px",
      }}
    >
      <ImageIcon size={24} />
    </div>
  );

  if (!mediaId && !presignedUrl) {
    return renderPlaceholder();
  }

  if (hasError) {
    return renderPlaceholder();
  }

  if (isLoading) {
    return (
      <div
        className={`header-logo-preview loading ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--cds-ui-02)",
          borderRadius: "4px",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--cds-text-02)" }}>
          {t("image.preview.loading") || "Loading..."}
        </p>
      </div>
    );
  }

  if (!showImage) {
    return (
      <div className={`header-logo-preview hidden ${className}`}>
        {/* hidden */}
      </div>
    );
  }

  return (
    <div className={`header-logo-preview ${className}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            objectFit: "contain",
            borderRadius: "4px",
          }}
          onError={handleImageError}
          onLoad={() => {
            onLoadRef.current?.();
          }}
        />
      )}
    </div>
  );
};
