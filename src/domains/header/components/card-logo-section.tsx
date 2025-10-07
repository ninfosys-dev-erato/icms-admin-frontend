"use client";

import React from "react";
import { HeaderConfig } from "../types/header";
import { HeaderLogoPreview } from "./header-logo-preview";
import { HeaderService } from "../services/header-service";
import MediaUrlService from "@/services/media-url-service";

type Props = {
  header: HeaderConfig;
  hasLeftLogo: boolean;
  hasRightLogo: boolean;
};

const CardLogoSection: React.FC<Props> = ({ header, hasLeftLogo, hasRightLogo }) => {
  return (
    <div className="card-logo-section">
      <div className="card-logo-grid">
        {hasLeftLogo && (
          <div className="card-logo-item left">
            {/* Title badge INSIDE the left-logo box */}
            <div className="logo-title-badge">
              {HeaderService.getDisplayName(header)}
            </div>

            {(() => {
              const leftLogoData = MediaUrlService.getImageSourceFromHeaderLogo(
                header.logo!.leftLogo!
              );
              return (
                <HeaderLogoPreview
                  mediaId={leftLogoData.mediaId}
                  presignedUrl={leftLogoData.directUrl}
                  alt={leftLogoData.alt || "Left logo"}
                  width={header.logo!.leftLogo?.width || 200}
                  height={header.logo!.leftLogo?.height || 80}
                />
              );
            })()}
            {/* caption removed */}
          </div>
        )}

        {hasRightLogo && (
          <div className="card-logo-item right">
            {(() => {
              const rightLogoData = MediaUrlService.getImageSourceFromHeaderLogo(
                header.logo!.rightLogo!
              );
              return (
                <HeaderLogoPreview
                  mediaId={rightLogoData.mediaId}
                  presignedUrl={rightLogoData.directUrl}
                  alt={rightLogoData.alt || "Right logo"}
                  width={header.logo!.rightLogo?.width || 200}
                  height={header.logo!.rightLogo?.height || 80}
                />
              );
            })()}
            {/* caption removed */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardLogoSection;
