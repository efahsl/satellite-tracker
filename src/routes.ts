import { lazy } from 'react';

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ResponsiveTest = lazy(() => import('./components/ResponsiveUtilitiesTest'));
const TVFocusTest = lazy(() => import('./test-tv-focus-manager'));

// Route definitions
export const ROUTES = {
  HOME: { path: '/', name: 'Home', component: Home },
  ABOUT: { path: '/about', name: 'About', component: About },
  RESPONSIVE_TEST: { path: '/responsive-test', name: 'Responsive Test', component: ResponsiveTest },
  TV_FOCUS_TEST: { path: '/tv-focus-test', name: 'TV Focus Test', component: TVFocusTest },
  NOT_FOUND: { path: '*', name: 'Not Found', component: NotFound },
};
