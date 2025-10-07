"use client";

import React from "react";
import "../../styles/hr.css";
import { Tile, Tag, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { useTranslations } from "next-intl";
import type { EmployeeResponseDto } from "../../types/employee";
import { EmployeePhotoPreview } from "./employee-photo-preview";

interface EmployeeCardProps {
  employee: EmployeeResponseDto;
  onEdit?: (employee: EmployeeResponseDto) => void;
  onDelete?: (id: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("hr-employees");

  return (
    <Tile className="employee-card">
      <div className="card-image">
        <div className="position-badge">
          <Tag type="blue" size="sm">
            #{employee.order}
          </Tag>
        </div>
        <EmployeePhotoPreview
          mediaId={employee.photoMediaId}
          directUrl={employee.photo?.presignedUrl}
          alt={`${employee.name.en || employee.name.ne} photo`}
          className="card-image-preview"
        />
      </div>

      <div className="card-overflow-menu">
        <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
          {onEdit && (
            <OverflowMenuItem
              itemText={t("card.edit")}
              onClick={() => onEdit(employee)}
            />
          )}
          {onDelete && (
            <OverflowMenuItem
              hasDivider
              isDelete
              itemText={t("card.delete")}
              onClick={() => onDelete(employee.id)}
            />
          )}
        </OverflowMenu>
      </div>

      <div className="card-content">
        <h3 className="card-title">
          {employee.name?.en || employee.name?.ne || t("card.noName")}
        </h3>
        <p className="card-subtitle">
          {employee.position?.en || employee.position?.ne || ""}
        </p>
        <div className="card-meta">
          <Tag type={employee.isActive ? "green" : "gray"} size="sm">
            {employee.isActive ? t("card.active") : t("card.inactive")}
          </Tag>
          {employee.department && (
            <Tag type="blue" size="sm">
              {employee.department.departmentName?.en ||
                employee.department.departmentName?.ne ||
                ""}
            </Tag>
          )}
        </div>
      </div>
    </Tile>
  );
};
