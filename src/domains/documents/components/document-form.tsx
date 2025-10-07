"use client";

import React from "react";
import "../styles/documents.css";
import { DocumentCreateForm } from "./document-create-form";
import { DocumentEditForm } from "./document-edit-form";
import { Document as DocumentType } from "../types/document";

interface DocumentFormProps {
  document?: DocumentType;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  mode,
  onSuccess,
  onCancel,
  className,
}) => {
  if (mode === "create") {
    return (
      <DocumentCreateForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  if (mode === "edit" && document) {
    return (
      <DocumentEditForm
        key={document.id}
        document={document}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  return null;
};
