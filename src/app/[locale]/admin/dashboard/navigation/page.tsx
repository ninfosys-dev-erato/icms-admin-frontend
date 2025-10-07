"use client";

import { NavigationContainer } from "@/domains/navigation";
import { useEffect } from "react";

export default function NavigationPage() {
  useEffect(() => {
    // Navigation page mounted
    return () => {
      // Navigation page unmounted
    };
  }, []);

  return <NavigationContainer />;
}
