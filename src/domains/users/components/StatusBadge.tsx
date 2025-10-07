"use client";

import React from "react";
import { Tag } from "@carbon/react";
import type { UserStatus } from "../types/user";
import { useTranslations } from "next-intl";

export const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const t = useTranslations("users");
  type CarbonTagType =
    | "magenta"
    | "red"
    | "purple"
    | "cyan"
    | "blue"
    | "teal"
    | "green"
    | "gray"
    | "cool-gray"
    | "warm-gray"
    | "high-contrast"
    | "outline";
  const map: Record<UserStatus, { type: CarbonTagType; label: string }> = {
    ACTIVE: { type: "green", label: t("status.active") },
    INACTIVE: { type: "gray", label: t("status.inactive") },
    PENDING: { type: "magenta", label: t("status.pending") },
  } as const;

  const conf = map[status] || map.ACTIVE;
  return (
    <Tag type={conf.type} size="sm">
      {conf.label}
    </Tag>
  );
};
