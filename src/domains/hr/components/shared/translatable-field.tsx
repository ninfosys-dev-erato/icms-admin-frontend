"use client";

import React, { useState } from "react";
import { TextInput, TextArea } from "@carbon/react";
import { TranslatableEntityDto } from "../../types/common";
import { useLanguageFont } from "@/shared/hooks/use-language-font";

interface TranslatableFieldProps {
  label: string;
  value: TranslatableEntityDto;
  onChange: (value: TranslatableEntityDto) => void;
  placeholder?: TranslatableEntityDto;
  invalid?: boolean;
  invalidText?: string;
  /**
   * Optional per-language invalid flags/messages. When provided, these override the top-level
   * invalid/invalidText for the specific language input only. This lets us show a validation error
   * (e.g. "Nepali field is required") under just the Nepali input instead of both.
   */
  invalidMessages?: {
    en?: { invalid?: boolean; text?: string };
    ne?: { invalid?: boolean; text?: string };
  };
  disabled?: boolean;
  required?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  sideBySide?: boolean; // New prop to show fields side by side instead of tabs
  /** Optionally control which language tab is active */
  activeLanguage?: "en" | "ne";
  /** Callback when user switches language (only when using tabs) */
  onActiveLanguageChange?: (lang: "en" | "ne") => void;
}

export const TranslatableField: React.FC<TranslatableFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = { en: "", ne: "" },
  invalid = false,
  invalidText,
  invalidMessages,
  disabled = false,
  required = false,
  className = "",
  multiline = false,
  rows = 4,
  maxLength,
  showCharacterCount = false,
  sideBySide = false,
  activeLanguage,
  onActiveLanguageChange,
}) => {
  // NOTE: This HR-specific TranslatableField supports showing validation messages
  // per language via the `invalidMessages` prop. When using tabs, only the active
  // tab's error is rendered so English errors aren't shown while viewing Nepali
  // input and vice versa. When `sideBySide` is true both language inputs can show
  // their respective errors simultaneously.
  const [activeTab, setActiveTab] = useState<"en" | "ne">(activeLanguage || "en");

  // Keep internal state in sync if parent controls activeLanguage
  React.useEffect(() => {
    if (activeLanguage && activeLanguage !== activeTab) {
      setActiveTab(activeLanguage);
    }
  }, [activeLanguage, activeTab]);
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

    // Determine invalid state & message for this specific language.
    const perLangInvalid = invalidMessages?.[language]?.invalid;
    const perLangInvalidText = invalidMessages?.[language]?.text;
    const hasPerLang = !!invalidMessages; // whether caller provided per-language messages at all
    // Show error for a language only:
    //  - if sideBySide: always evaluate that language
    //  - if tabbed: only when its tab is active
    const shouldConsider = sideBySide || activeTab === language;
    let effectiveInvalid = false;
    let effectiveInvalidText: string | undefined = undefined;

    if (hasPerLang) {
      // If per-language messages provided, do NOT fall back to root invalid for other languages.
      effectiveInvalid = shouldConsider ? !!perLangInvalid : false;
      effectiveInvalidText = shouldConsider && perLangInvalid ? perLangInvalidText : undefined;
    } else {
      // Backward compatibility: behave like before using shared root invalid props.
      effectiveInvalid = shouldConsider ? invalid : false;
      effectiveInvalidText = shouldConsider ? invalidText : undefined;
    }

    const commonProps = {
      id: `${label.toLowerCase().replace(/\s+/g, "-")}-${language}`,
      labelText: label,
      value: currentValue,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleLanguageChange(language, e.target.value),
      placeholder: currentPlaceholder,
  invalid: effectiveInvalid,
  invalidText: effectiveInvalidText,
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
              onClick={() => {
                setActiveTab("en");
                onActiveLanguageChange?.("en");
              }}
              disabled={disabled}
            >
              English
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "ne" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("ne");
                onActiveLanguageChange?.("ne");
              }}
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
