"use client";

import React from "react";
import { Tile } from "@carbon/react";
import { useUser } from "../hooks/use-user-queries";
import { StatusBadge } from "./StatusBadge";

export const UserDetail: React.FC<{ id: string }> = ({ id }) => {
  const { data: user } = useUser(id);
  if (!user) return null;

  return (
    <Tile style={{ padding: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>
        {user.firstName} {user.lastName}
      </h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <StatusBadge status={user.status} />
        <span>{user.email}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <div>
          <strong>Role:</strong> {user.role}
        </div>
        <div>
          <strong>Last login:</strong>{" "}
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
        </div>
        <div>
          <strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}
        </div>
        <div>
          <strong>Updated:</strong> {new Date(user.updatedAt).toLocaleString()}
        </div>
      </div>
    </Tile>
  );
};
