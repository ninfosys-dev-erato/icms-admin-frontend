"use client";

import React, { useCallback, useEffect, useState, memo } from "react";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import * as bikramSambat from "bikram-sambat";

interface NepaliDatePickerComponentProps {
  id?: string;
  labelText?: string;
  placeholder?: string;
  value?: Date | null | undefined;
  onChange?: (date: Date | null) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  invalidText?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

// Proper date conversion utilities using bikram-sambat
const nepaliToEnglish = (nepaliDateStr: string): Date | null => {
  try {
    // Handle both "/" and "-" separators
    const parts = nepaliDateStr.includes('/') 
      ? nepaliDateStr.split('/') 
      : nepaliDateStr.split('-');
      
    if (parts.length !== 3) {
      console.error("Invalid date format. Expected YYYY/MM/DD or YYYY-MM-DD, got:", nepaliDateStr);
      return null;
    }
    
    const nepaliYear = parseInt(parts[0]!, 10);
    const nepaliMonth = parseInt(parts[1]!, 10);
    const nepaliDay = parseInt(parts[2]!, 10);
    
    if (isNaN(nepaliYear) || isNaN(nepaliMonth) || isNaN(nepaliDay)) {
      console.error("Invalid date values:", { nepaliYear, nepaliMonth, nepaliDay });
      return null;
    }
    
    console.log("Converting Nepali date:", { nepaliYear, nepaliMonth, nepaliDay });
    
    // Convert Nepali date to English using bikram-sambat
    // The toGreg function expects (year, month, day) and returns {year, month, day}
    const englishDateObj = bikramSambat.toGreg(nepaliYear, nepaliMonth, nepaliDay);
    console.log("Bikram-sambat conversion result:", englishDateObj);
    
    if (!englishDateObj || typeof englishDateObj !== 'object' || !englishDateObj.year || !englishDateObj.month || !englishDateObj.day) {
      console.error("Invalid conversion result:", englishDateObj);
      return null;
    }
    
    const jsDate = new Date(englishDateObj.year, englishDateObj.month - 1, englishDateObj.day); // month - 1 for JS Date
    console.log("Final JS Date:", jsDate);
    
    return jsDate;
  } catch (error) {
    console.error("Error converting Nepali date to English:", error, "Input:", nepaliDateStr);
    return null;
  }
};

const englishToNepali = (englishDate: Date): string => {
  try {
    // Convert English date to Nepali using bikram-sambat
    // The toBik function expects (year, month, day) and returns {year, month, day}
    const nepaliDateObj = bikramSambat.toBik(
      englishDate.getFullYear(),
      englishDate.getMonth() + 1, // month + 1 for bikram-sambat
      englishDate.getDate()
    );
    
    if (!nepaliDateObj || typeof nepaliDateObj !== 'object' || !nepaliDateObj.year || !nepaliDateObj.month || !nepaliDateObj.day) {
      console.error("Invalid conversion result:", nepaliDateObj);
      return "";
    }
    
    return `${nepaliDateObj.year}/${String(nepaliDateObj.month).padStart(2, '0')}/${String(nepaliDateObj.day).padStart(2, '0')}`;
  } catch (error) {
    console.error("Error converting English date to Nepali:", error);
    return "";
  }
};

const NepaliDatePickerComponentBase: React.FC<NepaliDatePickerComponentProps> = ({
  id = "nepali-date-picker",
  labelText = "Date",
  value,
  onChange,
  className = "",
  invalid = false,
  invalidText = "",
  helperText = "",
  required = false,
  disabled = false,
}) => {
  const [nepaliDateString, setNepaliDateString] = useState<string>("");
  const [lastEnglishValue, setLastEnglishValue] = useState<Date | null>(null);

  // Convert English date to Nepali date string for display only if it's a new external value
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      // Only convert if this is a new external English date (not from our own conversion)
      if (!lastEnglishValue || value.getTime() !== lastEnglishValue.getTime()) {
        const nepaliStr = englishToNepali(value);
        console.log("Converting external English date to Nepali:", value, "->", nepaliStr);
        setNepaliDateString(nepaliStr);
        setLastEnglishValue(value);
      }
    } else if (value === null || value === undefined) {
      // Clear the date string if value is null or undefined (form reset)
      console.log("Clearing date picker due to null/undefined value (form reset)");
      setNepaliDateString("");
      setLastEnglishValue(null);
    }
  }, [value]); // Removed nepaliDateString from dependencies to prevent loops

  // Add placeholder to the input field after component mounts
  useEffect(() => {
    const addPlaceholder = () => {
      const input = document.querySelector('.nepali-date-input') as HTMLInputElement;
      if (input) {
        input.placeholder = 'YYYY-MM-DD';
        input.setAttribute('placeholder', 'YYYY-MM-DD');
      }
    };

    // Try immediately
    addPlaceholder();
    
    // Also try after a short delay to ensure the component has fully rendered
    const timer = setTimeout(addPlaceholder, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle date selection from Nepali date picker
  const handleNepaliDateChange = useCallback((nepaliDateStr: string) => {
    console.log("Date picker change event:", nepaliDateStr, "current:", nepaliDateString);
    
    // Prevent unnecessary re-renders by checking if the date actually changed
    if (nepaliDateStr === nepaliDateString) {
      console.log("Date unchanged, skipping update");
      return;
    }
    
    try {
      // Update the local state immediately to prevent flickering
      setNepaliDateString(nepaliDateStr);
      
      if (!nepaliDateStr || nepaliDateStr.trim() === '') {
        console.log("Clearing date");
        onChange?.(null);
        return;
      }

      // Convert to English date and notify parent
      const englishDate = nepaliToEnglish(nepaliDateStr);
      console.log("Converted", nepaliDateStr, "to English date:", englishDate);
      
      // Notify parent component of the change
      if (englishDate) {
        setLastEnglishValue(englishDate); // Track the English date we're sending
        onChange?.(englishDate);
      } else {
        console.error("Failed to convert Nepali date to English:", nepaliDateStr);
      }
      
    } catch (error) {
      console.error("Error handling date change:", error);
    }
  }, [onChange, nepaliDateString]);

  return (
    <div className={`nepali-datepicker-wrapper ${className}`}>
      <div style={{ marginBottom: '8px' }}>
        <label htmlFor={id} style={{ 
          fontSize: '12px',
          fontWeight: '400',
          color: '#525252',
          display: 'block',
          marginBottom: '8px'
        }}>
          {required ? `${labelText} *` : labelText}
        </label>
        
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <NepaliDatePicker
            key={`nepali-picker-${id}`}
            inputClassName="nepali-date-input"
            className="nepali-calendar-container"
            value={nepaliDateString}
            onChange={handleNepaliDateChange}
            options={{
              calenderLocale: "ne",
              valueLocale: "en"
            }}
          />
          
          {/* Clear button */}
          {nepaliDateString && !disabled && (
            <button
              type="button"
              onClick={() => {
                setNepaliDateString("");
                setLastEnglishValue(null);
                onChange?.(null);
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
                color: '#525252',
                fontSize: '16px',
                lineHeight: '1',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8e8e8';
                e.currentTarget.style.color = '#161616';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#525252';
              }}
              title="Clear date"
            >
              ✕
            </button>
          )}
        </div>
        
        {invalid && invalidText && (
          <div style={{
            fontSize: '12px',
            color: '#da1e28',
            marginTop: '4px'
          }}>
            {invalidText}
          </div>
        )}
      </div>

      <style jsx global>{`
        .nepali-datepicker-wrapper .nepali-date-input {
          width: 100% !important;
          padding: 12px 40px 12px 16px !important;
          border: 1px solid #8d8d8d !important;
          border-radius: 0 !important;
          font-size: 14px !important;
          line-height: 18px !important;
          font-weight: 400 !important;
          background-color: #f4f4f4 !important;
          color: #161616 !important;
          outline: none !important;
          transition: all 0.11s cubic-bezier(0.2, 0, 0.38, 0.9) !important;
          box-sizing: border-box !important;
        }
        
        .nepali-datepicker-wrapper .nepali-date-input::placeholder {
          color: #a8a8a8 !important;
        }
        
        .nepali-datepicker-wrapper .nepali-date-input:empty::before {
          content: "YYYY-MM-DD" !important;
          color: #a8a8a8 !important;
        }
        
        .nepali-datepicker-wrapper .nepali-date-input:focus {
          border-color: #0f62fe !important;
          background-color: #ffffff !important;
        }
        
        .nepali-datepicker-wrapper .nepali-calendar-container {
          position: relative;
          width: 100%;
        }
        
        /* Ensure the calendar popup is properly styled and visible */
        .nepali-datepicker-wrapper .nepali-datepicker,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker {
          border: 1px solid #e0e0e0 !important;
          border-radius: 4px !important;
          background: white !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
          z-index: 9999 !important;
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          margin-top: 4px !important;
        }
        
        .nepali-datepicker-wrapper table,
        .nepali-datepicker-wrapper .nepali-datepicker table,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        
        .nepali-datepicker-wrapper th,
        .nepali-datepicker-wrapper td,
        .nepali-datepicker-wrapper .nepali-datepicker th,
        .nepali-datepicker-wrapper .nepali-datepicker td,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker th,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker td {
          padding: 8px !important;
          text-align: center !important;
          border: 1px solid #e0e0e0 !important;
        }
        
        .nepali-datepicker-wrapper th,
        .nepali-datepicker-wrapper .nepali-datepicker th,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker th {
          background-color: #f4f4f4 !important;
          font-weight: 600 !important;
          color: #161616 !important;
        }
        
        .nepali-datepicker-wrapper td,
        .nepali-datepicker-wrapper .nepali-datepicker td,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker td {
          cursor: pointer !important;
          transition: background-color 0.1s ease !important;
        }
        
        .nepali-datepicker-wrapper td:hover,
        .nepali-datepicker-wrapper .nepali-datepicker td:hover,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker td:hover {
          background-color: #e8f4f8 !important;
        }
        
        .nepali-datepicker-wrapper .selected,
        .nepali-datepicker-wrapper .nepali-datepicker .selected,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker .selected {
          background-color: #0f62fe !important;
          color: white !important;
        }
        
        .nepali-datepicker-wrapper .today,
        .nepali-datepicker-wrapper .nepali-datepicker .today,
        .nepali-datepicker-wrapper .ndp-nepali-date-picker .today {
          background-color: #e8f4f8 !important;
          font-weight: bold !important;
        }
      `}</style>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const NepaliDatePickerComponent = memo(NepaliDatePickerComponentBase, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when the date value hasn't actually changed
  return (
    prevProps.value?.getTime() === nextProps.value?.getTime() &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.invalid === nextProps.invalid &&
    prevProps.invalidText === nextProps.invalidText &&
    prevProps.labelText === nextProps.labelText &&
    prevProps.id === nextProps.id
  );
});