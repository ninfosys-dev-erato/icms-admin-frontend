"use client";

import React, { useMemo } from "react";
import { Search, Dropdown, Button } from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useUserUIStore } from "../stores/user-ui-store";
import type { UserRole, UserStatus } from "../types/user";
import { useTranslations } from "next-intl";

export const UserFilters: React.FC<{ onChange?: () => void }> = ({
  onChange,
}) => {
  const { currentQuery, setQuery, resetQuery } = useUserUIStore();
  const t = useTranslations("users");

  const roleItems = useMemo(
    () => [
      { id: "ALL", label: t("filters.allRoles") },
      { id: "ADMIN", label: t("roles.admin") },
      { id: "EDITOR", label: t("roles.editor") },
      { id: "VIEWER", label: t("roles.viewer") },
    ],
    [t]
  );

  const statusItems = useMemo(
    () => [
      { id: "ALL", label: t("filters.allStatus") },
      { id: "ACTIVE", label: t("status.active") },
      { id: "INACTIVE", label: t("status.inactive") },
      { id: "PENDING", label: t("status.pending") },
    ],
    [t]
  );

  return (
    <div style={{ padding: "0 1rem 1rem 1rem" }}>
      <div style={{ marginBottom: "0.75rem" }} className="search-box">
        <Search
          id="user-search"
          size="lg"
          labelText={t("filters.search")}
          placeholder={t("filters.search")}
          closeButtonLabelText={t("filters.reset")}
          value={currentQuery.search || ""}
          onChange={(e) => {
            setQuery({ search: e.target.value, page: 1 });
            onChange?.();
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Dropdown
          id="user-role-dropdown"
          size="md"
          label={t("filters.role")}
          titleText={t("filters.role")}
          items={roleItems}
          selectedItem={roleItems.find(
            (i) => i.id === (currentQuery.role || "ALL")
          )}
          itemToString={(item) => (item ? item.label : "")}
          onChange={({ selectedItem }) => {
            const nextRole = (selectedItem?.id as UserRole | "ALL") ?? "ALL";
            setQuery({ role: nextRole, page: 1 });
            onChange?.();
          }}
        />
        <Dropdown
          id="user-status-dropdown"
          size="md"
          label={t("filters.status")}
          titleText={t("filters.status")}
          items={statusItems}
          selectedItem={statusItems.find(
            (i) => i.id === (currentQuery.status || "ALL")
          )}
          itemToString={(item) => (item ? item.label : "")}
          onChange={({ selectedItem }) => {
            const nextStatus =
              (selectedItem?.id as UserStatus | "ALL") ?? "ALL";
            setQuery({ status: nextStatus, page: 1 });
            onChange?.();
          }}
        />
        <Button
          kind="ghost"
          size="md"
          renderIcon={Reset}
          onClick={() => {
            resetQuery();
            onChange?.();
          }}
        >
          {t("filters.reset")}
        </Button>
      </div>
    </div>
  );
};
