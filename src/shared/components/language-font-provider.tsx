'use client';

import React, { ReactNode } from 'react';
import { useLanguageFont } from '@/shared/hooks/use-language-font';

interface LanguageFontProviderProps {
  children: ReactNode;
}

export const LanguageFontProvider: React.FC<LanguageFontProviderProps> = ({ children }) => {
  // This hook will automatically handle font switching based on locale
  useLanguageFont();

  return <>{children}</>;
}; 