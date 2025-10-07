'use client';

import React from 'react';
import { Button } from '@carbon/react';
import { Language } from '@carbon/icons-react';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import '@/shared/styles/components.css';

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown';
  showLabels?: boolean;
  onLanguageChange?: (locale: string) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabels = true,
  onLanguageChange
}) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ne' : 'en';
    
    if (onLanguageChange) {
      onLanguageChange(newLocale);
    }
    
    router.push(pathname, { locale: newLocale });
  };

  const currentLanguageLabel = locale === 'en' ? 'English' : 'नेपाली';
  const nextLanguageLabel = locale === 'en' ? 'नेपाली' : 'English';

  if (variant === 'dropdown') {
    // TODO: Implement dropdown variant when needed
    return null;
  }

  return (
    <Button
      kind="ghost"
      size="sm"
      onClick={toggleLanguage}
      renderIcon={Language}
      iconDescription={`Switch to ${nextLanguageLabel}`}
      className="language-switcher"
    >
      {showLabels && (
        <span className="language-switcher-text">
          {currentLanguageLabel}
        </span>
      )}
    </Button>
  );
}; 