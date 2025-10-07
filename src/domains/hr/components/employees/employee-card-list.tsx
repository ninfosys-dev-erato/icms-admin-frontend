"use client";

import React, { useEffect, useState } from "react";
import "../../styles/hr.css";
import { InlineLoading, Pagination, Button } from "@carbon/react";
import { User, Add } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
import type {
  EmployeeResponseDto,
  EmployeeQueryDto,
} from "../../types/employee";
import { useHRUIStore } from "../../stores/hr-ui-store";
import { EmployeeCard } from "./employee-card";

interface EmployeeCardListProps {
  departmentId?: string;
  queryOverrides?: Partial<EmployeeQueryDto>;
  onCreateNew?: () => void;
}

export const EmployeeCardList: React.FC<EmployeeCardListProps> = ({
  departmentId,
  queryOverrides = {},
  onCreateNew,
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

  const handleEdit = (employee: EmployeeResponseDto) => {
    openEditEmployee(employee);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (queryResult.isLoading && employees.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="employee-card-list">
      {employees.length > 0 ? (
        <>
          {/* Employee Cards - Flex layout with wrapping */}
          <div className="employee-flex">
            {employees.map((emp) => (
              <div key={emp.id} className="employee-flex-item">
                <EmployeeCard
                  employee={emp}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="pagination-container">
              <Pagination
                page={pagination.page}
                pageSize={pagination.limit}
                pageSizes={[12, 24, 48, 96]}
                totalItems={pagination.total}
                onChange={({ page, pageSize }) => {
                  if (page !== undefined)
                    setQuery((prev) => ({ ...prev, page }));
                  if (pageSize !== undefined)
                    setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
                }}
                size="md"
              />
            </div>
          )}
        </>
      ) : (
        /* Empty State following IBM Carbon Design Guidelines */
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <User size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
            <p className="empty-state-description">
              {t("list.noEmployeesDescription")}
            </p>
            {onCreateNew && (
              <Button
                kind="primary"
                renderIcon={Add}
                onClick={onCreateNew}
                className="empty-state-action"
              >
                {t("actions.createNew")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
