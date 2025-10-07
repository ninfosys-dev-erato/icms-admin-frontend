"use client";

import React from "react";
import { Toggle } from "@carbon/react";

type Props = {
  isActive: boolean;
  isPublished: boolean;
  onActiveToggle: (checked: boolean) => void;
  onPublishedToggle: (checked: boolean) => void;
  activeLabel: string;
};

export const HeaderCreateToggles: React.FC<Props> = ({
  isActive,
  isPublished,
  onActiveToggle,
  onPublishedToggle,
  activeLabel,
}) => {
  return (
    <div className="form-toggle-section">
      <Toggle
        id="isActive"
        labelText={activeLabel}
        toggled={isActive}
        onToggle={onActiveToggle}
      />

      <div className="form-toggle-spacing">
        <Toggle
          id="isPublished"
          labelText={"Published"}
          toggled={isPublished}
          onToggle={onPublishedToggle}
          disabled={!isActive}
        />
      </div>
    </div>
  );
};
