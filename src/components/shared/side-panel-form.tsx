

"use client";

import React from 'react';
import { CreateSidePanel } from '@carbon/ibm-products';

interface SidePanelFormProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onRequestClose?: () => void;
  onRequestSubmit?: () => void;
  selectorPageContent?: string;
  selectorPrimaryFocus?: string;
  formTitle?: React.ReactNode;   // you keep using this
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const SidePanelForm: React.FC<SidePanelFormProps> = ({
  open,
  title,
  subtitle,
  primaryButtonText = 'Save',
  secondaryButtonText = 'Cancel',
  onRequestClose,
  onRequestSubmit,
  selectorPageContent,
  selectorPrimaryFocus,
  formTitle,
  children,
  className,
  ...rest
}) => {
  // CreateSidePanel expects a required `formTitle` (string). Provide one.
  const formTitleText = typeof formTitle === 'string' ? formTitle : '';

  return (
    <CreateSidePanel
      formTitle={formTitle || ''}
      title={title || ''}
      subtitle={subtitle || ''}
      open={open}
      onRequestClose={onRequestClose}
      primaryButtonText={primaryButtonText}
      secondaryButtonText={secondaryButtonText}
      onRequestSubmit={onRequestSubmit}
      selectorPageContent={selectorPageContent || ''}
      selectorPrimaryFocus={selectorPrimaryFocus || ''}
      // formTitle={formTitleText}        
      {...rest}
    >
    {/* NOTE: CreateSidePanel already renders a <form>. We intentionally avoid nesting another <form> to prevent hydration & validity issues.
      If child logic relied on container.closest('form'), it will still resolve to the CreateSidePanel internal form. */}
      <div className={className} role="form" data-nested-form-wrapper>
        {/* {formTitle ? <div className="sidepanel-form__title">{formTitle}</div> : null} */}
        {children}
      </div>
    </CreateSidePanel>
  );
};

export default SidePanelForm;
