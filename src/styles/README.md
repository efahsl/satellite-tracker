# CSS Architecture & Design System

This document outlines the CSS architecture and design system for the Satellite Tracker project.

## 🏗️ Architecture Overview

We've migrated from a monolithic CSS approach to a **CSS Modules + Design System** architecture that provides:

- **Component-scoped styles** (no more global CSS conflicts)
- **Type-safe design tokens** (TypeScript integration)
- **Consistent responsive design** (standardized breakpoints)
- **Accessibility-first approach** (WCAG compliance)
- **Performance optimizations** (CSS containment, reduced repaints)

## 📁 File Structure

```
src/styles/
├── design-system.ts      # Design tokens and TypeScript types
├── mixins.css           # Reusable utility classes
├── global.css           # Global reset and base styles
├── index.css            # Main entry point
└── README.md            # This file

src/components/UI/
├── Button/
│   ├── Button.module.css    # Component-specific styles
│   ├── Button.tsx           # Component logic
│   └── index.ts             # Exports
└── Card/
    ├── Card.module.css      # Component-specific styles
    ├── Card.tsx             # Component logic
    └── index.ts             # Exports
```

## 🎨 Design System

### Colors
```typescript
import { designTokens, getColor } from '@/styles/design-system';

// Use predefined colors
const primaryColor = getColor('primary'); // '#3b82f6'

// Access all colors
const spaceBlack = designTokens.colors.spaceBlack; // '#121212'
```

### Spacing
```typescript
import { designTokens, getSpacing } from '@/styles/design-system';

// Use predefined spacing
const padding = getSpacing('md'); // '1rem'

// Access all spacing values
const largeSpacing = designTokens.spacing.lg; // '1.5rem'
```

### Breakpoints
```typescript
import { designTokens, mediaQueries } from '@/styles/design-system';

// Use predefined breakpoints
const mobileBreakpoint = designTokens.breakpoints.mobile; // '480px'

// Use media query helpers
const mobileQuery = mediaQueries.mobile; // '@media (max-width: 480px)'
```

## 🧩 CSS Modules Usage

### Basic Component
```tsx
import React from 'react';
import styles from './MyComponent.module.css';

export const MyComponent: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Hello World</h1>
  </div>
);
```

### Dynamic Classes
```tsx
import React from 'react';
import styles from './MyComponent.module.css';

interface MyComponentProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

export const MyComponent: React.FC<MyComponentProps> = ({ variant, size }) => {
  const getClasses = () => {
    const baseClass = styles.component;
    const variantClass = styles[`component--${variant}`];
    const sizeClass = styles[`component--${size}`];
    
    return [baseClass, variantClass, sizeClass].filter(Boolean).join(' ');
  };

  return <div className={getClasses()}>Content</div>;
};
```

### Combining with Global Classes
```tsx
import React from 'react';
import styles from './MyComponent.module.css';

export const MyComponent: React.FC = () => (
  <div className={`${styles.container} flex items-center justify-center`}>
    Content
  </div>
);
```

## 📱 Responsive Design

### Mobile-First Approach
```css
/* Base styles (mobile) */
.component {
  padding: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--spacing-lg);
    font-size: var(--font-size-lg);
  }
}
```

### Using Design System Breakpoints
```css
/* Use CSS custom properties for consistency */
@media (min-width: var(--breakpoint-tablet)) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: var(--breakpoint-desktop)) {
  .component {
    /* Desktop styles */
  }
}
```

## ♿ Accessibility Features

### Focus Management
```css
.component:focus-visible {
  outline: 2px solid var(--color-iss-highlight);
  outline-offset: 2px;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .component {
    border-width: 2px;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
    animation: none;
  }
}
```

## 🚀 Performance Best Practices

### CSS Containment
```css
.component {
  contain: layout style paint;
}
```

### Hardware Acceleration
```css
.animated-component {
  transform: translateZ(0);
  will-change: transform;
}
```

### Efficient Selectors
```css
/* Good: Specific and efficient */
.component__element--modifier { }

/* Avoid: Overly complex selectors */
.component .nested .deep .selector { }
```

## 🔄 Migration Guide

### From Global CSS to CSS Modules

1. **Identify component styles** in global CSS files
2. **Create component folder** with `.module.css` file
3. **Move styles** to CSS Module file
4. **Update component** to import and use CSS Module
5. **Remove global styles** once migration is complete

### Example Migration
```tsx
// Before: Using global classes
<div className="button button--primary button--lg">

// After: Using CSS Modules
import styles from './Button.module.css';
<div className={`${styles.button} ${styles['button--primary']} ${styles['button--lg']}`}>
```

## 📋 Naming Conventions

### BEM Methodology
```css
.component { }                    /* Block */
.component__element { }           /* Element */
.component--modifier { }          /* Modifier */
.component--state { }             /* State */
```

### File Naming
- Component CSS: `ComponentName.module.css`
- Utility CSS: `utilities.css`
- Global CSS: `global.css`

## 🧪 Testing

### CSS Module Testing
```tsx
import { render, screen } from '@testing-library/react';
import styles from './MyComponent.module.css';

test('applies correct CSS classes', () => {
  render(<MyComponent />);
  const element = screen.getByTestId('component');
  expect(element).toHaveClass(styles.container);
});
```

## 📚 Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [BEM Methodology](https://en.bem.info/methodology/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
