import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageFontProvider } from '@/shared/components/language-font-provider';
import { useLanguageFont } from '@/shared/hooks/use-language-font';

// Mock next-intl
jest.mock('next-intl', () => ({
  ...jest.requireActual('next-intl'),
  useLocale: () => 'en',
}));

const messages = {
  brand: {
    title: 'iCMS',
    subtitle: 'Integrated Content Management System',
  },
  nav: {
    dashboard: 'Dashboard',
    contentManagement: 'Content Management',
    humanResources: 'Human Resources',
    settings: 'Settings',
    logout: 'Logout',
  },
  footer: {
    contact: 'Contact',
    privacy: 'Privacy',
    termsOfUse: 'Terms of Use',
    accessibility: 'Accessibility',
    cookiePreferences: 'Cookie Preferences',
    poweredBy: 'Powered by iCMS',
  },
};

// Test component to test the hook
const TestComponent: React.FC = () => {
  const { locale, fontFamily, isNepali, isEnglish } = useLanguageFont();
  
  return (
    <div>
      <div className="font-dynamic">Dynamic Font Text</div>
      <div className="font-en">English Font Text</div>
      <div className="font-ne">नेपाली फन्ट टेक्स्ट</div>
      <div className="font-english-only">English Only Text</div>
      <div data-testid="locale">Locale: {locale}</div>
      <div data-testid="font-family">Font Family: {fontFamily}</div>
      <div data-testid="is-nepali">Is Nepali: {isNepali ? 'Yes' : 'No'}</div>
      <div data-testid="is-english">Is English: {isEnglish ? 'Yes' : 'No'}</div>
    </div>
  );
};

describe('Language Font System', () => {
  const renderWithProviders = (component: React.ReactElement, locale = 'en') => {
    return render(
      <NextIntlClientProvider messages={messages} locale={locale}>
        <LanguageFontProvider>
          {component}
        </LanguageFontProvider>
      </NextIntlClientProvider>
    );
  };

  test('renders language font test component', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Dynamic Font Text')).toBeInTheDocument();
    expect(screen.getByText('English Font Text')).toBeInTheDocument();
    expect(screen.getByText('नेपाली फन्ट टेक्स्ट')).toBeInTheDocument();
    expect(screen.getByText('English Only Text')).toBeInTheDocument();
  });

  test('applies dynamic font class', () => {
    const { container } = renderWithProviders(<TestComponent />);
    
    const dynamicElements = container.querySelectorAll('.font-dynamic');
    expect(dynamicElements.length).toBeGreaterThan(0);
  });

  test('applies English font class', () => {
    const { container } = renderWithProviders(<TestComponent />);
    
    const englishElements = container.querySelectorAll('.font-en');
    expect(englishElements.length).toBeGreaterThan(0);
  });

  test('applies Nepali font class', () => {
    const { container } = renderWithProviders(<TestComponent />);
    
    const nepaliElements = container.querySelectorAll('.font-ne');
    expect(nepaliElements.length).toBeGreaterThan(0);
  });

  test('applies English-only font class', () => {
    const { container } = renderWithProviders(<TestComponent />);
    
    const englishOnlyElements = container.querySelectorAll('.font-english-only');
    expect(englishOnlyElements.length).toBeGreaterThan(0);
  });

  test('displays current font family', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText(/Font Family: IBM Plex Sans/)).toBeInTheDocument();
  });

  test('shows language status correctly', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Is English: Yes')).toBeInTheDocument();
    expect(screen.getByText('Is Nepali: No')).toBeInTheDocument();
  });

  test('displays locale information', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByText('Locale: en')).toBeInTheDocument();
  });
}); 