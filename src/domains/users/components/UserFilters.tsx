"use client";

import React, { useMemo, useState, useEffect } from "react";
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

  const [searchTerm, setSearchTerm] = useState<string>(currentQuery.search ?? "");

  // Initialize searchTerm from store on mount only. After mount, avoid overwriting
  // the user's in-progress input from `currentQuery.search` (which may be trimmed)
  // — this prevents removing spaces the user types.
  React.useEffect(() => {
    setSearchTerm(currentQuery.search ?? "");
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce live search: apply searchTerm to query after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      const next = searchTerm?.trim() || undefined;
      // Only update if the value changed
      if ((currentQuery.search ?? undefined) !== next) {
        setQuery((prev) => ({ ...prev, search: next, page: 1 }));
        onChange?.();
      }
    }, 300);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Search
          id="user-search"
          size="lg"
          labelText={t("filters.search")}
          placeholder={t("filters.search")}
          closeButtonLabelText={t("filters.reset")}
          value={searchTerm}
          onChange={(e) => {
            // keep local input in sync while typing
            setSearchTerm(e.target.value);
          }}
          onKeyDown={(e) => {
            // Support Enter to submit
            if (e.key === 'Enter') {
              const next = searchTerm?.trim() || undefined;
              if ((currentQuery.search ?? undefined) !== next) {
                setQuery((prev) => ({ ...prev, search: next, page: 1 }));
                onChange?.();
              }
            }
          }}
        />
        </div>
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
            setQuery((prev) => ({ ...prev, role: nextRole, page: 1 }));
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
            setQuery((prev) => ({ ...prev, status: nextStatus, page: 1 }));
            onChange?.();
          }}
        />
        <Button
          kind="ghost"
          size="md"
          renderIcon={Reset}
          onClick={() => {
            resetQuery();
            // also clear local search input
            setSearchTerm('');
            onChange?.();
          }}
        >
          {t("filters.reset")}
        </Button>
      </div>
    </div>
  );
};
