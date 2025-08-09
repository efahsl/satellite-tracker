import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider, DeviceType } from '../../../state/DeviceContext';
import FPSMonitor from '../FPSMonitor';

// Mock canvas and animation frame for mobile testing
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    lineJoin: '',
  })),
  width: 0,
  height: 0,
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext,
});

// Mock requestAnimationFrame for controlled testing
let animationCallbacks: FrameRequestCallback[] = [];
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationCallbacks.push(callback);
  return animationCallbacks.length;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now
let mockTime = 0;
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => mockTime),
  },
});

// Mock mobile device context
const MockMobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DeviceProvider>
      {children}
    </DeviceProvider>
  );
};

// Mock different mobile screen sizes
const mobileScreenSizes = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 375, height: 812, name: 'iPhone X' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 360, height: 640, name: 'Galaxy S5' },
];

describe('FPS Monitor Mobile Performance and Usability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationCallbacks = [];
    mockTime = 0;
    
    // Mock mobile environment
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      configurable: true
    });
  });

  afterEach(() => {
    animationCallbacks = [];
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true
    });
  });

  describe('Mobile Layout Optimization', () => {
    mobileScreenSizes.forEach(({ width, height, name }) => {
      it(`should render optimized layout on ${name} (${width}x${height})`, () => {
        // Set mobile screen size
        Object.defineProperty(window, 'innerWidth', {
          value: width,
          configurable: true
        });
        Object.defineProperty(window, 'innerHeight', {
          value: height,
          configurable: true
        });

        render(
          <MockMobileProvider>
            <FPSMonitor />
          </MockMobileProvider>
        );

        // Should show mobile variant (only FPS, no Avg/Min/Max)
        expect(screen.getByText(/FPS:/)).toBeInTheDocument();
        expect(screen.queryByText(/Avg:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Min:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Max:/)).not.toBeInTheDocument();

        // Should have mobile-optimized styling
        const fpsContainer = screen.getByText(/FPS:/).closest('div');
        expect(fpsContainer).toHaveStyle({
          fontSize: '11px',
          padding: '6px 8px',
          minWidth: '90px',
          maxWidth: '120px'
        });
      });
    });
  });

  describe('Mobile Canvas Optimization', () => {
    it('should use mobile-optimized canvas dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });

      render(
        <MockMobileProvider>
          <FPSMonitor graphWidth={140} graphHeight={60} />
        </MockMobileProvider>
      );

      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      
      // Mobile should use 80% of original size, max 110x48
      expect(canvas.width).toBe(110); // Math.min(140 * 0.8, 110)
      expect(canvas.height).toBe(48);  // Math.min(60 * 0.8, 48)
    });

    it('should handle canvas drawing efficiently on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      // Advance time to trigger FPS calculation and canvas drawing
      mockTime = 250;
      act(() => {
        animationCallbacks.forEach(callback => callback(mockTime));
      });

      // Should have called getContext for canvas operations
      expect(mockCanvas.getContext).toHaveBeenCalled();
    });
  });

  describe('Mobile Performance Monitoring', () => {
    it('should handle performance warnings appropriately on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor criticalThreshold={20} warningThreshold={30} />
        </MockMobileProvider>
      );

      // Initially should not show warning (starts at 60 FPS)
      expect(screen.queryByText(/Low Performance/)).not.toBeInTheDocument();

      // Should show FPS value with appropriate color coding
      const fpsValue = screen.getByText('60');
      expect(fpsValue).toHaveStyle({ color: 'rgb(0, 255, 0)' }); // Green for good FPS
    });

    it('should update FPS efficiently on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      expect(screen.getByText('60')).toBeInTheDocument(); // Initial FPS

      // Simulate frame updates
      mockTime = 250; // First update interval
      act(() => {
        animationCallbacks.forEach(callback => callback(mockTime));
      });

      mockTime = 500; // Second update interval
      act(() => {
        animationCallbacks.forEach(callback => callback(mockTime));
      });

      // Should continue to show FPS updates
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    });
  });

  describe('Mobile Touch Interaction', () => {
    it('should be non-interactive on mobile (pointer-events: none)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      const fpsContainer = screen.getByText(/FPS:/).closest('div');
      expect(fpsContainer).toHaveStyle({
        pointerEvents: 'none',
        userSelect: 'none'
      });
    });

    it('should have touch-friendly canvas properties', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      expect(canvas).toHaveStyle({ touchAction: 'none' });
    });
  });

  describe('Mobile Memory and Performance', () => {
    it('should clean up resources properly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      const { unmount } = render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      expect(animationCallbacks.length).toBeGreaterThan(0);

      unmount();

      // Should clean up animation frames
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should handle rapid orientation changes efficiently', async () => {
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      const { rerender } = render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      expect(screen.getByText(/FPS:/)).toBeInTheDocument();

      // Change to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });

      rerender(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      // Should still work after orientation change
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    });
  });

  describe('Mobile Visual Optimization', () => {
    it('should use mobile-optimized positioning', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor position="top-right" />
        </MockMobileProvider>
      );

      const fpsContainer = screen.getByText(/FPS:/).closest('div');
      
      // Should use mobile-specific positioning (8px instead of 10px)
      expect(fpsContainer).toHaveStyle({
        position: 'absolute',
        top: '8px',
        right: '8px'
      });
    });

    it('should have mobile-optimized visual styling', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      const fpsContainer = screen.getByText(/FPS:/).closest('div');
      
      // Should have mobile-optimized styling
      expect(fpsContainer).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      });
    });
  });

  describe('Mobile Error Handling', () => {
    it('should handle canvas context creation failure gracefully', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      // Mock canvas context creation failure
      mockCanvas.getContext.mockReturnValueOnce(null);
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      // Should still render the FPS display even if canvas fails
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    });

    it('should handle animation frame errors gracefully', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      // Mock requestAnimationFrame to throw error
      global.requestAnimationFrame = vi.fn(() => {
        throw new Error('Animation frame error');
      });

      // Should not crash when rendering
      expect(() => {
        render(
          <MockMobileProvider>
            <FPSMonitor />
          </MockMobileProvider>
        );
      }).not.toThrow();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should maintain accessibility on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      const fpsContainer = screen.getByText(/FPS:/).closest('div');
      
      // Should not interfere with screen readers
      expect(fpsContainer).toHaveStyle({
        userSelect: 'none',
        pointerEvents: 'none'
      });
    });

    it('should have readable text on mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MockMobileProvider>
          <FPSMonitor />
        </MockMobileProvider>
      );

      const fpsText = screen.getByText(/FPS:/);
      const fpsValue = screen.getByText('60');
      
      // Should have readable font sizes
      expect(fpsText.closest('div')).toHaveStyle({
        fontSize: '12px',
        fontWeight: 'bold'
      });
      
      // Should have good contrast
      expect(fpsValue).toHaveStyle({
        color: 'rgb(0, 255, 0)' // Green for good performance
      });
    });
  });
});