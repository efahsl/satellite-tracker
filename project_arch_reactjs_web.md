
# 🧠 Project Architecture Guidelines for ReactJS Autonomous Coding Agent

This document defines the architectural standards, patterns, and best practices to guide autonomous agents in building and maintaining a responsive ReactJS web application. The target developer persona is a mid-to-senior full-stack software engineer with 5 years of ReactJS experience and 10 years of overall experience.

---

## 🏗️ Application Foundations

### 1. Framework & Stack
- **Frontend Framework:** ReactJS (latest LTS)
- **Language:** TypeScript (required)
- **Styling:** CSS Modules allowed
- **Routing:** React Router
- **State Management:** React Context for global app state, local `useState` where applicable
- **Build Tool:** Vite (preferred) or Create React App (CRA)

---

## 📐 Architectural Principles

### 2. Component Structure & Layout
- Atomic design: `atoms`, `molecules`, `organisms`, `pages`, `layouts`
- Use functional components exclusively
- Co-locate styles, tests, and types next to components
- Keep component files ≤ 200 lines where possible

### 3. Directory Organization

```
src/
  components/     # Reusable UI components
  hooks/          # Custom React hooks
  layouts/        # Page layout templates
  pages/          # Route-specific pages
  services/       # API calls and service logic
  state/          # Context or global state
  types/          # TypeScript interfaces and types
  utils/          # Helper functions
  assets/         # Images, fonts, etc.
  App.tsx
  main.tsx
```

---

## 📲 Responsiveness & UX

### 4. Design & Layout
- Use responsive design principles: `flex`, `grid`, `media queries`
- Support mobile, tablet, and desktop viewports
- Maintain minimum tap target size and accessibility contrast

### 5. UX Guidelines
- Loading indicators for async actions
- Optimistic UI updates where possible
- Use `aria-*` attributes and semantic HTML
- Keyboard navigability is required

---

## 🧬 State & Data Flow

### 6. State Management
- Use React Context + Reducer pattern for global state
- Prefer `useState` and `useReducer` over external state libraries for most use cases
- Avoid prop drilling; lift state where needed or use context

### 7. API Integration
- Use `fetch` or `axios` in `services/`
- Encapsulate API calls with proper error handling and retries
- Always handle loading and error states

---

## 🔒 Security & Performance

### 8. Security Best Practices
- Sanitize user input
- Avoid inline scripts/styles
- Prevent XSS/CSRF with headers and input validation

### 9. Performance Optimizations
- Lazy load routes and large components
- Use `React.memo`, `useCallback`, and `useMemo` appropriately
- Avoid unnecessary re-renders
- Bundle splitting via dynamic imports

---

## 🧪 Testing & Quality

### 10. Testing Strategy
- Unit tests with Jest
- Component tests with React Testing Library
- End-to-end tests with Playwright or Cypress
- Write tests alongside feature development

### 11. Code Quality
- Use ESLint + Prettier for code linting and formatting
- Enforce code reviews for all PRs
- Use `husky` for pre-commit checks

---

## 🚦 DevOps & Tooling

### 12. Tooling
- Version Control: Git (GitHub)
- CI/CD: GitHub Actions
- Linting: ESLint, Prettier
- Deployment: Vercel, Netlify, or similar

---

## 🧩 Extensibility & Maintainability

### 13. Design for Change
- Write modular and reusable components
- Isolate side effects and service logic
- Use interface-based contracts and dependency injection where applicable

### 14. Documentation
- Each component, service, and hook must include JSDoc or equivalent inline documentation
- Maintain a `README.md` with setup instructions, tech stack, and architecture overview

---

## 🔦 Navigation Contracts

### 19. Navigation Contracts

- Define a central `routes.ts` or `routes.tsx` file to manage all route definitions.
- Each route entry should include:
  - A `path` (URL string)
  - A `name` (friendly identifier)
  - A `component` (lazy-loaded page component)
  - Optional route metadata (auth requirements, layout, breadcrumbs)
- Prefer lazy loading with `React.lazy()` and `Suspense` for page components.
- Export route constants for reuse in `Link`, `NavLink`, and redirect logic.
- Avoid hardcoding route paths across the app; reference the centralized route config instead.
- Example pattern:

```ts
// routes.ts
export const ROUTES = {
  HOME: { path: '/', name: 'Home', component: lazy(() => import('./pages/Home')) },
  ABOUT: { path: '/about', name: 'About', component: lazy(() => import('./pages/About')) },
  PROFILE: { path: '/profile/:id', name: 'Profile', component: lazy(() => import('./pages/Profile')) },
};
```

- Use `<Route>` definitions mapped from this contract file in your `AppRoutes` component:

```tsx
// AppRoutes.tsx
import { ROUTES } from './routes';

<Routes>
  {Object.values(ROUTES).map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ))}
</Routes>
```

- Route changes should only require updates in one place: `routes.ts`.

---

## 🔚 Conclusion

This architecture is optimized for autonomous development agents acting as competent ReactJS engineers. It emphasizes modularity, responsiveness, developer experience, and long-term maintainability.
