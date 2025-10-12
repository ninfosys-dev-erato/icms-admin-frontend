"use client";

import React from "react";
import { Tag, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { Edit, OverflowMenuVertical } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { OfficeDescription, OfficeDescriptionType } from "../types/office-description";

interface OfficeDescriptionCardProps {
  description: OfficeDescription;
  onEdit: (description: OfficeDescription) => void;
  onDelete?: (description: OfficeDescription) => void;
}
export const OfficeDescriptionCard: React.FC<OfficeDescriptionCardProps> = ({ 
  description, 
  onEdit,
  onDelete 
}) => {
  const t = useTranslations("office-description");

  const getTypeColor = (type: OfficeDescriptionType): "blue" | "green" | "purple" | "warm-gray" | "cyan" | "magenta" => {
    const colorMap: Record<OfficeDescriptionType, "blue" | "green" | "purple" | "warm-gray" | "cyan" | "magenta"> = {
      [OfficeDescriptionType.INTRODUCTION]: "blue",
      [OfficeDescriptionType.OBJECTIVE]: "green",
      [OfficeDescriptionType.WORK_DETAILS]: "purple",
      [OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE]: "warm-gray",
      [OfficeDescriptionType.DIGITAL_CHARTER]: "cyan",
      [OfficeDescriptionType.EMPLOYEE_SANCTIONS]: "magenta",
    };
    return colorMap[type] || "blue";
  };

  const getTypeLabel = (type: OfficeDescriptionType): string => {
    return t(`types.${type}`);
  };

  const truncateContent = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderContent = () => {
    const hasEnglish = description.content.en && description.content.en.trim();
    const hasNepali = description.content.ne && description.content.ne.trim();

    if (!hasEnglish && !hasNepali) {
      return (
        <div className="card-content-text">
          <em>{t("card.noContent")}</em>
        </div>
      );
    }

    return (
      <div className="card-content-text">
        {hasEnglish && (
          <div className="content-english">
            {truncateContent(description.content?.en ?? "")}
          </div>
        )}
        {hasNepali && (
          <div className="content-nepali">
            {truncateContent(description.content?.ne ?? "")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="office-description-card">
      <div className="card-content">
        <div className="card-header">
          <div className="card-title-section">
            <Tag 
              type={getTypeColor(description.officeDescriptionType)} 
              size="sm"
              className="type-badge"
            >
              {getTypeLabel(description.officeDescriptionType)}
            </Tag>
          </div>
          <OverflowMenu 
            flipped 
            size="sm" 
            aria-label={t("card.actions")}
            renderIcon={OverflowMenuVertical}
            className="card-overflow-menu"
          >
            <OverflowMenuItem 
              itemText={t("card.edit")}
              onClick={() => onEdit(description)}
            />
            <OverflowMenuItem
              hasDivider
              isDelete
              itemText={t("actions.delete") || "Delete"}
              onClick={() => onDelete && onDelete(description)}
            />
          </OverflowMenu>
        </div>
        
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 