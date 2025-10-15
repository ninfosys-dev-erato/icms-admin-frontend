"use client";

import React, { useEffect, useState } from "react";
import {
  InlineLoading,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
} from "@carbon/react";
import { User, Building } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
import type {
  EmployeeResponseDto,
  EmployeeQueryDto,
} from "../../types/employee";
import { useHRUIStore } from "../../stores/hr-ui-store";
import { EmployeePhotoPreview } from "./employee-photo-preview";

interface EmployeeListProps {
  departmentId?: string;
  queryOverrides?: Partial<EmployeeQueryDto>;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  departmentId,
  queryOverrides = {},
}) => {
  const t = useTranslations("hr-employees");
  const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
    page: 1,
    limit: 12,
    ...(departmentId ? { departmentId } : {}),
    ...queryOverrides,
  });
  const { openEditEmployee } = useHRUIStore();
  const queryResult = useEmployees(query);
  const deleteMutation = useDeleteEmployee();

  useEffect(() => {
    setQuery((prev) => {
      const nextDept = departmentId || undefined;
      if (prev.departmentId === nextDept && prev.page === 1) return prev;
      return {
        ...prev,
        page: 1,
        ...(nextDept
          ? { departmentId: nextDept }
          : { departmentId: undefined }),
      };
    });
  }, [departmentId]);

  useEffect(() => {
    setQuery((prev) => {
      const next = { ...prev, page: 1, ...queryOverrides };
      const changed =
        JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
      return changed ? next : prev;
    });
  }, [JSON.stringify(queryOverrides)]);

  const data = queryResult.data;
  const employees = (data?.data ?? []) as EmployeeResponseDto[];
  const pagination = data?.pagination;

  if (queryResult.isLoading && employees.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="employee-list">
      {employees.length > 0 ? (
        <TableContainer title={t("list.title")} description={t("subtitle")}>
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{t("form.photo.label")}</TableHeader>
                <TableHeader>{t("form.name.label")}</TableHeader>
                <TableHeader>{t("form.position.label")}</TableHeader>
                <TableHeader>{t("form.department.label")}</TableHeader>
                <TableHeader>{t("card.active")}</TableHeader>
                <TableHeader>{t("card.actions")}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="employee-photo-table-cell">
                      <EmployeePhotoPreview
                        mediaId={emp.photoMediaId}
                        directUrl={emp.photo?.presignedUrl}
                        alt={`${emp.name.en || emp.name.ne} photo`}
                        className="employee-photo-table"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.name.en || emp.name.ne}
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.position?.en || emp.position?.ne || ""}
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.department?.departmentName?.en ||
                      emp.department?.departmentName?.ne ||
                      ""}
                  </TableCell>
                  <TableCell>
                    <Tag type={emp.isActive ? "green" : "gray"} size="sm">
                      {emp.isActive ? t("card.active") : t("card.inactive")}
                    </Tag>
                  </TableCell>
                  <TableCell className="employee-list-actions-cell">
                    <OverflowMenu
                      flipped
                      size="sm"
                      aria-label={t("card.actions")}
                    >
                      <OverflowMenuItem
                        itemText={t("card.edit")}
                        onClick={() => openEditEmployee(emp)}
                      />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={t("card.delete")}
                        onClick={() => deleteMutation.mutate(emp.id)}
                      />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <User size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
            <p className="empty-state-description">
              {t("list.noEmployeesDescription")}
            </p>
          </div>
        </div>
      )}

      {!!pagination && employees.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={query.page || pagination.page}
            pageSize={query.limit || pagination.limit}
            pageSizes={[12, 24, 48, 96]}
            totalItems={pagination.total}
            onChange={({ page, pageSize }) => {
              // Always update both page and pageSize for consistency
              setQuery((prev) => ({
                ...prev,
                page: page ?? prev.page ?? 1,
                limit: pageSize ?? prev.limit ?? 12,
              }));
            }}
            size="md"
          />
        </div>
      )}
    </div>
  );
};
