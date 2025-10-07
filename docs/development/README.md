# Development Guidelines

## Overview

This document outlines the coding standards, best practices, and development workflows for the iCMS Admin Frontend project to ensure consistency, maintainability, and quality across the codebase.

## Code Standards & Formatting

### TypeScript Configuration
- **Strict Mode**: Enabled TypeScript strict mode for type safety
- **Type Annotations**: Explicit types for all function parameters and returns
- **Interface Definitions**: Comprehensive interfaces for data structures
- **Type Safety**: No `any` types in production code

### Naming Convention Standards
- **Files**: kebab-case (`user-profile.tsx`, `auth-service.ts`)
- **Components**: PascalCase (`UserProfile`, `LoginForm`)
- **Functions/Variables**: camelCase (`getUserData`, `isAuthenticated`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)

### File Organization Principles
- **Maximum Size**: 1000 lines per file
- **Single Responsibility**: One concern per file
- **Logical Grouping**: Related functionality together
- **Clean Exports**: Well-defined module interfaces

## Component Architecture

### Component Structure Pattern
```typescript
// Standard component organization
// 1. External imports
// 2. Internal imports  
// 3. Type definitions
// 4. Component implementation
// 5. Default export

interface ComponentProps {
  // Prop definitions
}

export const Component: React.FC<ComponentProps> = (props) => {
  // Hooks at the top
  // Event handlers
  // Render logic
}
```

### Component Guidelines
- **Functional Components**: Use function components with hooks
- **Props Interface**: Define explicit props interfaces
- **Event Handling**: Separate event handlers from render logic
- **Memoization**: Use React.memo for performance optimization

### Custom Hook Patterns
```typescript
// Hook naming: use[Purpose][Entity]
export const useAuthUser = () => { /* User authentication logic */ }
export const useContentList = () => { /* Content list management */ }
export const useFormValidation = () => { /* Form validation logic */ }
```

## Domain-Driven Organization

### Domain Structure
```
src/
├── domains/
│   ├── [domain]/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
├── shared/
│   ├── components/
│   ├── services/
│   ├── types/
│   └── utils/
└── app/
```

### Domain Boundaries
- **Self-Contained**: Each domain manages its own concerns
- **Minimal Dependencies**: Limited cross-domain coupling
- **Clear Interfaces**: Well-defined domain APIs
- **Shared Resources**: Common utilities in shared folder

## State Management Patterns

### Zustand Store Structure
```typescript
interface DomainState {
  // State properties
}

interface DomainActions {
  // Action methods
}

export const useDomainStore = create<DomainState & DomainActions>((set, get) => ({
  // State initialization
  // Action implementations
  // Computed values
}))
```

### State Management Guidelines
- **Domain Stores**: One store per domain
- **Immutable Updates**: Always return new state objects
- **Action Naming**: Clear, descriptive action names
- **State Persistence**: Use persist middleware where appropriate

## API Integration Standards

### Service Layer Pattern
```typescript
interface ServiceInterface<T, CreateRequest, UpdateRequest> {
  getById(id: string): Promise<T>
  create(data: CreateRequest): Promise<T>
  update(id: string, data: UpdateRequest): Promise<T>
  delete(id: string): Promise<void>
  getList(filters: FilterParams): Promise<PaginatedResponse<T>>
}
```

### Error Handling Strategy
- **Error Types**: Defined error type hierarchy
- **Global Handling**: Centralized error processing
- **User Feedback**: Clear error messages for users
- **Recovery**: Automatic retry mechanisms where appropriate

## Testing Standards

### Testing Strategy Overview
- **Unit Tests**: All components and business logic
- **Integration Tests**: Cross-component interactions
- **E2E Tests**: Critical user flows
- **Accessibility Tests**: WCAG compliance validation

### Test Organization
```
__tests__/
├── components/
│   └── [domain]/
├── services/
│   └── [domain]/
├── stores/
│   └── [domain]/
└── utils/
```

### Testing Patterns
```typescript
// Component testing signature
describe('Component', () => {
  const renderComponent = (props = {}) => render(<Component {...defaultProps} {...props} />)
  
  test('should render correctly', () => { /* Test implementation */ })
  test('should handle user interactions', () => { /* Test implementation */ })
  test('should display error states', () => { /* Test implementation */ })
})
```

## Performance Guidelines

### Code Splitting Strategy
- **Route-based**: Split by page/route
- **Component-based**: Large components split separately
- **Feature-based**: Domain features split independently
- **Vendor-based**: Third-party libraries optimized

### Performance Optimization Patterns
```typescript
// Memoization patterns
const MemoizedComponent = React.memo(Component)
const expensiveValue = useMemo(() => calculation, [dependencies])
const stableCallback = useCallback(handler, [dependencies])

// Lazy loading patterns
const LazyComponent = lazy(() => import('./Component'))
```

## Security Best Practices

### Authentication & Authorization
- **Token Management**: Secure token storage and handling
- **Route Protection**: Comprehensive route guarding
- **Role-based Access**: Granular permission systems
- **Session Management**: Proper session lifecycle handling

### Data Security
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Proper data sanitization
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Storage**: No sensitive data in localStorage

## Internationalization Standards

### Translation Organization
- **Domain-based**: Translations organized by domain
- **Common Translations**: Shared translations in common namespace
- **Type Safety**: TypeScript interfaces for translation keys
- **Performance**: Lazy loading of translation files

### i18n Implementation Pattern
```typescript
// Translation hook signature
export const useDomainTranslations = (domain: string, subdomain?: string) => {
  // Translation logic
}

// Component integration
const Component = () => {
  const t = useDomainTranslations('auth', 'login')
  return <div>{t('form.email.label')}</div>
}
```

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Comprehensive function documentation
- **Interface Documentation**: Clear property descriptions
- **Usage Examples**: Practical implementation examples
- **Architecture Notes**: High-level design explanations

### Component Documentation
- **Storybook Stories**: Interactive component documentation
- **Props Documentation**: Complete prop descriptions
- **Accessibility Notes**: A11y implementation details
- **Performance Notes**: Optimization considerations

## Quality Assurance

### Code Quality Tools
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Static type checking
- **Husky**: Pre-commit hooks for quality gates

### Review Process
- **Pull Request Template**: Standardized PR structure
- **Code Review Checklist**: Systematic review process
- **Testing Requirements**: Mandatory test coverage
- **Performance Review**: Performance impact assessment

## Build & Deployment

### Build Configuration
- **Next.js Configuration**: Optimized build settings
- **Environment Variables**: Secure configuration management
- **Bundle Analysis**: Regular bundle size monitoring
- **Performance Monitoring**: Build-time performance tracking

### Deployment Strategy
- **Environment Separation**: Dev, staging, production environments
- **CI/CD Pipeline**: Automated testing and deployment
- **Rollback Strategy**: Quick rollback capabilities
- **Monitoring**: Production application monitoring

## Development Workflow

### Git Workflow
- **Branch Naming**: Consistent branch naming conventions
- **Commit Messages**: Conventional commit message format
- **Feature Branches**: Feature-based development workflow
- **Code Review**: Mandatory peer review process

### Local Development
- **Environment Setup**: Standardized development environment
- **Hot Reloading**: Efficient development feedback loop
- **Testing Workflow**: Test-driven development practices
- **Debugging Tools**: Comprehensive debugging setup

## Related Documentation

- [Architecture](../architecture/README.md) - System architecture patterns
- [API Integration](../api/README.md) - API layer implementation
- [Design System](../design/README.md) - Visual design system and component design tokens
- [UI/UX Guidelines](../ui-ux/README.md) - Design system implementation
- [Testing Strategy](../testing/README.md) - Comprehensive testing approach 