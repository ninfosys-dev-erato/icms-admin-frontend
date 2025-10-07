"use client";

import React from "react";
import { FormGroup, TextInput, Grid, Column } from "@carbon/react";
import { ContactInfo } from "../../types/employee";

interface ContactInfoFormProps {
  contactInfo: ContactInfo;
  onChange: (contactInfo: ContactInfo) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  contactInfo,
  onChange,
  disabled = false,
  required = false,
  className = "",
}) => {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({
      ...contactInfo,
      [field]: value,
    });
  };

  return (
    <div className={`contact-info-form ${className}`}>
      <TextInput
        id="mobile-number"
        labelText="Mobile Number"
        value={contactInfo.mobileNumber || ""}
        onChange={(e) => handleChange("mobileNumber", e.target.value)}
        placeholder="+977-9841234567"
        disabled={disabled}
        required={required}
        className="font-english-only"
      />
      <TextInput
        id="telephone"
        labelText="Telephone"
        value={contactInfo.telephone || ""}
        onChange={(e) => handleChange("telephone", e.target.value)}
        placeholder="+977-1-1234567"
        disabled={disabled}
        required={false}
        className="font-english-only"
      />
      <TextInput
        id="email"
        labelText="Email Address"
        type="email"
        value={contactInfo.email || ""}
        onChange={(e) => handleChange("email", e.target.value)}
        placeholder="employee@example.com"
        disabled={disabled}
        required={false}
        className="font-english-only"
      />
      <TextInput
        id="room-number"
        labelText="Room Number"
        value={contactInfo.roomNumber || ""}
        onChange={(e) => handleChange("roomNumber", e.target.value)}
        placeholder="Room 101"
        disabled={disabled}
        required={false}
        className="font-english-only"
      />
    </div>
  );
};
