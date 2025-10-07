'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export const useLanguageFont = () => {
  const locale = useLocale();

  useEffect(() => {
    // Set the data-locale attribute on the body element
    document.body.setAttribute('data-locale', locale);
    
    // Update CSS custom properties for dynamic font switching
    const root = document.documentElement;
    
    if (locale === 'ne') {
      root.style.setProperty('--font-family-dynamic', 'var(--font-family-ne)');
      root.style.setProperty('--font-weight-dynamic', 'var(--font-weight-ne-normal)');
    } else {
      root.style.setProperty('--font-family-dynamic', 'var(--font-family-en)');
      root.style.setProperty('--font-weight-dynamic', 'var(--font-weight-en-normal)');
    }
  }, [locale]);

  return {
    locale,
    fontFamily: locale === 'ne' ? 'Noto Sans Devanagari' : 'IBM Plex Sans',
    isNepali: locale === 'ne',
    isEnglish: locale === 'en',
  };
}; 