// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for useTVCameraNavigation hook to prevent test interference
vi.mock('./hooks/useTVCameraNavigation', () => ({
  useTVCameraNavigation: vi.fn(() => ({
    state: {
      activeDirections: new Set(),
      isZooming: false,
      zoomMode: 'in',
      isEnabled: false
    },
    callbacks: {
      onDirectionalInput: vi.fn(),
      onZoomStart: vi.fn(),
      onZoomEnd: vi.fn(),
      onZoomModeChange: vi.fn()
    },
    keyAcceleration: {},
    clearAllInputs: vi.fn()
  }))
}));
