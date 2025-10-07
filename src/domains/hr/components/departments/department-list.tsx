"use client";

import React, { useEffect, useState } from "react";
import "../../styles/hr.css";
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
import { Building, User } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import {
  useDeleteDepartment,
  useDepartments,
} from "../../hooks/use-hr-queries";
import type {
  DepartmentResponseDto,
  DepartmentQueryDto,
} from "../../types/department";
import { useHRUIStore } from "../../stores/hr-ui-store";

interface DepartmentListProps {
  queryOverrides?: Partial<DepartmentQueryDto>;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  queryOverrides = {},
}) => {
  const t = useTranslations("hr-departments");
  const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
    page: 1,
    limit: 12,
    ...queryOverrides,
  });
  const { openEditDepartment } = useHRUIStore();
  const queryResult = useDepartments(query);
  const deleteMutation = useDeleteDepartment();

  useEffect(() => {
    setQuery((prev) => {
      const next = { ...prev, page: 1, ...queryOverrides };
      const changed =
        JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
      return changed ? next : prev;
    });
  }, [JSON.stringify(queryOverrides)]);

  const data = queryResult.data;
  const departments = (data?.data ?? []) as DepartmentResponseDto[];
  const pagination = data?.pagination;

  if (queryResult.isLoading && departments.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="department-list">
      {departments.length > 0 ? (
        <TableContainer title={t("list.title")} description={t("subtitle")}>
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{t("form.name.label")}</TableHeader>
                <TableHeader>{t("card.parentDepartment")}</TableHeader>
                <TableHeader>{t("card.departmentHead")}</TableHeader>
                <TableHeader>{t("card.employeeCount")}</TableHeader>
                <TableHeader>{t("card.active")}</TableHeader>
                <TableHeader>{t("card.actions")}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-en">
                    {dept.departmentName.en || dept.departmentName.ne}
                  </TableCell>
                  <TableCell className="font-en">
                    {dept.parent?.departmentName?.en ||
                      dept.parent?.departmentName?.ne ||
                      ""}
                  </TableCell>
                  <TableCell className="font-en">
                    {dept.departmentHead
                      ? dept.departmentHead.name.en ||
                        dept.departmentHead.name.ne
                      : ""}
                  </TableCell>
                  <TableCell>{dept.employees?.length ?? 0}</TableCell>
                  <TableCell>
                    <Tag type={dept.isActive ? "green" : "gray"} size="sm">
                      {dept.isActive ? t("card.active") : t("card.inactive")}
                    </Tag>
                  </TableCell>
                  <TableCell className="department-list-actions-cell">
                    <OverflowMenu
                      flipped
                      size="sm"
                      aria-label={t("card.actions")}
                    >
                      <OverflowMenuItem
                        itemText={t("card.edit")}
                        onClick={() => openEditDepartment(dept)}
                      />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={t("card.delete")}
                        onClick={() => deleteMutation.mutate(dept.id)}
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
              <Building size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
            <p className="empty-state-description">
              {t("list.noDepartmentsDescription")}
            </p>
          </div>
        </div>
      )}

      {!!pagination && departments.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
            pageSizes={[12, 24, 48, 96]}
            totalItems={pagination.total}
            onChange={({ page, pageSize }) => {
              if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
              if (pageSize !== undefined)
                setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
            }}
            size="md"
          />
        </div>
      )}
    </div>
  );
};
