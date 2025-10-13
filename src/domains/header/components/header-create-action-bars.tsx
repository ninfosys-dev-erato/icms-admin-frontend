"use client";

import React from "react";
import { Button } from "@carbon/react";
import { Reset } from "@carbon/icons-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("headers");
  return (
    <div className="form-action-bar">
      <h3 style={{fontSize: "16px"}}>{t("sections.basicInfo")}</h3>
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
