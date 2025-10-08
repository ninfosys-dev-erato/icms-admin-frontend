"use client";

import React from "react";
import { Button, Stack } from "@carbon/react";
import { useTranslations } from "next-intl";
import { MenuItemForm } from "./menu-item-form";
import { MenuItem, Menu } from "../types/navigation";

interface MenuItemEditFormProps {
  menu: Menu;
  menuItem: MenuItem;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  hideActions?: boolean;
  basicOnly?: boolean;
}

export const MenuItemEditForm: React.FC<MenuItemEditFormProps> = ({
  menu,
  menuItem,
  onSuccess,
  onCancel,
  className,
  hideActions,
  basicOnly,
}) => {
  const t = useTranslations("navigation");
  const [titleTab, setTitleTab] = React.useState<"en" | "ne">("en");

  return (
    <div className={`menu-item-edit-form ${className || ""}`}>
      <MenuItemForm
        menu={menu}
        menuItem={menuItem}
        mode="edit"
        onSuccess={onSuccess}
        onCancel={onCancel}
        basicOnly={basicOnly}
        titleTab={titleTab}
        setTitleTab={setTitleTab}
      />
    </div>
  );
};
