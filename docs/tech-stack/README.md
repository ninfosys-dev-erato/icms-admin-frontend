# Technology Stack

## Overview

The iCMS Admin Frontend is built with cutting-edge technologies selected for enterprise-grade performance, scalability, and developer experience.

## Core Technologies

### Frontend Framework
- **Next.js 15.x** - Latest version with App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Built-in optimization features

### UI Framework
- **IBM Carbon Design System**
  - Enterprise-grade components
  - Accessibility compliance (WCAG 2.1)
  - Consistent design language
  - Government-approved design patterns

### State Management
- **Zustand** - Lightweight state management
  - Simple API
  - TypeScript support
  - Minimal boilerplate
  - Excellent performance

### Server State Management
- **TanStack Query (React Query)**
  - Caching and synchronization
  - Background updates
  - Optimistic updates
  - Error boundary integration

### Language & Type Safety
- **TypeScript** - Static type checking
  - Enhanced developer experience
  - Better code maintainability
  - Runtime error prevention

## Development Tools

### Package Manager
- **npm** or **yarn** - Dependency management
- **pnpm** (recommended) - Faster, more efficient

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

### Testing Framework
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking

## Build & Deployment

### Build Tools
- **Webpack 5** - Module bundling (via Next.js)
- **SWC** - Fast compilation
- **PostCSS** - CSS processing

### Deployment
- **Vercel** (recommended) - Optimized for Next.js
- **Docker** - Containerization
- **PM2** - Process management for Node.js

## Dependencies

### Core Dependencies

```json
{
  "@carbon/react": "^1.x.x",
  "@carbon/icons-react": "^11.x.x",
  "next": "15.x.x",
  "react": "^18.x.x",
  "react-dom": "^18.x.x",
  "zustand": "^4.x.x",
  "@tanstack/react-query": "^5.x.x",
  "typescript": "^5.x.x"
}
```

### Internationalization
```json
{
  "next-intl": "^3.x.x",
  "react-i18next": "^13.x.x"
}
```

### Form Management
```json
{
  "react-hook-form": "^7.x.x",
  "@hookform/resolvers": "^3.x.x",
  "zod": "^3.x.x"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.x.x",
  "@types/react": "^18.x.x",
  "@types/react-dom": "^18.x.x",
  "eslint": "^8.x.x",
  "eslint-config-next": "15.x.x",
  "prettier": "^3.x.x",
  "jest": "^29.x.x",
  "@testing-library/react": "^14.x.x",
  "@testing-library/jest-dom": "^6.x.x",
  "playwright": "^1.x.x"
}
```

## Architecture Decisions

### Why Next.js 15?
- **Latest Features**: App Router, Server Components, Streaming
- **Performance**: Built-in optimizations and caching
- **SEO**: Server-side rendering capabilities
- **Developer Experience**: Hot reloading, built-in TypeScript support

### Why Carbon Design System?
- **Enterprise Ready**: Designed for complex business applications
- **Accessibility**: WCAG 2.1 AA compliance
- **Government Standards**: Approved for government use
- **Comprehensive**: Complete component library

### Why Zustand?
- **Simplicity**: Minimal API surface
- **Performance**: Optimal re-rendering
- **TypeScript**: Excellent TypeScript support
- **Bundle Size**: Lightweight compared to Redux

### Why TanStack Query?
- **Data Fetching**: Sophisticated caching and synchronization
- **Developer Experience**: DevTools integration
- **Performance**: Background updates and optimistic updates
- **Error Handling**: Built-in error boundaries

## Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Mobile Support
- **iOS Safari**: 14+
- **Chrome Mobile**: 90+
- **Samsung Internet**: 14+

## Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle Size
- **Initial Bundle**: < 200KB gzipped
- **Route Chunks**: < 50KB gzipped
- **Component Chunks**: < 25KB gzipped

## Configuration Files

### Required Configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E configuration

### Code Quality Configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting
- `.gitignore` - Git ignore patterns
- `package.json` - Scripts and dependencies

## Related Documentation

- [Architecture Overview](../architecture/README.md)
- [Development Setup](../basic-setup/getting-started.md)
- [Testing Strategy](../testing/README.md)
- [Performance Guidelines](../development/performance.md) 