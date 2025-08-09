import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FPSMonitor from '../FPSMonitor';
import { DeviceProvider } from '../../../state/DeviceContext';

// Mock canvas context for testing
const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
}));

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('FPSMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing in device context', () => {
    const { container } = render(
      <DeviceProvider>
        <FPSMonitor />
      </DeviceProvider>
    );

    // Should render the FPS monitor container
    const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
    expect(fpsMonitor).toBeInTheDocument();
  });

  it('renders canvas element', () => {
    const { container } = render(
      <DeviceProvider>
        <FPSMonitor />
      </DeviceProvider>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('applies correct positioning styles', () => {
    const { container } = render(
      <DeviceProvider>
        <FPSMonitor position="top-left" />
      </DeviceProvider>
    );

    const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
    expect(fpsMonitor).toHaveStyle({
      position: 'absolute',
      zIndex: '1000',
    });
  });
});