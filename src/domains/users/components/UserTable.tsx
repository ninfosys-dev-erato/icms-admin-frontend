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
import type { User, UserQuery } from "../types/user";
import { useUserUIStore } from "../stores/user-ui-store";
import { StatusBadge } from "./StatusBadge";
import { useTranslations } from "next-intl";
import { User as UserIcon } from "@carbon/icons-react";
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
  // current query/filters applied for the list (optional)
  query?: UserQuery;
}

export const UserTable: React.FC<Props> = ({
  users,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  query,
}) => {
  const { selectedIds, setSelected } = useUserUIStore();
  const t = useTranslations("users");
  const openEditPanel = useUserUIStore((s) => s.openEditPanel);
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const deleteUser = useDeleteUser();

  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [] as User[];
    const q: Partial<UserQuery> = query ?? {};
    return users.filter((u) => {
      if (q.search && q.search.trim().length > 0) {
        const s = q.search.trim().toLowerCase();
        const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim().toLowerCase();
        const email = (u.email ?? "").toLowerCase();
        if (!name.includes(s) && !email.includes(s)) return false;
      }
      if (q.role && q.role !== "ALL") {
        if (u.role !== q.role) return false;
      }
      if (q.status && q.status !== "ALL") {
        if (u.status !== q.status) return false;
      }
      return true;
    });
  }, [users, query]);

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
      filteredUsers.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        email: u.email,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—",
        actions: "__menu__",
      })),
    [filteredUsers]
  );

  const allSelected = filteredUsers.length > 0 && selectedIds.length === filteredUsers.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredUsers.length;

  const emptyTitle = (() => {
    if (query && query.search) return t('empty.searchTitle', { term: query.search });
    if (query && query.status && query.status !== 'ALL') {
      const statusKey = String(query.status).toLowerCase();
      return t('empty.filteredTitle', { status: t(`status.${statusKey}`, { default: query.status }) });
    }
    return t('list.emptyTitle', { default: '' });
  })();

  const emptyMessage = (() => {
    if (query && query.search) return t('empty.searchMessage');
    if (query && query.status && query.status !== 'ALL') return t('empty.filteredMessage');
    return t('list.emptyDescription', { default: '' });
  })();

  return (
    <>
      {loading && users.length === 0 ? (
        <div className="users-loading-container">
          <InlineLoading description="Loading" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty-state">
          <div className="users-empty-state-content">
            <div className="users-empty-state-icon">
              <UserIcon size={48} />
            </div>
            <h3 className="users-empty-state-title">{emptyTitle}</h3>
            <p className="users-empty-state-description">{emptyMessage}</p>
          </div>
        </div>
      ) : (
        <DataTable rows={rows} headers={headers} isSortable>
          {({ rows, headers, getHeaderProps, getRowProps, getSelectionProps, getTableProps, getTableContainerProps }) => (
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
                        setSelected(selected ? filteredUsers.map((u) => u.id) : []);
                      }}
                    />
                    {headers.map((header) => {
                      const headerProps = getHeaderProps({ header }) as { key?: React.Key } & Record<string, unknown>;
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
                    const rowProps = getRowProps({ row }) as { key?: React.Key } & Record<string, unknown>;
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
                              <StatusBadge status={cell.value as unknown as import("../types/user").UserStatus} />
                            ) : cell.info.header === "actions" ? (
                              <OverflowMenu flipped size="sm" aria-label={t("table.actions.menu")}>
                                <OverflowMenuItem
                                  itemText={t("table.actions.edit")}
                                  onClick={() => {
                                    const user = filteredUsers.find((u) => u.id === (row.id as string));
                                    if (user) openEditPanel(user);
                                  }}
                                />
                                {(() => {
                                  const user = filteredUsers.find((u) => u.id === (row.id as string));
                                  const isActive = user?.status === "ACTIVE";
                                  return (
                                    <OverflowMenuItem
                                      itemText={isActive ? t("table.actions.deactivate") : t("table.actions.activate")}
                                      onClick={() => (isActive ? deactivateUser.mutate(row.id as string) : activateUser.mutate(row.id as string))}
                                    />
                                  );
                                })()}
                                <OverflowMenuItem hasDivider isDelete itemText={t("table.actions.delete")} onClick={() => deleteUser.mutate(row.id as string)} />
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

      {pagination && filteredUsers.length > 0 && (
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