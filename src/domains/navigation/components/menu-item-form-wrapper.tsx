"use client";

import React from "react";
import { MenuItemCreateForm } from "./menu-item-create-form";
import { MenuItemEditForm } from "./menu-item-edit-form";
import { MenuItem, Menu } from "../types/navigation";

interface MenuItemFormWrapperProps {
  menu: Menu;
  menuItem?: MenuItem;
  parentId?: string;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  hideActions?: boolean;
  basicOnly?: boolean;
}

export const MenuItemFormWrapper: React.FC<MenuItemFormWrapperProps> = ({
  menu,
  menuItem,
  parentId,
  mode,
  onSuccess,
  onCancel,
  className,
  hideActions,
  basicOnly,
}) => {
  if (mode === "create") {
    return (
      <MenuItemCreateForm
        menu={menu}
        parentId={parentId}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
        hideActions={hideActions}
        basicOnly={basicOnly}
      />
    );
  }

  if (mode === "edit" && menuItem) {
    return (
      <MenuItemEditForm
        menu={menu}
        menuItem={menuItem}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
        hideActions={hideActions}
        basicOnly={basicOnly}
      />
    );
  }

  return null;
};
