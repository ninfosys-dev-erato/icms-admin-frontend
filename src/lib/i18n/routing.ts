import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ne'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The pathname prefix for the default locale
  localePrefix: {
    mode: 'as-needed',
    prefixes: {
      ne: '/ne'
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing); 