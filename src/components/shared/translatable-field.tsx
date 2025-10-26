"use client";

import { TextArea, TextInput } from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { TranslatableEntity } from "@/domains/content-management/types/content";

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
  // backward-compatible prop used by some domains
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
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
  className = "",
  type = "text",
  multiline = false,
  rows = 4,
  maxLength,
  showCharacterCount = false,
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
}) => {
  const t = useTranslations("content-management");
  const [internalTab, setInternalTab] = useState<"en" | "ne">("en");
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;
  const setActiveTab = controlledSetActiveTab !== undefined ? controlledSetActiveTab : setInternalTab;

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

  // Character count functions
  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getCharacterCountStatus = (text: string) => {
    if (!maxLength) return "normal";
    const count = text.length;
    if (count >= maxLength) return "error";
    if (count >= maxLength * 0.8) return "warning";
    return "normal";
  };

  const isMultiline = multiline || type === "textarea";
  const InputComponent = isMultiline ? TextArea : TextInput;

  return (
    <div className={`translatable-field ${className || ""}`}>
      <div className="translatable-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === "en" ? "active" : ""}`}
          onClick={() => setActiveTab("en")}
          disabled={disabled}
        >
          {t("languages.english")}
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "ne" ? "active" : ""}`}
          onClick={() => setActiveTab("ne")}
          disabled={disabled}
        >
          {t("languages.nepali")}
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
            maxLength={maxLength}
            enableCounter={showCharacterCount}
            {...(type === "textarea" && { rows })}
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
            maxLength={maxLength}
            enableCounter={showCharacterCount}
            {...(type === "textarea" && { rows })}
            {...(required && { required: true })}
          />
        )}
      </div>
    </div>
  );
}; 

export default TranslatableField;