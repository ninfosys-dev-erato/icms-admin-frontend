'use client';

import React, { ReactNode, ElementType } from 'react';

interface EnglishOnlyTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export const EnglishOnlyText: React.FC<EnglishOnlyTextProps> = ({ 
  children, 
  className = '', 
  as: Component = 'span' 
}) => {
  return (
    <Component className={`font-english-only ${className}`}>
      {children}
    </Component>
  );
}; 