# Project Structure & Conventions

## Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── Globe/          # 3D visualization components
│   ├── InfoPanel/      # Data display components
│   └── UI/             # Generic UI components (Button, Card, etc.)
├── hooks/              # Custom React hooks
├── layouts/            # Page layout templates
├── pages/              # Route-specific page components
├── state/              # React Context providers for global state
├── styles/             # Global styles and design system
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and constants
```

## Component Architecture

### Component Structure
- **UI Components**: Located in `src/components/UI/` with CSS Modules
- **Feature Components**: Domain-specific components (Globe, InfoPanel)
- **Layout Components**: Page structure in `src/layouts/`
- **Page Components**: Route handlers in `src/pages/`

### Naming Conventions
- **Components**: PascalCase (e.g., `HamburgerMenu.tsx`)
- **CSS Modules**: `ComponentName.module.css`
- **Hooks**: camelCase with `use` prefix (e.g., `useTVFocusManager.ts`)
- **Types**: PascalCase interfaces/types
- **Constants**: UPPER_SNAKE_CASE

### File Patterns
- Each component folder contains:
  - `ComponentName.tsx` - Main component
  - `ComponentName.module.css` - Scoped styles
  - `index.ts` - Re-export barrel file
  - `__tests__/` - Component tests (when applicable)

## State Management
- **React Context**: Global state management
- **Providers**: Wrap app in `App.tsx` with proper nesting order
- **Context Files**: Located in `src/state/` directory
- **Pattern**: Provider + custom hook for each context

## Styling Conventions
- **CSS Modules**: Component-scoped styles with `.module.css`
- **Design System**: Centralized tokens in `src/styles/design-system.ts`
- **Global Styles**: `src/styles/global.css` and `src/styles/mixins.css`
- **TV Styles**: Specialized responsive design for 10-foot interfaces

## Testing Structure
- **Test Files**: `__tests__/` directories within component folders
- **Naming**: `ComponentName.test.tsx` or `ComponentName.feature.test.tsx`
- **Setup**: `src/setupTests.js` for global test configuration
- **Environment**: jsdom with React Testing Library

## Import Conventions
- **Absolute Imports**: Use `@/` alias for src directory
- **Barrel Exports**: Use `index.ts` files for clean imports
- **React Imports**: Use named imports from React
- **Type Imports**: Use `import type` for TypeScript types

## TV/Accessibility Patterns
- **Focus Management**: Custom hooks in `src/hooks/useTVFocusManager.ts`
- **TV Navigation**: Directional input handling
- **Responsive Design**: Mobile-first with TV-specific breakpoints
- **High Contrast**: TV-optimized color schemes and typography