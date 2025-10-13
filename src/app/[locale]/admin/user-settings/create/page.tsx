"use client";

import React from "react";
import { Tile } from "@carbon/react";
import { UserForm } from "@/domains/users";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();
  return (
    <div style={{ padding: "2rem" }}>
      <Tile>
        <h1 style={{ marginTop: 0 }}>Create User</h1>
        <UserForm
          mode="create"
          onSuccess={() => router.push("../user-settings")}
        />
      </Tile>
    </div>
  );
}
