"use client";

import React from "react";
import { LogoUpload } from "./logo-upload";
import { HeaderFormData } from "../types/header";

type Props = {
  leftLogo: HeaderFormData["logo"]["leftLogo"];
  rightLogo: HeaderFormData["logo"]["rightLogo"];
  isSubmitting: boolean;
  onUploadLeft: (file: File, logoData: any) => void;
  onUploadRight: (file: File, logoData: any) => void;
  onRemoveLeft: () => void;
  onRemoveRight: () => void;
};

export const HeaderCreateLogoSection: React.FC<Props> = ({
  leftLogo,
  rightLogo,
  isSubmitting,
  onUploadLeft,
  onUploadRight,
  onRemoveLeft,
  onRemoveRight,
}) => {
  return (
    <div className="logo-upload-section">
      <div className="form-logo-upload">
        <LogoUpload
          type="left"
          currentLogo={leftLogo}
          onUpload={onUploadLeft}
          onRemove={onRemoveLeft}
          isUploading={false}
          disabled={isSubmitting}
          showPreview={true}
        />
      </div>

      <div className="form-logo-upload--last">
        <LogoUpload
          type="right"
          currentLogo={rightLogo}
          onUpload={onUploadRight}
          onRemove={onRemoveRight}
          isUploading={false}
          disabled={isSubmitting}
          showPreview={true}
        />
      </div>
    </div>
  );
};
