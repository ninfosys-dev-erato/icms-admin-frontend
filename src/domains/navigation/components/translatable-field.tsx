"use client";

import React, { useState } from "react";
import { TextInput, TextArea } from "@carbon/react";
import { useTranslations } from "next-intl";
import { TranslatableEntity } from "../types/navigation";

interface TranslatableFieldProps {
  label: string;
  value: TranslatableEntity;
  onChange: (value: TranslatableEntity) => void;
  placeholder?: TranslatableEntity;
  invalid?: boolean;
  invalidText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  type?: "text" | "textarea";
  activeTab?: "en" | "ne";
  setActiveTab?: (tab: "en" | "ne") => void;
}

export const TranslatableField: React.FC<TranslatableFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  invalid = false,
  invalidText,
  disabled = false,
  required = false,
  className,
  type = "text",
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
}) => {
  const t = useTranslations();
  const [internalTab, setInternalTab] = useState<"en" | "ne">("en");
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalTab;
  const setActiveTab =
    controlledSetActiveTab !== undefined
      ? controlledSetActiveTab
      : setInternalTab;

  // Guard against undefined value to avoid uncontrolled -> controlled warnings
  const safeValue = value ?? { en: "", ne: "" };

  const handleEnglishChange = (newValue: string) => {
    onChange({
      ...safeValue,
      en: newValue,
    });
  };

  const handleNepaliChange = (newValue: string) => {
    onChange({
      ...safeValue,
      ne: newValue,
    });
  };

  const InputComponent = type === "textarea" ? TextArea : TextInput;

  return (
    <div className={`translatable-field ${className || ""}`}>
      <div className="translatable-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === "en" ? "active" : ""}`}
          onClick={() => setActiveTab("en")}
          disabled={disabled}
        >
          {t("languages.english", { default: "English" })}
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "ne" ? "active" : ""}`}
          onClick={() => setActiveTab("ne")}
          disabled={disabled}
        >
          {t("languages.nepali", { default: "नेपाली" })}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "en" && (
          <InputComponent
            id={`${label.toLowerCase().replace(/\s+/g, "-")}-en`}
            labelText={`${label} (English)`}
            value={safeValue.en ?? ""}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => handleEnglishChange(e.target.value)}
            placeholder={placeholder?.en}
            invalid={invalid}
            invalidText={invalidText}
            disabled={disabled}
            className="font-english-only"
            {...(required && { required: true })}
          />
        )}

        {activeTab === "ne" && (
          <InputComponent
            id={`${label.toLowerCase().replace(/\s+/g, "-")}-ne`}
            labelText={`${label} (नेपाली)`}
            value={safeValue.ne ?? ""}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => handleNepaliChange(e.target.value)}
            placeholder={placeholder?.ne}
            invalid={invalid}
            invalidText={invalidText}
            disabled={disabled}
            className="font-ne"
            {...(required && { required: true })}
          />
        )}
      </div>
    </div>
  );
};
