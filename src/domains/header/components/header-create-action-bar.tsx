"use client";

import React from "react";
import { Button } from "@carbon/react";
import { Reset } from "@carbon/icons-react";

type Props = {
  isSubmitting: boolean;
  isPending: boolean;
  onReset: () => void;
  resetLabel: string;
};

export const HeaderCreateActionBar: React.FC<Props> = ({
  isSubmitting,
  isPending,
  onReset,
  resetLabel,
}) => {
  return (
    <div className="form-action-bar">
      <Button
        kind="ghost"
        size="sm"
        renderIcon={Reset}
        onClick={onReset}
        disabled={isSubmitting || isPending}
        type="button"
      >
        {resetLabel}
      </Button>
    </div>
  );
};
