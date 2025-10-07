"use client";

import React, { useState, useEffect } from "react";
import { TextInput } from "@carbon/react";
import { TranslatableEntity } from "../types/office-settings";
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
}) => {
  const { locale } = useLanguageFont();
  const [activeTab, setActiveTab] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEnglishChange = (newValue: string) => {
    onChange({
      ...value,
      en: newValue,
    });
  };

  const handleNepaliChange = (newValue: string) => {
    onChange({
      ...value,
      ne: newValue,
    });
  };

  // Don't render tabs until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`translatable-field ${className || ""}`}>
        <TextInput
          id={`${label}-en`}
          labelText={`${label} (English)${required ? " *" : ""}`}
          value={value.en}
          onChange={(e) => handleEnglishChange(e.target.value)}
          placeholder={placeholder?.en}
          invalid={invalid}
          invalidText={invalidText}
          disabled={disabled}
          className="font-english-only"
        />
      </div>
    );
  }

  return (
    <div className={`translatable-field ${className || ""}`}>
      {/* Custom Tab Navigation */}
      <div className="translatable-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === 0 ? "active" : ""} font-en`}
          onClick={() => setActiveTab(0)}
          disabled={disabled}
        >
          English
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 1 ? "active" : ""} font-ne`}
          onClick={() => setActiveTab(1)}
          disabled={disabled}
        >
          नेपाली
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 0 && (
          <TextInput
            id={`${label}-en`}
            labelText={`${label} (English)${required ? " *" : ""}`}
            value={value.en}
            onChange={(e) => handleEnglishChange(e.target.value)}
            placeholder={placeholder?.en}
            invalid={invalid}
            invalidText={invalidText}
            disabled={disabled}
            className="font-english-only"
          />
        )}
        {activeTab === 1 && (
          <TextInput
            id={`${label}-ne`}
            labelText={`${label} (नेपाली)${required ? " *" : ""}`}
            value={value.ne}
            onChange={(e) => handleNepaliChange(e.target.value)}
            placeholder={placeholder?.ne}
            invalid={invalid}
            invalidText={invalidText}
            disabled={disabled}
            className="font-ne"
          />
        )}
      </div>
    </div>
  );
};
