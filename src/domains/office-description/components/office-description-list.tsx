"use client";

import React from "react";
import { InlineLoading } from "@carbon/react";
import { Document } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { OfficeDescription } from "../types/office-description";
import { OfficeDescriptionCard } from "./office-description-card";

interface OfficeDescriptionListProps {
  descriptions: OfficeDescription[];
  onEdit: (description: OfficeDescription) => void;
  onCreate: () => void;
}

export const OfficeDescriptionList: React.FC<OfficeDescriptionListProps> = ({ 
  descriptions, 
  onEdit, 
  onCreate 
}) => {
  const t = useTranslations("office-description");

  if (descriptions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <Document size={48} />
          </div>
          <h3 className="empty-state-title">{t("empty.title")}</h3>
          <p className="empty-state-description">{t("empty.message")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="office-description-list">
      <div className="office-description-flex">
        {descriptions.map((description) => (
          <div key={description.id} className="office-description-flex-item">
            <OfficeDescriptionCard
              description={description}
              onEdit={onEdit}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
