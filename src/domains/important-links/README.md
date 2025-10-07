# Important Links Module

A comprehensive domain-driven module for managing important links in the CSIO Dadeldhura Admin system, built with strict adherence to Carbon UI design principles.

## Overview

The Important Links module provides a complete solution for managing website links, URLs, and their visibility. It follows the same architectural patterns as the Sliders module, ensuring consistency across the application.

## Features

- **CRUD Operations**: Create, read, update, and delete important links
- **Bilingual Support**: English and Nepali language support for link titles
- **Status Management**: Active/inactive link states
- **Ordering System**: Customizable display order for links
- **Search & Filtering**: Advanced search and status-based filtering
- **Statistics Dashboard**: Comprehensive analytics and insights
- **Bulk Operations**: Bulk create, update, delete, and reorder
- **Import/Export**: CSV import and export functionality
- **Responsive Design**: Mobile-first Carbon UI design
- **Real-time Updates**: Optimistic UI updates with React Query

## Architecture

### Domain-Driven Design Structure

```
src/domains/important-links/
├── components/           # React components
├── hooks/               # React Query hooks
├── repositories/        # Data access layer
├── services/           # Business logic layer
├── stores/             # State management (Zustand)
├── styles/             # CSS modules
├── types/              # TypeScript definitions
└── index.ts            # Public API exports
```

### Key Components

- **ImportantLinksContainer**: Main page container with header, filters, and content
- **ImportantLinksForm**: Form wrapper for create/edit operations
- **ImportantLinksCreateForm**: Create new link form
- **ImportantLinksEditForm**: Edit existing link form
- **ImportantLinksList**: Grid display of links with actions
- **ImportantLinksStatistics**: Analytics dashboard
- **TranslatableField**: Bilingual input field component

### State Management

Uses Zustand for local state management with persistence:
- Form state persistence
- UI panel state
- Validation state
- Loading states

### Data Fetching

React Query for server state management:
- Automatic caching and invalidation
- Optimistic updates
- Error handling
- Loading states

## API Integration

### Backend Endpoints

- `GET /important-links` - Public links
- `GET /admin/important-links` - Admin links
- `POST /admin/important-links` - Create link
- `PUT /admin/important-links/:id` - Update link
- `DELETE /admin/important-links/:id` - Delete link
- `POST /admin/important-links/reorder` - Reorder links
- `GET /admin/important-links/statistics` - Get statistics

### Data Models

```typescript
interface ImportantLink {
  id: string;
  linkTitle: TranslatableEntity; // { en: string, ne: string }
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage

### Basic Implementation

```tsx
import { ImportantLinksContainer } from '@/domains/important-links';

export default function ImportantLinksPage() {
  return <ImportantLinksContainer />;
}
```

### Custom Integration

```tsx
import { 
  useImportantLinks, 
  ImportantLinksService,
  useCreateImportantLink 
} from '@/domains/important-links';

// Use in custom components
const { data: links, isLoading } = useImportantLinks();
const createMutation = useCreateImportantLink();
```

## Styling

### Carbon UI Compliance

- Strict adherence to IBM Carbon Design System
- Consistent spacing, typography, and color usage
- Responsive grid system
- Accessible component design

### CSS Architecture

- Scoped styles to prevent global leakage
- CSS custom properties for theming
- Responsive breakpoints
- Component-specific styling

## Internationalization

### Supported Languages

- **English (en)**: Primary language
- **Nepali (ne)**: Secondary language

### Translation Files

- `locales/en/domains/important-links.json`
- `locales/ne/domains/important-links.json`

### Usage in Components

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('important-links');
const title = t('title'); // "Important Links"
```

## Testing

### Component Testing

```bash
npm run test src/domains/important-links/components
```

### Integration Testing

```bash
npm run test src/domains/important-links
```

## Performance

### Optimizations

- React Query for efficient data fetching
- Zustand for lightweight state management
- Memoized components where appropriate
- Lazy loading of statistics
- Optimistic UI updates

### Bundle Size

- Tree-shakeable exports
- Minimal dependencies
- Efficient component splitting

## Accessibility

### Features

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

### Standards

- WCAG 2.1 AA compliance
- Carbon Design accessibility guidelines
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Core Dependencies

- React 18+
- Next.js 13+
- Carbon React
- Zustand
- React Query

### Development Dependencies

- TypeScript 5+
- ESLint
- Prettier
- Jest
- Testing Library

## Contributing

### Development Workflow

1. Follow the existing code structure
2. Maintain Carbon UI compliance
3. Add comprehensive TypeScript types
4. Include proper error handling
5. Write unit tests for new features
6. Update translations for all languages

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component documentation
- Type safety throughout

## License

This module is part of the CSIO Dadeldhura Admin system and follows the project's licensing terms.
