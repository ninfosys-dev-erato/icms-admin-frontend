"use client";

import React from "react";
import { SliderCreateForm } from "./slider-create-form";
import { SliderEditForm } from "./slider-edit-form";
import { Slider } from "../types/slider";

interface SliderFormProps {
  slider?: Slider;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SliderForm: React.FC<SliderFormProps> = ({
  slider,
  mode,
  onSuccess,
  onCancel,
  className,
}) => {
  if (mode === "create") {
    return (
      <SliderCreateForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  if (mode === "edit" && slider) {
    return (
      <SliderEditForm
        key={slider.id}
        slider={slider}
        onSuccess={onSuccess}
        onCancel={onCancel}
        className={className}
      />
    );
  }

  return null;
};
