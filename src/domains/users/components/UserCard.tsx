"use client";

import React from "react";
import { Tile, Button, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { User } from "../types/user";
import { StatusBadge } from "./StatusBadge";

interface Props {
  user: User;
  onEdit?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export const UserCard: React.FC<Props> = ({
  user,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const isActive = user.status === "ACTIVE";

  return (
    <Tile className="slider-card slider-card--compact slider-flex-item">
      <div className="card-content card-content--compact">
        <h3
          className="card-title card-title--compact"
          style={{ marginBottom: 4 }}
        >
          {name}
        </h3>
        <div
          className="card-meta"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <StatusBadge status={user.status} />
          <span style={{ color: "var(--cds-text-secondary)", fontSize: 12 }}>
            {user.email}
          </span>
        </div>
      </div>
      <div className="card-overflow-menu">
        <OverflowMenu flipped size="sm" aria-label="Actions">
          <OverflowMenuItem itemText="Edit" onClick={() => onEdit?.(user)} />
          {isActive ? (
            <OverflowMenuItem
              itemText="Deactivate"
              onClick={() => onDeactivate?.(user)}
            />
          ) : (
            <OverflowMenuItem
              itemText="Activate"
              onClick={() => onActivate?.(user)}
            />
          )}
          <OverflowMenuItem
            hasDivider
            isDelete
            itemText="Delete"
            onClick={() => onDelete?.(user)}
          />
        </OverflowMenu>
      </div>
    </Tile>
  );
};
