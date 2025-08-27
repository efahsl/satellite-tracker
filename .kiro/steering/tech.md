# Technology Stack

## Core Technologies
- **Frontend Framework**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 7.0.5 (fast dev server and optimized builds)
- **3D Graphics**: Three.js 0.178.0 + React Three Fiber + Drei
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **Testing**: Vitest 3.2.4 + React Testing Library + jsdom

## Styling & Design
- **CSS Modules**: Component-scoped styling with `.module.css` files
- **PostCSS**: Autoprefixer for browser compatibility
- **Design System**: Centralized tokens in `src/styles/design-system.ts`
- **TV-Specific**: Specialized styling for 10-foot interfaces

## Development Tools
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)
- **ESLint**: Code quality and consistency
- **Vite Config**: Custom aliases, chunking strategy, and test setup

## Common Commands

### Development
```bash
npm run dev          # Start development server (port 3000)
npm start           # Alias for npm run dev
```

### Building
```bash
npm run build       # Production build to dist/
npm run preview     # Preview production build locally
```

### Testing
```bash
npm test           # Run tests with Vitest in watch mode
```

## Build Configuration
- **Output**: `dist/` directory with sourcemaps
- **Code Splitting**: Vendor, Three.js, and Router chunks
- **Aliases**: `@/` points to `src/` directory
- **Environment**: jsdom for testing, supports process.env.NODE_ENV

## API Integration
- **ISS Data**: wheretheiss.at API (`https://api.wheretheiss.at/v1/satellites/25544`)
- **Update Frequency**: 5-second intervals
- **Error Handling**: Graceful fallbacks for API failures