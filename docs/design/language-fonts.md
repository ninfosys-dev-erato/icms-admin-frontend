# Language-Specific Font System

## Overview

The iCMS Admin Frontend implements a comprehensive language-specific font system that automatically switches between IBM Plex Sans (English) and Noto Sans Devanagari (Nepali) based on the current locale. This system provides both automatic font switching and explicit control for specific use cases.

## Architecture

### Font Families

- **English (en)**: IBM Plex Sans
- **Nepali (ne)**: Noto Sans Devanagari
- **Monospace**: IBM Plex Mono (for code and technical content)

### CSS Custom Properties

The system uses CSS custom properties for dynamic font switching:

```css
/* Language-specific font families */
--font-family-en: 'IBM Plex Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-ne: 'Noto Sans Devanagari', 'IBM Plex Sans', sans-serif;

/* Dynamic font family that changes based on locale */
--font-family-dynamic: var(--font-family-en);
```

## Usage Patterns

### 1. Automatic Font Switching (Recommended)

Use the `font-dynamic` class for most content that should change with the language:

```tsx
<h1 className="font-dynamic">Welcome to iCMS</h1>
<p className="font-dynamic">This text will automatically use the correct font.</p>
```

### 2. Explicit Font Control

#### Always English Font
```tsx
// For technical terms, code, or content that should always be English
<div className="font-en">Technical documentation</div>
```

#### Always Nepali Font
```tsx
// For content that should always be in Nepali font
<div className="font-ne">नेपाली सामग्री</div>
```

### 3. Form Fields and Mixed Content

#### Email Fields (Always English)
```tsx
// Apply to the container
<div className="login-form-field font-english-only">
  <TextInput
    labelText="Email"
    placeholder="user@example.com"
    // ... other props
  />
</div>
```

#### Inline English Text
```tsx
import { EnglishOnlyText } from '@/shared/components/english-only-text';

<p className="font-dynamic">
  Contact us at <EnglishOnlyText>support@icms.gov.np</EnglishOnlyText>
</p>
```

### 4. Font Weight Control

```tsx
// English font weights
<h1 className="font-weight-en-bold font-en">Bold English Text</h1>
<p className="font-weight-en-normal font-en">Normal English Text</p>

// Nepali font weights
<h1 className="font-weight-ne-bold font-ne">बोल्ड नेपाली पाठ</h1>
<p className="font-weight-ne-normal font-ne">सामान्य नेपाली पाठ</p>

// Dynamic font weights (changes with language)
<h1 className="font-weight-dynamic font-dynamic">Dynamic Weight Text</h1>
```

## Implementation Details

### Hook: useLanguageFont

```tsx
import { useLanguageFont } from '@/shared/hooks/use-language-font';

const MyComponent = () => {
  const { locale, fontFamily, isNepali, isEnglish } = useLanguageFont();
  
  return (
    <div>
      <p>Current font: {fontFamily}</p>
      <p>Is Nepali: {isNepali ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### Provider: LanguageFontProvider

The provider is automatically included in the app and handles:
- Setting `data-locale` attribute on body
- Updating CSS custom properties
- Automatic font switching

### CSS Classes

| Class | Description | Use Case |
|-------|-------------|----------|
| `font-dynamic` | Changes with language | Most content |
| `font-en` | Always English font | Technical content |
| `font-ne` | Always Nepali font | Nepali-only content |
| `font-english-only` | Always English font + weight | Form fields, emails |
| `font-weight-dynamic` | Weight changes with language | Dynamic weight |
| `font-weight-en-*` | English-specific weights | English content |
| `font-weight-ne-*` | Nepali-specific weights | Nepali content |

## Best Practices

### 1. Default to Dynamic Fonts

```tsx
// ✅ Good - Most content should use dynamic fonts
<h1 className="font-dynamic">Page Title</h1>
<p className="font-dynamic">Regular content</p>

// ❌ Avoid - Don't hardcode fonts unless necessary
<h1 className="font-en">Page Title</h1>
```

### 2. Use English-Only for Technical Content

```tsx
// ✅ Good - Technical fields should always be English
<div className="font-english-only">
  <input type="email" placeholder="user@example.com" />
</div>

// ✅ Good - Code snippets
<pre className="font-en">
  <code>console.log('Hello World');</code>
</pre>
```

### 3. Handle Mixed Content

```tsx
// ✅ Good - Use EnglishOnlyText for inline English
<p className="font-dynamic">
  Contact us at <EnglishOnlyText>support@icms.gov.np</EnglishOnlyText>
</p>

// ✅ Good - Use font-english-only for entire fields
<div className="font-english-only">
  <label>Username</label>
  <input type="text" placeholder="john.doe" />
</div>
```

### 4. Carbon Design System Integration

The system works seamlessly with Carbon components:

```tsx
// Carbon components automatically inherit the dynamic font
<Button className="font-dynamic">
  {t('actions.submit')}
</Button>

// For English-only Carbon components
<div className="font-english-only">
  <TextInput
    labelText="Email"
    placeholder="user@example.com"
  />
</div>
```

## Performance Considerations

### 1. Font Loading

- Fonts are loaded asynchronously
- Fallback fonts ensure content is always visible
- Font switching is instant (no reflow)

### 2. CSS Optimization

- Font classes use CSS custom properties
- Minimal CSS overhead
- Efficient font switching

### 3. Bundle Size

- Font files are loaded on-demand
- Only required fonts are included
- Optimized font subsets for web

## Testing

### Font Switching Test

```tsx
import { render, screen } from '@testing-library/react';
import { useLanguageFont } from '@/shared/hooks/use-language-font';

test('font switches with language', () => {
  // Test English locale
  render(<Component />);
  expect(document.body).toHaveAttribute('data-locale', 'en');
  
  // Test Nepali locale
  // ... switch locale and verify
});
```

### Visual Regression Testing

```tsx
// Test that fonts render correctly
test('fonts render with correct family', () => {
  const { container } = render(<Component />);
  
  // Check computed styles
  const element = container.querySelector('.font-dynamic');
  expect(getComputedStyle(element).fontFamily).toContain('IBM Plex Sans');
});
```

## Troubleshooting

### Common Issues

1. **Font not switching**: Ensure `LanguageFontProvider` is included
2. **English-only not working**: Check CSS class application
3. **Carbon component fonts**: Verify class inheritance

### Debug Tools

```tsx
// Add to component for debugging
const { locale, fontFamily } = useLanguageFont();
console.log('Current font:', fontFamily, 'Locale:', locale);
```

## Migration Guide

### From Static Fonts

```tsx
// Before
<h1 style={{ fontFamily: 'IBM Plex Sans' }}>Title</h1>

// After
<h1 className="font-dynamic">Title</h1>
```

### From Inline Styles

```tsx
// Before
<div style={{ fontFamily: 'Noto Sans Devanagari' }}>Content</div>

// After
<div className="font-ne">Content</div>
```

This language-specific font system provides a robust, scalable solution for multi-language typography while maintaining excellent performance and developer experience. 