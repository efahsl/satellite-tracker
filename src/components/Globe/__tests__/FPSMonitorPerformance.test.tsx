import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider, DeviceType } from '../../../state/DeviceContext';
import FPSMonitor from '../FPSMonitor';

// Mock canvas context
const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  lineJoin: '',
}));

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

// Mock requestAnimationFrame
let animationFrameCallbacks: FrameRequestCallback[] = [];
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameCallbacks.push(callback);
  return animationFrameCallbacks.length;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  animationFrameCallbacks = animationFrameCallbacks.filter((_, index) => index + 1 !== id);
});

// Mock performance.now
let mockTime = 0;
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => mockTime),
  },
});

// Helper to advance time and trigger animation frames
const advanceTime = (ms: number) => {
  mockTime += ms;
  act(() => {
    animationFrameCallbacks.forEach(callback => callback(mockTime));
  });
};

// Mock device context - default to mobile for this test file
let currentMockDeviceContext = {
  state: {
    deviceType: DeviceType.MOBILE,
    screenWidth: 375,
    screenHeight: 667,
    isTouchDevice: true,
    orientation: 'portrait' as const
  },
  dispatch: vi.fn(),
  isMobile: true,
  isDesktop: false,
  isTV: false
};

vi.mock('../../../state/DeviceContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDevice: () => currentMockDeviceContext,
  };
});

const setMockDeviceType = (deviceType: DeviceType) => {
  currentMockDeviceContext = {
    state: {
      deviceType,
      screenWidth: deviceType === DeviceType.MOBILE ? 375 : 1024,
      screenHeight: deviceType === DeviceType.MOBILE ? 667 : 768,
      isTouchDevice: deviceType === DeviceType.MOBILE,
      orientation: deviceType === DeviceType.MOBILE ? 'portrait' as const : 'landscape' as const
    },
    dispatch: vi.fn(),
    isMobile: deviceType === DeviceType.MOBILE,
    isDesktop: deviceType === DeviceType.DESKTOP,
    isTV: deviceType === DeviceType.TV
  };
};

describe('FPS Monitor Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    mockTime = 0;
  });

  afterEach(() => {
    // Clean up any remaining animation frames
    animationFrameCallbacks = [];
  });

  describe('Mobile Optimization', () => {
    it('should render mobile variant efficiently', () => {
      const startTime = Date.now();
      
      setMockDeviceType(DeviceType.MOBILE);
      render(<FPSMonitor />);

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render quickly

      // Should show mobile-specific elements
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      
      // Should not show desktop-only elements (Avg, Min, Max)
      expect(screen.queryByText(/Avg:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Min:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Max:/)).not.toBeInTheDocument();
    });

    it('should use optimized dimensions for mobile', () => {
      render(
        <FPSMonitor graphWidth={140} graphHeight={60} />
      );

      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      
      // Mobile should use smaller dimensions (80% of original, max 110x48)
      expect(canvas.width).toBe(110); // Math.min(140 * 0.8, 110) = 110
      expect(canvas.height).toBe(48);  // Math.min(60 * 0.8, 48) = 48
    });
  });

  describe('Desktop Performance', () => {
    it('should render desktop variant with all metrics', () => {
      setMockDeviceType(DeviceType.DESKTOP);
      render(<FPSMonitor />);

      // Should show all desktop metrics
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Avg:/)).toBeInTheDocument();
      expect(screen.getByText(/Min:/)).toBeInTheDocument();
      expect(screen.getByText(/Max:/)).toBeInTheDocument();
    });

    it('should use full dimensions for desktop', () => {
      setMockDeviceType(DeviceType.DESKTOP);
      render(<FPSMonitor graphWidth={140} graphHeight={60} />);

      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      
      // Desktop should use full dimensions
      expect(canvas.width).toBe(140);
      expect(canvas.height).toBe(60);
    });
  });

  describe('Animation Performance', () => {
    it('should handle animation frames efficiently', () => {
      setMockDeviceType(DeviceType.MOBILE);
      render(<FPSMonitor />);

      // Should start animation loop
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      expect(animationFrameCallbacks).toHaveLength(1);

      // Advance time to trigger FPS calculation
      advanceTime(250); // FPS updates every 250ms

      // Should continue animation loop
      expect(animationFrameCallbacks.length).toBeGreaterThan(0);
    });

    it('should clean up animation frames on unmount', () => {
      setMockDeviceType(DeviceType.MOBILE);
      const { unmount } = render(<FPSMonitor />);

      expect(animationFrameCallbacks.length).toBeGreaterThan(0);

      unmount();

      // Should clean up animation frames
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Canvas Drawing Performance', () => {
    it('should optimize canvas drawing for mobile', () => {
      setMockDeviceType(DeviceType.MOBILE);
      render(<FPSMonitor />);

      // Trigger FPS update to cause canvas drawing
      advanceTime(250);

      const mockContext = mockGetContext();
      
      // Should use mobile-optimized line width
      expect(mockContext.lineWidth).toHaveBeenCalledWith(1.5);
    });

    it('should use standard canvas drawing for desktop', () => {
      setMockDeviceType(DeviceType.DESKTOP);
      render(<FPSMonitor />);

      // Trigger FPS update to cause canvas drawing
      advanceTime(250);

      const mockContext = mockGetContext();
      
      // Should use desktop line width
      expect(mockContext.lineWidth).toHaveBeenCalledWith(2);
    });
  });

  describe('Memory Usage', () => {
    it('should not create excessive objects during updates', () => {
      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <FPSMonitor />
        </MockDeviceProvider>
      );

      // Initial render
      const initialCallCount = mockGetContext.mock.calls.length;

      // Re-render with same props
      rerender(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <FPSMonitor />
        </MockDeviceProvider>
      );

      // Should not create excessive new contexts
      const finalCallCount = mockGetContext.mock.calls.length;
      expect(finalCallCount - initialCallCount).toBeLessThan(5);
    });

    it('should handle device type changes efficiently', () => {
      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <FPSMonitor />
        </MockDeviceProvider>
      );

      // Change device type
      rerender(
        <MockDeviceProvider deviceType={DeviceType.DESKTOP}>
          <FPSMonitor />
        </MockDeviceProvider>
      );

      // Should still be functional
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Avg:/)).toBeInTheDocument();
    });
  });

  describe('Memoization Effectiveness', () => {
    it('should memoize expensive calculations', () => {
      const { rerender } = render(
        <FPSMonitor graphWidth={140} graphHeight={60} />
      );

      const canvas1 = document.querySelector('canvas') as HTMLCanvasElement;
      const dimensions1 = { width: canvas1.width, height: canvas1.height };

      // Re-render with same props
      rerender(
        <FPSMonitor graphWidth={140} graphHeight={60} />
      );

      const canvas2 = document.querySelector('canvas') as HTMLCanvasElement;
      const dimensions2 = { width: canvas2.width, height: canvas2.height };

      // Dimensions should be the same (memoized)
      expect(dimensions1).toEqual(dimensions2);
    });
  });

  describe('Performance Thresholds', () => {
    it('should handle performance warnings efficiently', () => {
      render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <FPSMonitor criticalThreshold={20} />
        </MockDeviceProvider>
      );

      // Should not show warning initially (FPS starts at 60)
      expect(screen.queryByText(/Low Performance/)).not.toBeInTheDocument();

      // The component should handle low FPS scenarios without performance issues
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    });
  });
});