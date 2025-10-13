"use client";

import { ImportantLinksContainer } from "@/domains/important-links";
import { useEffect } from "react";

export default function ImportantLinksPage() {
  useEffect(() => {
    console.log("🔍 ImportantLinksPage: Component mounted");
    return () => {
      console.log("🔍 ImportantLinksPage: Component unmounted");
    };
  }, []);

  return <ImportantLinksContainer />;
}
