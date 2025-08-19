import React from 'react';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeviceProvider, useDevice, DeviceType } from '../DeviceContext';

// Test component to access DeviceContext
const TestComponent: React.FC = () => {
  const { state, isMobile, isDesktop, isTV, isTVProfile } = useDevice();
  
  return (
    <div>
      <div data-testid="device-type">{state.deviceType}</div>
      <div data-testid="screen-width">{state.screenWidth}</div>
      <div data-testid="screen-height">{state.screenHeight}</div>
      <div data-testid="is-mobile">{isMobile.toString()}</div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="is-tv">{isTV.toString()}</div>
      <div data-testid="is-tv-profile">{isTVProfile.toString()}</div>
      <div data-testid="is-touch">{state.isTouchDevice.toString()}</div>
      <div data-testid="orientation">{state.orientation}</div>
    </div>
  );
};

// Helper function to mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Helper function to mock touch device
const mockTouchDevice = (isTouch: boolean) => {
  if (isTouch) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: {},
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
  } else {
    // Properly remove touch properties
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  }
};

describe('DeviceContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default desktop dimensions
    mockWindowDimensions(1024, 768);
    mockTouchDevice(false);
  });

  afterEach(() => {
    cleanup();
    // Ensure clean state for next test
    mockTouchDevice(false);
  });

  describe('TV Profile Detection', () => {
    it('should detect TV profile when screen width is exactly 1920px', () => {
      mockWindowDimensions(1920, 1080);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
      expect(screen.getByTestId('screen-width')).toHaveTextContent('1920');
    });

    it('should not detect TV profile when screen width is 1919px', () => {
      mockWindowDimensions(1919, 1080);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
      expect(screen.getByTestId('screen-width')).toHaveTextContent('1919');
    });

    it('should not detect TV profile when screen width is 1921px', () => {
      mockWindowDimensions(1921, 1080);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
      expect(screen.getByTestId('screen-width')).toHaveTextContent('1921');
    });

    it('should detect TV profile regardless of height when width is 1920px', () => {
      // Test with different heights
      const heights = [720, 1080, 1440, 2160];
      
      heights.forEach(height => {
        cleanup();
        mockWindowDimensions(1920, height);
        
        render(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );

        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
        expect(screen.getByTestId('screen-width')).toHaveTextContent('1920');
        expect(screen.getByTestId('screen-height')).toHaveTextContent(height.toString());
      });
    });

    it('should not detect TV profile for mobile resolutions', () => {
      const mobileResolutions = [
        [375, 667], // iPhone
        [414, 896], // iPhone Plus
        [360, 640], // Android
      ];

      mobileResolutions.forEach(([width, height]) => {
        cleanup();
        mockWindowDimensions(width, height);
        
        render(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );

        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
      });
    });

    it('should not detect TV profile for desktop resolutions', () => {
      const desktopResolutions = [
        [1024, 768],
        [1366, 768],
        [1440, 900],
        [1680, 1050],
      ];

      desktopResolutions.forEach(([width, height]) => {
        cleanup();
        mockWindowDimensions(width, height);
        
        render(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );

        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
      });
    });
  });

  describe('Device Type Detection with TV Profile', () => {
    it('should maintain existing mobile detection logic', () => {
      mockWindowDimensions(375, 667);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.MOBILE);
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');
      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
    });

    it('should maintain existing desktop detection logic', () => {
      mockWindowDimensions(1024, 768);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.DESKTOP);
      expect(screen.getByTestId('is-desktop')).toHaveTextContent('true');
      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
    });

    it('should maintain existing TV detection logic (width >= 1920 and height >= 1080)', () => {
      mockWindowDimensions(1920, 1080);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.TV);
      expect(screen.getByTestId('is-tv')).toHaveTextContent('true');
      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
    });

    it('should detect TV device type but not TV profile for larger resolutions', () => {
      mockWindowDimensions(2560, 1440);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.TV);
      expect(screen.getByTestId('is-tv')).toHaveTextContent('true');
      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
    });
  });

  describe('State Persistence and Updates', () => {
    it('should update TV profile state when screen width changes to 1920px', async () => {
      // Start with desktop resolution
      mockWindowDimensions(1024, 768);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');

      // Simulate window resize to 1920px
      act(() => {
        mockWindowDimensions(1920, 1080);
        window.dispatchEvent(new Event('resize'));
      });

      // Wait for state update
      await waitFor(() => {
        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
        expect(screen.getByTestId('screen-width')).toHaveTextContent('1920');
      }, { timeout: 500 });
    });

    it('should update TV profile state when screen width changes from 1920px', async () => {
      // Start with TV profile resolution
      mockWindowDimensions(1920, 1080);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');

      // Simulate window resize away from 1920px
      act(() => {
        mockWindowDimensions(1024, 768);
        window.dispatchEvent(new Event('resize'));
      });

      // Wait for state update
      await waitFor(() => {
        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('false');
        expect(screen.getByTestId('screen-width')).toHaveTextContent('1024');
      }, { timeout: 500 });
    });

    it('should persist TV profile state during session', () => {
      mockWindowDimensions(1920, 1080);
      
      const { rerender } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');

      // Rerender component (simulating component updates)
      rerender(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
    });
  });

  describe('Touch Device Integration', () => {
    it('should handle TV profile detection with touch devices', () => {
      mockWindowDimensions(1920, 1080);
      mockTouchDevice(true);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
      expect(screen.getByTestId('is-touch')).toHaveTextContent('true');
      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.TV);
    });

    it('should handle TV profile detection with non-touch devices', () => {
      mockWindowDimensions(1920, 1080);
      mockTouchDevice(false);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
      expect(screen.getByTestId('is-touch')).toHaveTextContent('false');
      expect(screen.getByTestId('device-type')).toHaveTextContent(DeviceType.TV);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid width changes around 1920px', () => {
      const widths = [1918, 1919, 1920, 1921, 1922];
      
      widths.forEach(width => {
        cleanup();
        mockWindowDimensions(width, 1080);
        
        render(
          <DeviceProvider>
            <TestComponent />
          </DeviceProvider>
        );

        const expectedTVProfile = width === 1920;
        expect(screen.getByTestId('is-tv-profile')).toHaveTextContent(expectedTVProfile.toString());
      });
    });

    it('should handle orientation changes while maintaining TV profile detection', () => {
      // Portrait orientation with 1920px width (unusual but possible)
      mockWindowDimensions(1920, 3000);
      
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('is-tv-profile')).toHaveTextContent('true');
      expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
    });
  });
});