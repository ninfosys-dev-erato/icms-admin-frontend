"use client";

import React from "react";
import { HeaderCreateForm } from "./header-create-form";
import { HeaderEditForm } from "./header-edit-form";
import { HeaderConfig } from "../types/header";

interface HeaderFormProps {
  header?: HeaderConfig;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const HeaderForm: React.FC<HeaderFormProps> = ({
  header,
  mode,
  onSuccess,
  onCancel,
  className,
}) => {
  if (mode === "create") {
    return (
      <HeaderCreateForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  if (mode === "edit" && header) {
    return (
      <HeaderEditForm
        key={header.id}
        header={header}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  return null;
};
