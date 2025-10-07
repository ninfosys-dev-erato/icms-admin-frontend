"use client";

import React from "react";
import { MenuCreateForm } from "./menu-create-form";
import { MenuEditForm } from "./menu-edit-form";
import { Menu } from "../types/navigation";

interface MenuFormProps {
  menu?: Menu;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  menu,
  mode,
  onSuccess,
  onCancel,
  className,
}) => {
  if (mode === "create") {
    return (
      <MenuCreateForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  if (mode === "edit" && menu) {
    return (
      <MenuEditForm
        key={menu.id}
        menu={menu}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  return null;
};
