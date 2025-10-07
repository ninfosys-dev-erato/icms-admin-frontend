"use client";

import React from "react";
import { useContentUIStore } from "../stores/content-ui-store";
import { CategoryCreateForm } from "./categories/category-create-form";
import { CategoryEditForm } from "./categories/category-edit-form";
import { ContentCreateForm } from "./content-create-form";
import { ContentEditForm } from "./content-edit-form";

export const ContentPanelForms: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const { activeEntity, panelMode, panelContent, panelCategory } =
    useContentUIStore();

  if (activeEntity === "content") {
    if (panelMode === "create")
      return <ContentCreateForm onSuccess={onSuccess} />;
    if (panelMode === "edit" && panelContent)
      return <ContentEditForm content={panelContent} onSuccess={onSuccess} />;
  }

  if (activeEntity === "category") {
    if (panelMode === "create")
      return <CategoryCreateForm onSuccess={onSuccess} />;
    if (panelMode === "edit" && panelCategory)
      return (
        <CategoryEditForm category={panelCategory} onSuccess={onSuccess} />
      );
  }

  return null;
};
