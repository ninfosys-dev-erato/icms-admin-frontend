"use client";

import React, { useState, useEffect } from "react";
import { TextInput, TextArea } from "@carbon/react";
import { TranslatableEntity } from "../types/office-description";
import { useLanguageFont } from "@/shared/hooks/use-language-font";

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
}) => {
  const [activeTab, setActiveTab] = useState<"en" | "ne">("en");
  const { locale } = useLanguageFont();
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const getCharacterCountStatus = (text: string) => {
    if (!maxLength) return "normal";
    const percentage = (text.length / maxLength) * 100;
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "normal";
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
    const characterCountStatus = showCharacterCount
      ? getCharacterCountStatus(currentValue)
      : "normal";

    // Base props that are common to both TextInput and TextArea
    const baseProps: any = {
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
    };

    // Only include maxLength if it's defined
    if (maxLength) {
      baseProps.maxLength = maxLength;
    }

    // Character count props (only include if showCharacterCount is true)
    const characterCountProps = showCharacterCount ? {
      enableCounter: true,
      count: characterCount,
      countStatus: characterCountStatus,
    } : {};

    if (multiline) {
      return <TextArea {...baseProps} {...characterCountProps} rows={rows} />;
    }

    return <TextInput {...baseProps} {...characterCountProps} />;
  };

  // Don't render tabs until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`translatable-field ${className || ""}`}>
        {renderInput("en")}
      </div>
    );
  }

  return (
    <div className={`translatable-field ${className || ""}`}>
      {/* Custom Tab Navigation */}
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "en" && renderInput("en")}
        {activeTab === "ne" && renderInput("ne")}
      </div>
    </div>
  );
};
