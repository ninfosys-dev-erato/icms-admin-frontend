"use client";

import React, { useMemo } from "react";
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectAll,
  TableSelectRow,
  Pagination,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import type { User } from "../types/user";
import { useUserUIStore } from "../stores/user-ui-store";
import { StatusBadge } from "./StatusBadge";
import { useTranslations } from "next-intl";
import {
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
} from "../hooks/use-user-queries";

interface Props {
  users: User[];
  loading?: boolean;
  pagination?: { page: number; limit: number; total: number };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const UserTable: React.FC<Props> = ({
  users,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const { selectedIds, setSelected } = useUserUIStore();
  const t = useTranslations("users");
  const openEditPanel = useUserUIStore((s) => s.openEditPanel);
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const deleteUser = useDeleteUser();

  const headers = useMemo(
    () => [
      { key: "name", header: t("table.headers.name") },
      { key: "email", header: t("table.headers.email") },
      { key: "role", header: t("table.headers.role") },
      { key: "status", header: t("table.headers.status") },
      { key: "lastLoginAt", header: t("table.headers.lastLogin") },
      { key: "actions", header: t("table.actions.menu") },
    ],
    [t]
  );

  const rows = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt
          ? new Date(u.lastLoginAt).toLocaleString()
          : "—",
        actions: "__menu__",
      })),
    [users]
  );

  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  return (
    <>
      {loading && users.length === 0 ? (
        <div className="loading-container">
          <InlineLoading description="Loading" />
        </div>
      ) : (
        <DataTable rows={rows} headers={headers} isSortable>
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getSelectionProps,
            getTableProps,
            getTableContainerProps,
          }) => (
            <TableContainer title={t("title")} {...getTableContainerProps()}>
              <Table {...getTableProps()} size="md">
                <TableHead>
                  <TableRow>
                    <TableSelectAll
                      {...getSelectionProps()}
                      checked={allSelected}
                      indeterminate={someSelected}
                      onSelect={(e) => {
                        const selected = (e.currentTarget as HTMLInputElement).checked;
                        setSelected(selected ? users.map((u) => u.id) : []);
                      }}
                    />
                    {headers.map((header) => {
                      const headerProps = getHeaderProps({ header }) as {
                        key?: React.Key;
                      } & Record<string, unknown>;
                      const { key: _key, ...rest } = headerProps;
                      return (
                        <TableHeader key={header.key} {...rest}>
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const rowProps = getRowProps({ row }) as {
                      key?: React.Key;
                    } & Record<string, unknown>;
                    const { key: _key, ...rest } = rowProps;
                    return (
                      <TableRow key={row.id} {...rest}>
                        <TableSelectRow
                          {...getSelectionProps({ row })}
                          checked={selectedIds.includes(row.id as string)}
                          onSelect={(e) => {
                            const selected = (e.currentTarget as HTMLInputElement).checked;
                            const id = row.id as string;
                            setSelected(
                              selected
                                ? Array.from(new Set([...selectedIds, id]))
                                : selectedIds.filter((x) => x !== id)
                            );
                          }}
                        />
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === "status" ? (
                              <StatusBadge
                                status={
                                  cell.value as unknown as import("../types/user").UserStatus
                                }
                              />
                            ) : cell.info.header === "actions" ? (
                              <OverflowMenu
                                flipped
                                size="sm"
                                aria-label={t("table.actions.menu")}
                              >
                                <OverflowMenuItem
                                  itemText={t("table.actions.edit")}
                                  onClick={() => {
                                    const user = users.find(
                                      (u) => u.id === (row.id as string)
                                    );
                                    if (user) openEditPanel(user);
                                  }}
                                />
                                {(() => {
                                  const user = users.find(
                                    (u) => u.id === (row.id as string)
                                  );
                                  const isActive = user?.status === "ACTIVE";
                                  return (
                                    <OverflowMenuItem
                                      itemText={
                                        isActive
                                          ? t("table.actions.deactivate")
                                          : t("table.actions.activate")
                                      }
                                      onClick={() =>
                                        isActive
                                          ? deactivateUser.mutate(row.id as string)
                                          : activateUser.mutate(row.id as string)
                                      }
                                    />
                                  );
                                })()}
                                <OverflowMenuItem
                                  hasDivider
                                  isDelete
                                  itemText={t("table.actions.delete")}
                                  onClick={() => deleteUser.mutate(row.id as string)}
                                />
                              </OverflowMenu>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}

      {pagination && (
        <div className="pagination-container">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
            pageSizes={[12, 24, 48, 96]}
            totalItems={pagination.total}
            onChange={({ page, pageSize }) => {
              if (page !== undefined) onPageChange?.(page);
              if (pageSize !== undefined) onPageSizeChange?.(pageSize);
            }}
            size="md"
          />
        </div>
      )}
    </>
  );
};
