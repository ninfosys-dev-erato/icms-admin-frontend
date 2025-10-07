# Design System

## Overview

The iCMS Admin Frontend implements a comprehensive design system built on IBM Carbon Design System foundations while incorporating government-appropriate branding and the official iCMS color palette centered around navy blue (`#123772`).

## Visual Identity

### Brand Foundation
- **Primary Identity**: Professional government application design
- **Design Philosophy**: Clean, accessible, trustworthy, and efficient
- **Visual Language**: Modern minimalism with government authority
- **User Experience**: Intuitive navigation with enterprise-grade functionality

### Design Principles
- **Clarity**: Clear hierarchy and unambiguous information architecture
- **Consistency**: Unified patterns across all interfaces and interactions
- **Accessibility**: WCAG 2.1 AA compliance as foundational requirement
- **Efficiency**: Streamlined workflows optimized for government operations

## Color System

### Primary Color Foundation
The design system is built around the primary navy blue color, ensuring professional government aesthetic while maintaining excellent accessibility standards.

```css
/* Primary Brand Color */
:root {
  --color-primary: #123772;
  --color-primary-rgb: 18, 55, 114;
}
```

### Color Palette Architecture

#### Core Brand Colors
```css
:root {
  /* Primary Navy */
  --color-navy-primary: #123772;
  
  /* Tints (Lighter Variants) */
  --color-light-navy: #30568D;
  --color-mist-blue: #5D7BA6;
  --color-pale-sky: #A3B7D1;
  --color-ice-blue: #DCE6F2;
  
  /* Shades (Darker Variants) */
  --color-deep-night: #0E2C5A;
  --color-inkwell-blue: #0A2041;
  --color-midnight: #06172E;
}
```

#### Accent Color System
```css
:root {
  /* Analogous Colors */
  --color-ocean-teal: #127272;
  --color-royal-indigo: #361272;
  
  /* Complementary Colors */
  --color-bronze: #726012;
  --color-warm-sand: #A67C4D;
}
```

### Semantic Color Applications

#### Interactive Elements
```css
:root {
  /* Primary Actions */
  --color-button-primary: var(--color-navy-primary);
  --color-button-primary-hover: var(--color-light-navy);
  --color-button-primary-active: var(--color-deep-night);
  
  /* Secondary Actions */
  --color-button-secondary: var(--color-mist-blue);
  --color-button-secondary-hover: var(--color-pale-sky);
  
  /* Links */
  --color-link: var(--color-navy-primary);
  --color-link-hover: var(--color-light-navy);
  --color-link-visited: var(--color-royal-indigo);
}
```

#### Status and Feedback Colors
```css
:root {
  /* Success States */
  --color-success: var(--color-ocean-teal);
  --color-success-light: #E8F5F5;
  --color-success-dark: #0F5858;
  
  /* Warning States */
  --color-warning: var(--color-bronze);
  --color-warning-light: #FBF6E8;
  --color-warning-dark: #4A3B0B;
  
  /* Error States */
  --color-error: #DA1E28;
  --color-error-light: #FFE6E6;
  --color-error-dark: #A1181F;
  
  /* Information States */
  --color-info: var(--color-mist-blue);
  --color-info-light: var(--color-ice-blue);
  --color-info-dark: var(--color-deep-night);
}
```

#### Background and Surface Colors
```css
:root {
  /* Background Hierarchy */
  --color-background-primary: #FFFFFF;
  --color-background-secondary: var(--color-ice-blue);
  --color-background-tertiary: var(--color-pale-sky);
  
  /* Surface Colors */
  --color-surface-primary: #FFFFFF;
  --color-surface-secondary: #F8FAFB;
  --color-surface-elevated: #FFFFFF;
  
  /* Border Colors */
  --color-border-light: var(--color-pale-sky);
  --color-border-medium: var(--color-mist-blue);
  --color-border-strong: var(--color-navy-primary);
}
```

### Text Color System
```css
:root {
  /* Text Hierarchy */
  --color-text-primary: var(--color-midnight);
  --color-text-secondary: var(--color-inkwell-blue);
  --color-text-tertiary: var(--color-deep-night);
  --color-text-placeholder: var(--color-mist-blue);
  
  /* Inverse Text (on dark backgrounds) */
  --color-text-inverse: #FFFFFF;
  --color-text-inverse-secondary: var(--color-ice-blue);
}
```

## Typography System

### Font Hierarchy
Built on Carbon Design System typography with government-appropriate refinements.

```css
/* Primary Font Stack */
:root {
  --font-family-primary: 'IBM Plex Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'IBM Plex Mono', 'Courier New', monospace;
  
  /* Nepali Typography Support */
  --font-family-nepali: 'Noto Sans Devanagari', 'IBM Plex Sans', sans-serif;
}
```

### Typography Scale
```css
:root {
  /* Display Typography */
  --font-size-display-1: 3.5rem;    /* 56px */
  --font-size-display-2: 3rem;      /* 48px */
  --font-size-display-3: 2.5rem;    /* 40px */
  
  /* Heading Typography */
  --font-size-heading-1: 2rem;      /* 32px */
  --font-size-heading-2: 1.75rem;   /* 28px */
  --font-size-heading-3: 1.5rem;    /* 24px */
  --font-size-heading-4: 1.25rem;   /* 20px */
  --font-size-heading-5: 1.125rem;  /* 18px */
  --font-size-heading-6: 1rem;      /* 16px */
  
  /* Body Typography */
  --font-size-body-large: 1.125rem; /* 18px */
  --font-size-body: 1rem;           /* 16px */
  --font-size-body-small: 0.875rem; /* 14px */
  --font-size-caption: 0.75rem;     /* 12px */
}
```

### Line Height and Spacing
```css
:root {
  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-loose: 1.75;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

## Spacing System

### Base Spacing Unit
Following Carbon's 8px grid system with 16px as the base unit.

```css
:root {
  /* Base spacing unit */
  --spacing-base: 1rem; /* 16px */
  
  /* Spacing Scale */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */
  --spacing-3xl: 4rem;    /* 64px */
  --spacing-4xl: 6rem;    /* 96px */
}
```

### Layout Spacing
```css
:root {
  /* Component Spacing */
  --spacing-component-xs: var(--spacing-sm);   /* 8px */
  --spacing-component-sm: var(--spacing-md);   /* 16px */
  --spacing-component-md: var(--spacing-lg);   /* 24px */
  --spacing-component-lg: var(--spacing-xl);   /* 32px */
  
  /* Section Spacing */
  --spacing-section-sm: var(--spacing-xl);     /* 32px */
  --spacing-section-md: var(--spacing-2xl);    /* 48px */
  --spacing-section-lg: var(--spacing-3xl);    /* 64px */
  
  /* Page Spacing */
  --spacing-page-margin: var(--spacing-lg);    /* 24px */
  --spacing-page-padding: var(--spacing-md);   /* 16px */
}
```

## Elevation and Shadows

### Shadow System
```css
:root {
  /* Elevation Shadows */
  --shadow-level-1: 0 1px 3px rgba(var(--color-primary-rgb), 0.1);
  --shadow-level-2: 0 4px 6px rgba(var(--color-primary-rgb), 0.1);
  --shadow-level-3: 0 10px 15px rgba(var(--color-primary-rgb), 0.1);
  --shadow-level-4: 0 20px 25px rgba(var(--color-primary-rgb), 0.15);
  
  /* Focus Shadows */
  --shadow-focus: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  --shadow-focus-error: 0 0 0 3px rgba(218, 30, 40, 0.2);
}
```

### Border Radius System
```css
:root {
  /* Border Radius Scale */
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;    /* 2px */
  --border-radius-md: 0.25rem;     /* 4px */
  --border-radius-lg: 0.5rem;      /* 8px */
  --border-radius-xl: 1rem;        /* 16px */
  --border-radius-full: 9999px;    /* Full round */
}
```

## Component Design Tokens

### Button Design Tokens
```css
:root {
  /* Button Colors */
  --button-primary-bg: var(--color-navy-primary);
  --button-primary-hover-bg: var(--color-light-navy);
  --button-primary-active-bg: var(--color-deep-night);
  --button-primary-text: #FFFFFF;
  
  --button-secondary-bg: transparent;
  --button-secondary-border: var(--color-navy-primary);
  --button-secondary-text: var(--color-navy-primary);
  --button-secondary-hover-bg: var(--color-ice-blue);
  
  /* Button Sizing */
  --button-height-sm: 2rem;        /* 32px */
  --button-height-md: 2.5rem;      /* 40px */
  --button-height-lg: 3rem;        /* 48px */
  
  --button-padding-x-sm: var(--spacing-md);
  --button-padding-x-md: var(--spacing-lg);
  --button-padding-x-lg: var(--spacing-xl);
}
```

### Form Design Tokens
```css
:root {
  /* Form Input Colors */
  --input-bg: #FFFFFF;
  --input-border: var(--color-mist-blue);
  --input-border-focus: var(--color-navy-primary);
  --input-border-error: var(--color-error);
  --input-text: var(--color-text-primary);
  --input-placeholder: var(--color-text-placeholder);
  
  /* Form Input Sizing */
  --input-height-sm: 2rem;         /* 32px */
  --input-height-md: 2.5rem;       /* 40px */
  --input-height-lg: 3rem;         /* 48px */
  
  --input-padding-x: var(--spacing-md);
  --input-border-radius: var(--border-radius-md);
}
```

### Navigation Design Tokens
```css
:root {
  /* Navigation Colors */
  --nav-bg: var(--color-navy-primary);
  --nav-text: #FFFFFF;
  --nav-text-active: var(--color-ice-blue);
  --nav-border: var(--color-light-navy);
  
  /* Navigation Sizing */
  --nav-sidebar-width: 240px;
  --nav-sidebar-collapsed-width: 48px;
  --nav-topbar-height: 60px;
  --nav-item-height: 40px;
}
```

## Dark Mode Support

### Dark Mode Color System
```css
:root {
  /* Dark mode variations */
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode backgrounds */
    --color-background-primary: var(--color-midnight);
    --color-background-secondary: var(--color-inkwell-blue);
    --color-surface-primary: var(--color-deep-night);
    
    /* Dark mode text */
    --color-text-primary: var(--color-ice-blue);
    --color-text-secondary: var(--color-pale-sky);
    
    /* Dark mode adjustments */
    --input-bg: var(--color-deep-night);
    --nav-bg: var(--color-midnight);
  }
}
```

## Accessibility Design Standards

### Color Contrast Requirements
- **WCAG AA Compliance**: Minimum 4.5:1 contrast ratio for normal text
- **WCAG AAA Target**: 7:1 contrast ratio where possible
- **Focus Indicators**: Clearly visible focus states with 3:1 contrast minimum

### Color Contrast Validation
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border-strong: #000000;
    --color-text-primary: #000000;
    --shadow-focus: 0 0 0 3px #000000;
  }
}
```

### Reduced Motion Support
```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-duration: 0ms;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Design Breakpoints

### Breakpoint System
```css
:root {
  /* Mobile First Breakpoints */
  --breakpoint-xs: 0px;        /* Mobile */
  --breakpoint-sm: 576px;      /* Large Mobile */
  --breakpoint-md: 768px;      /* Tablet */
  --breakpoint-lg: 1024px;     /* Desktop */
  --breakpoint-xl: 1200px;     /* Large Desktop */
  --breakpoint-2xl: 1440px;    /* Extra Large Desktop */
}
```

### Responsive Spacing
```css
/* Responsive spacing adjustments */
@media (max-width: 768px) {
  :root {
    --spacing-page-margin: var(--spacing-md);
    --spacing-section-lg: var(--spacing-xl);
  }
}
```

## Icon System

### Icon Design Standards
- **Carbon Icons**: Primary icon library from IBM Carbon
- **Consistent Sizing**: 16px, 20px, 24px, 32px standard sizes
- **Semantic Usage**: Icons support text, never replace it
- **Accessibility**: Proper ARIA labels and alternative text

```css
:root {
  /* Icon Sizing */
  --icon-size-sm: 1rem;        /* 16px */
  --icon-size-md: 1.25rem;     /* 20px */
  --icon-size-lg: 1.5rem;      /* 24px */
  --icon-size-xl: 2rem;        /* 32px */
  
  /* Icon Colors */
  --icon-color-primary: var(--color-text-primary);
  --icon-color-secondary: var(--color-text-secondary);
  --icon-color-interactive: var(--color-navy-primary);
}
```

## Animation and Motion

### Motion Design Tokens
```css
:root {
  /* Transition Durations */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Standard Animations
```css
/* Standard component animations */
.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

.slide-up {
  animation: slideUp var(--transition-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(1rem);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Design Implementation

### CSS Custom Properties Integration
The design system leverages CSS custom properties for maintainable theming and runtime customization capabilities.

### Component Library Integration
All design tokens integrate seamlessly with Carbon Design System components while maintaining the iCMS brand identity.

### Government Compliance
The color system and accessibility standards ensure compliance with government digital accessibility requirements.

## Related Documentation

- [UI/UX Guidelines](../ui-ux/README.md) - Component design patterns and user experience guidelines
- [Development Guidelines](../development/README.md) - Implementation standards and code practices
- [Accessibility](../ui-ux/README.md) - Detailed accessibility implementation guidelines
- [Carbon Design System](https://carbondesignsystem.com/) - Official Carbon documentation and components 