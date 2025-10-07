"use client";

import React from "react";
import { Dropdown } from "@carbon/react";
import type { UserRole } from "../types/user";
import { useTranslations } from "next-intl";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const t = useTranslations("users");
  const items = [
    { id: "ADMIN", label: t("roles.admin") },
    { id: "EDITOR", label: t("roles.editor") },
    { id: "VIEWER", label: t("roles.viewer") },
  ];

  return (
    <Dropdown
      id="role-selector"
      label={t("form.role.label")}
      titleText={t("form.role.label")}
      items={items}
      selectedItem={items.find((i) => i.id === value)}
      itemToString={(i) => (i ? i.label : "")}
      onChange={({ selectedItem }) =>
        onChange((selectedItem?.id || "VIEWER") as UserRole)
      }
      disabled={disabled}
    />
  );
};
