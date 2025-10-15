"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Tile, Button } from "@carbon/react";
import { UserDetail } from "@/domains/users";

export default function UserDetailPage() {
  const params = useParams();
  const id = String(params?.id);
  const router = useRouter();
  return (
    <div style={{ padding: "2rem" }}>
      <Tile>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ marginTop: 0 }}>User Detail</h1>
          <Button kind="secondary" onClick={() => router.push("./edit")}>
            Edit
          </Button>
        </div>
        <UserDetail id={id} />
      </Tile>
    </div>
  );
}
