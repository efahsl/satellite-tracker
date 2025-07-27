import { lazy } from 'react';

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Route definitions
export const ROUTES = {
  HOME: { path: '/', name: 'Home', component: Home },
  ABOUT: { path: '/about', name: 'About', component: About },
  NOT_FOUND: { path: '*', name: 'Not Found', component: NotFound },
};
