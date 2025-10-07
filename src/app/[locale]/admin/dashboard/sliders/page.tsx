"use client";

import { SliderContainer } from "@/domains/sliders";
import { useEffect } from "react";

export default function SlidersPage() {
  useEffect(() => {
    console.log("🔍 SlidersPage: Component mounted");
    return () => {
      console.log("🔍 SlidersPage: Component unmounted");
    };
  }, []);

  return <SliderContainer />;
}
