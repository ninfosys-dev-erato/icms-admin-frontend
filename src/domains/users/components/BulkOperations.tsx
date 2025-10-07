"use client";

import React from "react";
import { Button, ButtonSet } from "@carbon/react";
import { useUserUIStore } from "../stores/user-ui-store";
import {
  useBulkActivateUsers,
  useBulkDeactivateUsers,
  useBulkDeleteUsers,
} from "../hooks/use-user-queries";

export const BulkOperations: React.FC = () => {
  const { selectedIds, clearSelected } = useUserUIStore();
  const bulkActivate = useBulkActivateUsers();
  const bulkDeactivate = useBulkDeactivateUsers();
  const bulkDelete = useBulkDeleteUsers();

  const disabled = selectedIds.length === 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem 1rem 1rem",
      }}
    >
      <div style={{ color: "var(--cds-text-secondary)" }}>
        {selectedIds.length} selected
      </div>
      <ButtonSet>
        <Button
          kind="secondary"
          disabled={disabled}
          onClick={async () => {
            await bulkActivate.mutateAsync(selectedIds);
            clearSelected();
          }}
        >
          Activate
        </Button>
        <Button
          kind="tertiary"
          disabled={disabled}
          onClick={async () => {
            await bulkDeactivate.mutateAsync(selectedIds);
            clearSelected();
          }}
        >
          Deactivate
        </Button>
        <Button
          kind="danger"
          disabled={disabled}
          onClick={async () => {
            await bulkDelete.mutateAsync(selectedIds);
            clearSelected();
          }}
        >
          Delete
        </Button>
      </ButtonSet>
    </div>
  );
};
