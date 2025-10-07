"use client";

import React from "react";
import { ImportantLinksCreateForm } from "./important-links-create-form";
import { ImportantLinksEditForm } from "./important-links-edit-form";
import { ImportantLink } from "../types/important-links";

interface ImportantLinksFormProps {
  link?: ImportantLink;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Wrapper component to render either Create or Edit form
 * based on the `mode` prop.
 */
export const ImportantLinksForm: React.FC<ImportantLinksFormProps> = ({
  link,
  mode,
  onSuccess,
  onCancel,
  className,
}) => {
  // --------------------------
  // Render Create Form
  // --------------------------
  if (mode === "create") {
    return (
      <ImportantLinksCreateForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  // --------------------------
  // Render Edit Form
  // --------------------------
  if (mode === "edit" && link) {
    return (
      <ImportantLinksEditForm
        key={link.id} // ensures re-mount if switching between links
        link={link}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  // --------------------------
  // Fallback: render nothing
  // --------------------------
  return null;
};
