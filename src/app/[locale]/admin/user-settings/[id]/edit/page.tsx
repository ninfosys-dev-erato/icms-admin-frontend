"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Tile } from "@carbon/react";
import { UserForm, useUser } from "@/domains/users";

export default function EditUserPage() {
  const params = useParams();
  const id = String(params?.id);
  const { data: user } = useUser(id);
  const router = useRouter();
  return (
    <div style={{ padding: "2rem" }}>
      <Tile>
        <h1 style={{ marginTop: 0 }}>Edit User</h1>
        {user && (
          <UserForm
            mode="edit"
            user={user}
            onSuccess={() => router.push("..")}
          />
        )}
      </Tile>
    </div>
  );
}
