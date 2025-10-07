"use client";

import React from "react";
import { Tile } from "@carbon/react";
import { BulkOperations } from "@/domains/users";

export default function BulkOperationsPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <Tile>
        <h1 style={{ marginTop: 0 }}>Bulk Operations</h1>
        <BulkOperations />
      </Tile>
    </div>
  );
}
