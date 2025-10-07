# Internationalization (i18n) Strategy

## Overview

The iCMS Admin Frontend implements a comprehensive internationalization system supporting Nepali and English languages with real-time switching capabilities and scalable translation management.

## Strategic Requirements

### Core Requirements
- **Dual Language Support**: Nepali (ne) and English (en)
- **Real-time Switching**: Instant language changes without page reload
- **On-demand Loading**: Translations loaded per component/domain
- **Scalable Structure**: Domain-based translation organization
- **Performance**: Minimal bundle impact and fast switching

### User Experience Goals
- **Super Fast Translations**: Sub-100ms language switching
- **Responsive Design**: Layouts adapt to text length differences
- **Government Standards**: Proper Nepali Unicode support
- **Accessibility**: Screen reader compatibility in both languages

## Architecture Overview

### Translation Organization Strategy

```
locales/
├── en/
│   ├── common/
│   │   ├── navigation.json
│   │   ├── buttons.json
│   │   ├── errors.json
│   │   └── validation.json
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── login.json
│   │   │   └── register.json
│   │   ├── content-management/
│   │   │   ├── create.json
│   │   │   └── update.json
│   │   └── hr/
│   │       └── employees.json
└── ne/
    └── [same structure as en]
```

### Domain-Based Translation Patterns

#### Common Translations Structure
```typescript
// Navigation translations signature
interface NavigationTranslations {
  nav: {
    dashboard: string
    contentManagement: string
    humanResources: string
    settings: string
    logout: string
  }
  breadcrumbs: {
    home: string
    back: string
  }
}
```

#### Domain-Specific Translation Structure
```typescript
// Domain translation signature
interface DomainTranslations {
  title: string
  subtitle?: string
  form: {
    [fieldName]: {
      label: string
      placeholder: string
      validation: Record<string, string>
    }
  }
  errors: Record<string, string>
  actions: Record<string, string>
}
```

## Implementation Architecture

### Technology Stack
- **next-intl**: Primary i18n library for Next.js 15
- **Custom Hook System**: Domain-specific translation hooks
- **Dynamic Loading**: Lazy loading of translation files
- **Zustand Integration**: Language preference persistence

### Translation Access Patterns

#### Custom Hook Architecture
```typescript
// Domain-specific translation hooks
export const useAuthTranslations = () => useTranslations('auth.login')
export const useCommonTranslations = () => useTranslations('common')

// Generic domain translation hook
export const useDomainTranslations = (domain: string, subdomain?: string) => {
  const namespace = subdomain ? `${domain}.${subdomain}` : domain
  return useTranslations(namespace)
}
```

#### Component Integration Pattern
```typescript
// Component translation usage
const LoginForm: React.FC = () => {
  const t = useAuthTranslations()
  
  return (
    <Form>
      <TextInput 
        labelText={t('form.email.label')}
        placeholder={t('form.email.placeholder')}
        invalidText={t('form.email.validation.required')}
      />
    </Form>
  )
}
```

### Language Switching Architecture

#### Language State Management
```typescript
interface LanguageState {
  locale: 'en' | 'ne'
  direction: 'ltr' | 'rtl'
  setLocale: (locale: 'en' | 'ne') => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'en',
      direction: 'ltr',
      setLocale: (locale) => set({ locale, direction: getDirection(locale) })
    }),
    { name: 'iCMS-language-preference' }
  )
)
```

#### Language Switcher Pattern
```typescript
// Language switcher component signature
interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown' | 'toggle'
  showLabels?: boolean
  onLanguageChange?: (locale: string) => void
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabels = true,
  onLanguageChange
}) => {
  // Language switching logic
  // UI rendering based on variant
}
```

## Performance Optimization

### Dynamic Loading Strategy
```typescript
// Translation loading pattern
const loadTranslations = async (locale: string, domain: string) => {
  const translations = await import(`@/locales/${locale}/${domain}/index.json`)
  return translations.default
}

// Cached translation hook
export const useDynamicTranslations = (domain: string) => {
  // Caching logic
  // Loading states
  // Error handling
}
```

### Bundle Optimization Strategies
- **Code Splitting**: Translations loaded per route/domain
- **Tree Shaking**: Unused translations removed from bundle
- **Compression**: Gzip compression for translation files
- **Caching**: Browser caching for translation assets
- **Preloading**: Critical translations loaded early

## Typography & Layout Adaptation

### Nepali Typography Configuration
```css
/* Nepali font system */
.nepali-text {
  font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

/* Responsive text sizing */
.text-content {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}
```

### Layout Direction Management
```typescript
// Layout direction hook
export const useLayoutDirection = () => {
  const { locale, direction } = useLanguageStore()
  
  useEffect(() => {
    document.documentElement.dir = direction
    document.documentElement.lang = locale
  }, [direction, locale])
  
  return { direction, locale }
}
```

## Validation & Error Messaging

### Internationalized Validation
```typescript
// Validation message generator
export const getValidationMessage = (
  field: string, 
  rule: string, 
  locale: string,
  params?: Record<string, any>
) => {
  // Message interpolation
  // Parameter replacement
  // Fallback handling
}
```

### Form Integration Pattern
```typescript
// Form validation with i18n
const useFormValidation = (schema: ValidationSchema) => {
  const { locale } = useLanguageStore()
  
  return {
    validate: (data: FormData) => {
      // Validation with localized messages
    },
    getFieldError: (fieldName: string) => {
      // Localized error messages
    }
  }
}
```

## Testing Strategy

### Translation Completeness Testing
```typescript
// Translation testing patterns
describe('Translation Completeness', () => {
  test('all English keys have Nepali translations', () => {
    // Key comparison logic
  })
  
  test('no missing interpolation variables', () => {
    // Variable validation logic
  })
  
  test('translation files are valid JSON', () => {
    // JSON validation logic
  })
})
```

### Component i18n Testing
```typescript
// Component translation testing
describe('Component i18n', () => {
  test('renders correctly in English', () => {
    // English rendering tests
  })
  
  test('renders correctly in Nepali', () => {
    // Nepali rendering tests
  })
  
  test('switches languages correctly', () => {
    // Language switching tests
  })
})
```

## Maintenance & Scaling

### Translation Workflow
1. **Development**: Developers add English translations
2. **Translation**: Professional translation to Nepali
3. **Review**: Government language review process
4. **Testing**: Automated translation completeness tests
5. **Deployment**: Translations deployed with features

### Scaling Considerations
- **Namespace Growth**: New domains add their own translation namespaces
- **Translation Management**: Integration with translation management tools
- **Performance Monitoring**: Track translation loading performance
- **Cache Strategy**: Intelligent caching for frequently used translations
- **Bulk Operations**: Efficient batch translation loading

### Quality Assurance
- **Consistency Checks**: Automated consistency validation
- **Context Validation**: Ensure translations fit UI context
- **Cultural Adaptation**: Government-appropriate language usage
- **Accessibility**: Screen reader compatibility testing

## Integration Points

### Framework Integration
- **Next.js**: App Router and middleware integration
- **Carbon Design**: Component library i18n support
- **Form Libraries**: React Hook Form integration
- **State Management**: Zustand store integration

### Development Tools
- **TypeScript**: Type-safe translation keys
- **ESLint**: Translation key validation rules
- **Build Tools**: Translation file processing
- **Testing**: Automated i18n testing

## Related Documentation

- [Design System](../design/README.md) - Typography and responsive design for multi-language support
- [UI/UX Guidelines](../ui-ux/README.md) - Design considerations for i18n
- [Development Guidelines](../development/README.md) - Translation development standards
- [Testing Strategy](../testing/README.md) - i18n testing approaches
- [Performance Guidelines](../development/README.md) - Performance optimization 