"use client";

import { useLanguageFont } from "@/shared/hooks/use-language-font";
import { TextArea, TextInput } from "@carbon/react";
import React, { useState } from "react";
import { TranslatableEntity } from "../../types/content";

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
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  sideBySide?: boolean; // New prop to show fields side by side instead of tabs
}

export const TranslatableField: React.FC<TranslatableFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = { en: "", ne: "" },
  invalid = false,
  invalidText,
  disabled = false,
  required = false,
  className = "",
  multiline = false,
  rows = 4,
  maxLength,
  showCharacterCount = false,
  sideBySide = false,
}) => {
  const [activeTab, setActiveTab] = useState<"en" | "ne">("en");
  const { locale } = useLanguageFont();

  const handleLanguageChange = (language: "en" | "ne", newValue: string) => {
    onChange({
      ...value,
      [language]: newValue,
    });
  };

  const getCharacterCount = (text: string) => {
    if (!maxLength) return null;
    return `${text.length}/${maxLength}`;
  };

  const getFontClass = (language: "en" | "ne") => {
    return language === "en" ? "font-en" : "font-ne";
  };

  const renderInput = (language: "en" | "ne") => {
    const currentValue = value[language];
    const currentPlaceholder = placeholder[language];
    const fontClass = getFontClass(language);
    const characterCount = showCharacterCount
      ? getCharacterCount(currentValue)
      : null;

    const commonProps = {
      id: `${label.toLowerCase().replace(/\s+/g, "-")}-${language}`,
      labelText: label,
      value: currentValue,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleLanguageChange(language, e.target.value),
      placeholder: currentPlaceholder,
      invalid: invalid,
      invalidText: invalidText,
      disabled: disabled,
      required: required,
      className: `${fontClass} ${className}`,
      maxLength: maxLength,
      enableCounter: showCharacterCount,
      count: characterCount,
    };

    if (multiline) {
      return <TextArea {...commonProps} rows={rows} />;
    }

    return <TextInput {...commonProps} />;
  };

  return (
    <div className="translatable-field">
      {sideBySide ? (
        <div className="translatable-field-side-by-side">
          <div className="translatable-field-column">{renderInput("en")}</div>
          <div className="translatable-field-column">{renderInput("ne")}</div>
        </div>
      ) : (
        <>
          <div className="translatable-tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === "en" ? "active" : ""}`}
              onClick={() => setActiveTab("en")}
              disabled={disabled}
            >
              English
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "ne" ? "active" : ""}`}
              onClick={() => setActiveTab("ne")}
              disabled={disabled}
            >
              नेपाली
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "en" && renderInput("en")}
            {activeTab === "ne" && renderInput("ne")}
          </div>
        </>
      )}
    </div>
  );
};
