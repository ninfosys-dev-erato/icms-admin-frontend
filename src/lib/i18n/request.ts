import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as 'en' | 'ne')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      // Load common translations
      ...(await import(`../../../locales/${locale}/common/navigation.json`)).default,
      ...(await import(`../../../locales/${locale}/common/buttons.json`)).default,
      ...(await import(`../../../locales/${locale}/common/errors.json`)).default,
      ...(await import(`../../../locales/${locale}/common/validation.json`)).default,
      // Load auth domain translations
      auth: {
        ...(await import(`../../../locales/${locale}/domains/auth/login.json`)).default,
      },
      // Load office-settings domain translations
      "office-settings": {
        ...(await import(`../../../locales/${locale}/domains/office-settings.json`)).default,
      },
      // Load office-description domain translations
      "office-description": {
        ...(await import(`../../../locales/${locale}/domains/office-description.json`)).default,
      },
      // Load slider domain translations
      "sliders": {
        ...(await import(`../../../locales/${locale}/domains/sliders.json`)).default,
      },
      // Load important-links domain translations
      "important-links": {
        ...(await import(`../../../locales/${locale}/domains/important-links.json`)).default,
      },
      // Load header domain translations
      "headers": {
        ...(await import(`../../../locales/${locale}/domains/headers.json`)).default,
      },
      // Load users domain translations
      "users": {
        ...(await import(`../../../locales/${locale}/domains/users.json`)).default,
      },
      // Load media domain translations
      "media": {
        ...(await import(`../../../locales/${locale}/domains/media.json`)).default,
      },
      // Load content-management domain translations
      "content-management": {
        ...(await import(`../../../locales/${locale}/domains/content-management.json`)).default,
      },
      // Load documents domain translations
      "documents": {
        ...(await import(`../../../locales/${locale}/domains/documents.json`)).default,
      },
      // Load navigation domain translations
      "navigation": {
        ...(await import(`../../../locales/${locale}/domains/navigation.json`)).default,
      },
      // Load HR domain translations
      "hr": {
        ...(await import(`../../../locales/${locale}/domains/hr/dashboard.json`)).default,
      },
      "hr-departments": {
        ...(await import(`../../../locales/${locale}/domains/hr/departments.json`)).default,
      },
      "hr-employees": {
        ...(await import(`../../../locales/${locale}/domains/hr/employees.json`)).default,
      },
    },
  };
}); 