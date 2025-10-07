"use client";

import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthInitializerProps {
  children: ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({
  children,
}) => {
  const { getCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app load
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

    if (token && !isAuthenticated) {
      // Try to fetch current user if token exists but user is not authenticated
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, the store will handle clearing the auth state
        console.log("Failed to initialize user session");
      });
    }
  }, [getCurrentUser, isAuthenticated]);

  return <>{children}</>;
};
