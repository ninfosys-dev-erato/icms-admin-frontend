"use client";

import React from "react";
import { Column, NumberInput, Select, SelectItem } from "@carbon/react";

type Labels = {
  order: string;
  alignment: string;
  left: string;
  center: string;
  right: string;
  justify: string;
};

type Props = {
  orderValue: number;
  onOrderChange: (value: number) => void;
  alignmentValue: string;
  onAlignmentChange: (value: string) => void;
  labels: Labels;
  HeaderAlignment: any; // using same enum from parent
  orderInvalid?: boolean;
  orderInvalidText?: string;
};

export const HeaderCreateBasicRow: React.FC<Props> = ({
  orderValue,
  onOrderChange,
  alignmentValue,
  onAlignmentChange,
  labels,
  HeaderAlignment,
  orderInvalid,
  orderInvalidText,
}) => {
  return (
    <div className="form-row">
      <Column lg={8} md={4} sm={4}>
        <NumberInput
          id="order"
          label={labels.order}
          value={orderValue}
          onChange={(event, { value }) => {
            if (value !== undefined && typeof value === "number") {
              onOrderChange(value);
            }
          }}
          min={1}
          step={1}
          invalid={!!orderInvalid}
          invalidText={orderInvalidText}
        />
      </Column>

      <Column lg={8} md={4} sm={4}>
        <Select
          id="alignment"
          labelText={labels.alignment}
          value={alignmentValue}
          onChange={(event) => onAlignmentChange(event.target.value)}
        >
          <SelectItem value={HeaderAlignment.LEFT} text={labels.left} />
          <SelectItem value={HeaderAlignment.CENTER} text={labels.center} />
          <SelectItem value={HeaderAlignment.RIGHT} text={labels.right} />
          <SelectItem value={HeaderAlignment.JUSTIFY} text={labels.justify} />
        </Select>
      </Column>
    </div>
  );
};
