"use client";

import React from "react";
import { InlineLoading } from "@carbon/react";

type Props = { description: string };

export const HeaderCreateInlineLoading: React.FC<Props> = ({ description }) => {
  return (
    <div className="form-inline-loading">
      <InlineLoading description={description} />
    </div>
  );
};
