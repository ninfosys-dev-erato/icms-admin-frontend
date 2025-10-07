
"use client";

import React from "react";
import { Button, Stack } from "@carbon/react";
import { useTranslations } from "next-intl";
import { MenuItemForm } from "./menu-item-form";
import { Menu } from "../types/navigation";

interface MenuItemCreateFormProps {
  menu: Menu;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  hideActions?: boolean;
  basicOnly?: boolean;
}

export const MenuItemCreateForm: React.FC<MenuItemCreateFormProps> = ({
  menu,
  parentId,
  onSuccess,
  onCancel,
  className,
  hideActions,
  basicOnly,
}) => {
  const t = useTranslations("navigation");

  return (
    <div className={`menu-item-create-form ${className || ""}`}>
      <MenuItemForm
        menu={menu}
        parentId={parentId}
        mode="create"
        onSuccess={onSuccess}
        onCancel={onCancel}
        basicOnly={basicOnly}
      />
    </div>
  );
};
