"use client";

import { OverflowMenu, OverflowMenuItem, Tag } from "@carbon/react";
import { useTranslations } from "next-intl";
import React from "react";
import { HeaderConfig } from "../types/header";

type Props = {
  header: HeaderConfig;
  onEdit: (h: HeaderConfig) => void;
  onDelete: (h: HeaderConfig) => void;
  onView: (h: HeaderConfig) => void;
  onPreview: (h: HeaderConfig) => void;
  onPublish: (h: HeaderConfig) => void;
  onUnpublish: (h: HeaderConfig) => void;
};

const CardInfoRow: React.FC<Props> = ({
  header,
  onEdit,
  onDelete,
  onView,
  onPreview,
  onPublish,
  onUnpublish,
}) => {
  const t = useTranslations("headers");

  return (
    <div className="card-info-row">
      <div className="card-info-left">
        <div className="card-status-line">
          <Tag type={header.isActive ? "blue" : "red"} size="sm">
            {header.isActive ? "Active" : "Inactive"}
          </Tag>
          <Tag type={header.isPublished ? "green" : "gray"} size="sm">
            {header.isPublished ? "Published" : "Draft"}
          </Tag>
        </div>
        {/* keep spacing, name removed from here */}
        <div className="card-name-line" />
      </div>

      <OverflowMenu
        aria-label="Header actions"
        className="overflow"
        iconDescription="More actions"
        size="sm"
      >
        <OverflowMenuItem
          itemText={t("actions.edit") || "Edit"}
          onClick={() => onEdit(header)}
        />
        <OverflowMenuItem
          hasDivider
          isDelete
          itemText={t("actions.delete") || "Delete"}
          onClick={() => onDelete(header)}
        />
      </OverflowMenu>
    </div>
  );
};

export default CardInfoRow;
