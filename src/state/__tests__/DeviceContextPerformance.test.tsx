import React, { useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider, useDevice, DeviceType } from '../DeviceContext';

// Mock window properties
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock navigator for touch detection
Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  configurable: true,
  value: 0,
});

// Test component that uses device context
const TestComponent: React.FC = () => {
  const { state, isMobile, isDesktop, isTV } = useDevice();
  const [renderCount, setRenderCount] = useState(0);

  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  return (
    <div>
      <div data-testid="device-type">{state.deviceType}</div>
      <div data-testid="screen-width">{state.screenWidth}</div>
      <div data-testid="screen-height">{state.screenHeight}</div>
      <div data-testid="is-mobile">{isMobile.toString()}</div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="is-tv">{isTV.toString()}</div>
      <div data-testid="render-count">{renderCount}</div>
    </div>
  );
};

// Component to test multiple consumers
const MultipleConsumersTest: React.FC = () => {
  return (
    <div>
      {Array.from({ length: 10 }, (_, i) => (
        <TestComponent key={i} />
      ))}
    </div>
  );
};

describe('DeviceContext Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
    window.innerHeight = 768;
    navigator.maxTouchPoints = 0;
  });

  describe('Initial Render Performance', () => {
    it('should initialize quickly', () => {
      const startTime = Date.now();
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(50); // Should initialize in less than 50ms

      expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
    });

    it('should handle multiple consumers efficiently', () => {
      const startTime = Date.now();
      
      render(
        <DeviceProvider>
          <MultipleConsumersTest />
        </DeviceProvider>
      );

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should handle 10 consumers in less than 100ms

      const deviceTypes = screen.getAllByTestId('device-type');
      expect(deviceTypes).toHaveLength(10);
      deviceTypes.forEach(element => {
        expect(element).toHaveTextContent('desktop');
      });
    });
  });

  describe('Resize Event Performance', () => {
    it('should handle resize events efficiently with debouncing', () => {
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Simulate multiple rapid resize events
      act(() => {
        window.innerWidth = 375;
        window.innerHeight = 667;
        fireEvent(window, new Event('resize'));
        
        window.innerWidth = 400;
        window.innerHeight = 700;
        fireEvent(window, new Event('resize'));
        
        window.innerWidth = 500;
        window.innerHeight = 800;
        fireEvent(window, new Event('resize'));
      });

      // Wait for debounced update
      act(() => {
        vi.advanceTimersByTime(200);
      });

      const finalRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');
      
      // Should not cause excessive re-renders due to debouncing
      expect(finalRenderCount - initialRenderCount).toBeLessThan(5);
      
      // Should update to mobile
      expect(screen.getByTestId('device-type')).toHaveTextContent('mobile');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
    });

    it('should clean up event listeners properly', () => {
      const { unmount } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });

  describe('Memoization Performance', () => {
    it('should memoize computed properties effectively', () => {
      const { rerender } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Re-render with same device state
      rerender(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const finalRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');
      
      // Should not cause unnecessary re-renders due to memoization
      expect(finalRenderCount).toBe(initialRenderCount);
    });

    it('should only re-render when device type actually changes', () => {
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Simulate resize that doesn't change device type (desktop to desktop)
      act(() => {
        window.innerWidth = 1200;
        window.innerHeight = 800;
        fireEvent(window, new Event('resize'));
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const afterResizeCount = parseInt(screen.getByTestId('render-count').textContent || '0');
      
      // Should still be desktop, minimal re-renders
      expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
      expect(afterResizeCount - initialRenderCount).toBeLessThan(3);
    });
  });

  describe('Touch Device Detection Performance', () => {
    it('should detect touch devices efficiently', () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        configurable: true
      });

      const startTime = Date.now();
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(50);

      // Should detect as mobile due to touch capability
      expect(screen.getByTestId('device-type')).toHaveTextContent('mobile');
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');

      // Clean up
      delete (window as any).ontouchstart;
    });
  });

  describe('Orientation Change Performance', () => {
    it('should handle orientation changes efficiently', () => {
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Simulate orientation change
      act(() => {
        window.innerWidth = 667;
        window.innerHeight = 375;
        fireEvent(window, new Event('orientationchange'));
      });

      // Wait for orientation change timeout
      act(() => {
        vi.advanceTimersByTime(150);
      });

      const finalRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');
      
      // Should handle orientation change efficiently
      expect(finalRenderCount - initialRenderCount).toBeLessThan(4);
      expect(screen.getByTestId('device-type')).toHaveTextContent('mobile');
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create excessive objects during updates', () => {
      const { rerender } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      // Get initial state
      const initialDeviceType = screen.getByTestId('device-type').textContent;
      const initialWidth = screen.getByTestId('screen-width').textContent;

      // Multiple re-renders should not cause memory leaks
      for (let i = 0; i < 5; i++) {
        rerender(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );
      }

      // State should remain consistent
      expect(screen.getByTestId('device-type')).toHaveTextContent(initialDeviceType || '');
      expect(screen.getByTestId('screen-width')).toHaveTextContent(initialWidth || '');
    });
  });

  describe('Context Value Stability', () => {
    it('should maintain stable context value when state unchanged', () => {
      let contextValueChanges = 0;
      
      const ContextValueTracker: React.FC = () => {
        const context = useDevice();
        
        React.useEffect(() => {
          contextValueChanges++;
        }, [context]);

        return <div>Tracking context changes</div>;
      };

      const { rerender } = render(
        <DeviceProvider>
          <ContextValueTracker />
        </DeviceProvider>
      );

      const initialChanges = contextValueChanges;

      // Re-render multiple times
      for (let i = 0; i < 3; i++) {
        rerender(
          <DeviceProvider>
            <ContextValueTracker />
          </DeviceProvider>
        );
      }

      // Context value should be stable (memoized)
      expect(contextValueChanges - initialChanges).toBeLessThan(2);
    });
  });

  describe('Device Type Calculation Performance', () => {
    it('should calculate device type efficiently for various screen sizes', () => {
      const testCases = [
        { width: 320, height: 568, expected: 'mobile' },
        { width: 768, height: 1024, expected: 'desktop' },
        { width: 1024, height: 768, expected: 'desktop' },
        { width: 1920, height: 1080, expected: 'tv' },
        { width: 2560, height: 1440, expected: 'tv' },
      ];

      testCases.forEach(({ width, height, expected }) => {
        const startTime = Date.now();
        
        window.innerWidth = width;
        window.innerHeight = height;

        const { unmount } = render(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );

        const calculationTime = Date.now() - startTime;
        expect(calculationTime).toBeLessThan(20); // Should calculate quickly
        
        expect(screen.getByTestId('device-type')).toHaveTextContent(expected);
        
        unmount();
      });
    });
  });
});

// Setup for timer mocks
vi.useFakeTimers();