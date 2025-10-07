"use client";

import React from "react";
import { OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/icons-react";

export type RowAction = {
  key: string;
  itemText: string;
  onClick: () => void;
  hasDivider?: boolean;
  isDelete?: boolean;
};

interface RowActionsProps {
  actions: RowAction[];
  ariaLabel?: string;
}

export const RowActions: React.FC<RowActionsProps> = ({ actions, ariaLabel }) => {
  return (
    <OverflowMenu
      flipped
      size="sm"
      aria-label={ariaLabel || "row actions"}
      renderIcon={OverflowMenuVertical}
    >
      {actions.map((a) => (
        <OverflowMenuItem
          key={a.key}
          itemText={a.itemText}
          hasDivider={a.hasDivider}
          isDelete={a.isDelete}
          onClick={a.onClick}
        />
      ))}
    </OverflowMenu>
  );
};

export default RowActions;
