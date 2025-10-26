
"use client";

import React from "react";
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@carbon/react";
import "./confirm-delete-modal.css";
import { WarningAltFilled } from "@carbon/icons-react";
import { useTranslations } from "next-intl";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  title = "Confirm Deletion",
  subtitle = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations("navigation");

  // Use provided labels if passed; otherwise translate.
  const cancelText =
    cancelLabel ?? t("actions.cancel", { default: "Cancel" });
  const confirmText =
    confirmLabel ?? t("actions.delete", { default: "Delete" });

  return (
    <ComposedModal open={open} onClose={onCancel} className="confirm-delete-modal">
      <ModalHeader title={title} iconDescription="close modal">
        {/* empty - Carbon renders the title */}
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{subtitle}</p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default ConfirmDeleteModal;
