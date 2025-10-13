"use client";

import React from "react";
import { Layer } from "@carbon/react";
import "../styles/users.css";
import { useUsers } from "../hooks/use-user-queries";
import { useUserUIStore } from "../stores/user-ui-store";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";

export const UserList: React.FC<{ hideHeader?: boolean }> = ({
  hideHeader = false,
}) => {
  const { currentQuery, setQuery } = useUserUIStore();
  // Pass the whole currentQuery (normalize undefined) so React Query key changes when any filter changes
  const normalizedQuery = {
    page: currentQuery.page,
    limit: currentQuery.limit,
    search: currentQuery.search ?? undefined,
    role: currentQuery.role,
    status: currentQuery.status,
    order: currentQuery.order,
    sort: currentQuery.sort,
  };

  // removed debug logging

  const { data, isLoading } = useUsers(normalizedQuery);

  return (
    <Layer className="users-container">
      {!hideHeader && (
        <div style={{ padding: "2rem 1rem 1rem 1rem" }}>
          {/* Header is now provided by UserContainer when used there */}
        </div>
      )}

      <UserFilters onChange={() => setQuery((prev) => ({ ...prev, page: 1 }))} />

      {/* no debug banner */}

      <div style={{ padding: "0 1rem 2rem 1rem", textAlign: "left" }}>
        <UserTable
          users={data?.data ?? []}
          loading={isLoading}
          query={currentQuery}
          pagination={
            data?.pagination
              ? {
                  page: data.pagination.page,
                  limit: data.pagination.limit,
                  total: data.pagination.total,
                }
              : undefined
          }
          onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          onPageSizeChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
        />
      </div>
    </Layer>
  );
};
