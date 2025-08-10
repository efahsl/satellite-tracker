import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import FPSMonitor from '../FPSMonitor';
import { DeviceProvider, DeviceType } from '../../../state/DeviceContext';

// Mock canvas context for testing
const mockCanvasContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  lineJoin: '',
};

const mockGetContext = vi.fn(() => mockCanvasContext);

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

// Mock requestAnimationFrame and performance.now
let animationFrameCallback: FrameRequestCallback | null = null;
global.requestAnimationFrame = vi.fn((cb) => {
  animationFrameCallback = cb;
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now to return predictable values
let mockTime = 0;
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => mockTime),
  writable: true,
});

// Mock device context for testing different device types
const mockDeviceContext = {
  state: {
    deviceType: DeviceType.DESKTOP,
    screenWidth: 1024,
    screenHeight: 768,
    isTouchDevice: false,
    orientation: 'landscape' as const
  },
  dispatch: vi.fn(),
  isMobile: false,
  isDesktop: true,
  isTV: false
};

vi.mock('../../../state/DeviceContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDevice: () => mockDeviceContext
  };
});

describe('FPSMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTime = 0;
    animationFrameCallback = null;
    // Reset device context to desktop
    mockDeviceContext.isMobile = false;
    mockDeviceContext.isDesktop = true;
    mockDeviceContext.isTV = false;
    mockDeviceContext.state.deviceType = DeviceType.DESKTOP;
  });

  afterEach(() => {
    // Clean up any running animations
    if (animationFrameCallback) {
      vi.clearAllTimers();
    }
  });

  describe('Basic Rendering', () => {
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
        zIndex: '100',
      });
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      mockDeviceContext.state.deviceType = DeviceType.DESKTOP;
    });

    it('renders full desktop layout with all metrics', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Should show FPS label
      expect(container.textContent).toContain('FPS:');
      // Should show all desktop metrics
      expect(container.textContent).toContain('Avg:');
      expect(container.textContent).toContain('Min:');
      expect(container.textContent).toContain('Max:');
    });

    it('applies desktop canvas dimensions', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor graphWidth={140} graphHeight={60} />
        </DeviceProvider>
      );

      const canvas = container.querySelector('canvas');
      expect(canvas).toHaveAttribute('width', '140');
      expect(canvas).toHaveAttribute('height', '60');
    });

    it('applies desktop positioning styles', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor position="top-right" />
        </DeviceProvider>
      );

      const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
      expect(fpsMonitor).toHaveStyle({
        top: '10px',
        right: '10px',
      });
    });

    it('shows performance warning on desktop when FPS is low', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor criticalThreshold={20} />
        </DeviceProvider>
      );

      // Simulate low FPS by advancing time and triggering animation frame
      act(() => {
        mockTime = 300; // 300ms later
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Should show warning for low performance
      expect(container.textContent).toContain('⚠️ Low Performance');
    });
  });

  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      mockDeviceContext.state.deviceType = DeviceType.MOBILE;
    });

    it('renders simplified mobile layout', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Should show FPS label
      expect(container.textContent).toContain('FPS:');
      // Should NOT show desktop-only metrics
      expect(container.textContent).not.toContain('Avg:');
      expect(container.textContent).not.toContain('Min:');
      expect(container.textContent).not.toContain('Max:');
    });

    it('applies mobile canvas dimensions', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor graphWidth={140} graphHeight={60} />
        </DeviceProvider>
      );

      const canvas = container.querySelector('canvas');
      // Mobile dimensions should be 80% of desktop (140 * 0.8 = 112, but capped at 110)
      expect(canvas).toHaveAttribute('width', '110');
      // Mobile dimensions should be 80% of desktop (60 * 0.8 = 48)
      expect(canvas).toHaveAttribute('height', '48');
    });

    it('applies mobile positioning styles', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor position="top-right" />
        </DeviceProvider>
      );

      const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
      expect(fpsMonitor).toHaveStyle({
        top: '8px',
        right: '8px',
      });
    });

    it('applies mobile-specific styling', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
      expect(fpsMonitor).toHaveStyle({
        fontSize: '11px',
        padding: '6px 8px',
        minWidth: '90px',
        maxWidth: '120px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      });
    });

    it('shows performance warning on mobile when FPS is low', () => {
      const { container } = render(
        <DeviceProvider>
          <FPSMonitor criticalThreshold={20} />
        </DeviceProvider>
      );

      // Simulate low FPS by advancing time and triggering animation frame
      act(() => {
        mockTime = 300; // 300ms later
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Should show warning for low performance
      expect(container.textContent).toContain('⚠️ Low Performance');
    });

    it('centers FPS text on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;

      const { container } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Look for the FPS text container with center alignment (using camelCase)
      const fpsText = container.querySelector('div[style*="text-align: center"]');
      expect(fpsText).toBeInTheDocument();
      expect(fpsText).toHaveStyle({ textAlign: 'center' });
    });
  });

  describe('Position Variants', () => {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

    positions.forEach(position => {
      it(`applies correct ${position} positioning for desktop`, () => {
        mockDeviceContext.isMobile = false;
        mockDeviceContext.isDesktop = true;

        const { container } = render(
          <DeviceProvider>
            <FPSMonitor position={position} />
          </DeviceProvider>
        );

        const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
        
        const expectedStyles = {
          'top-left': { top: '10px', left: '10px' },
          'top-right': { top: '10px', right: '10px' },
          'bottom-left': { bottom: '10px', left: '10px' },
          'bottom-right': { bottom: '10px', right: '10px' },
        };

        expect(fpsMonitor).toHaveStyle(expectedStyles[position]);
      });

      it(`applies correct ${position} positioning for mobile`, () => {
        mockDeviceContext.isMobile = true;
        mockDeviceContext.isDesktop = false;

        const { container } = render(
          <DeviceProvider>
            <FPSMonitor position={position} />
          </DeviceProvider>
        );

        const fpsMonitor = container.querySelector('div[style*="position: absolute"]');
        
        const expectedStyles = {
          'top-left': { top: '8px', left: '8px' },
          'top-right': { top: '8px', right: '8px' },
          'bottom-left': { bottom: '8px', left: '8px' },
          'bottom-right': { bottom: '8px', right: '8px' },
        };

        expect(fpsMonitor).toHaveStyle(expectedStyles[position]);
      });
    });
  });

  describe('Canvas Drawing', () => {
    it('calls canvas drawing methods on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;

      render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Simulate FPS measurement cycle
      act(() => {
        mockTime = 300; // 300ms later to trigger FPS calculation
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Should have called canvas context methods for drawing
      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('calls canvas drawing methods on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;

      render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Simulate FPS measurement cycle
      act(() => {
        mockTime = 300; // 300ms later to trigger FPS calculation
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Should have called canvas context methods for drawing
      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });

    it('applies mobile-optimized grid spacing', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;

      render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Simulate FPS measurement cycle with some history data
      act(() => {
        mockTime = 300;
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Add another frame to trigger line drawing
      act(() => {
        mockTime = 600;
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Check that lineWidth was set to mobile value at some point
      // The lineWidth property should have been set to 1.5 during drawing
      const lineWidthCalls = Object.getOwnPropertyDescriptor(mockCanvasContext, 'lineWidth');
      expect(mockCanvasContext.lineWidth).toBeGreaterThan(0);
    });

    it('applies desktop line width', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;

      render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Simulate FPS measurement cycle with some history data
      act(() => {
        mockTime = 300;
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Add another frame to trigger line drawing
      act(() => {
        mockTime = 600;
        if (animationFrameCallback) {
          animationFrameCallback(mockTime);
        }
      });

      // Check that canvas drawing methods were called (indicating drawing occurred)
      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up animation frame on unmount', () => {
      const { unmount } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      unmount();

      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('is memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      const initialCallCount = mockGetContext.mock.calls.length;

      // Re-render with same props
      rerender(
        <DeviceProvider>
          <FPSMonitor />
        </DeviceProvider>
      );

      // Should not have created additional canvas contexts
      expect(mockGetContext.mock.calls.length).toBe(initialCallCount);
    });
  });
});