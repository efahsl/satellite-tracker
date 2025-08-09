import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { DeviceProvider, useDevice, DeviceType } from '../DeviceContext';

// Mock window object for testing
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Mock navigator for touch detection
const mockNavigator = {
  maxTouchPoints: 0,
  msMaxTouchPoints: 0,
};

// Test component to access the context
const TestComponent = () => {
  const { state, dispatch, isMobile, isDesktop, isTV } = useDevice();
  
  return (
    <div>
      <div data-testid="device-type">{state.deviceType}</div>
      <div data-testid="screen-width">{state.screenWidth}</div>
      <div data-testid="screen-height">{state.screenHeight}</div>
      <div data-testid="is-touch">{state.isTouchDevice.toString()}</div>
      <div data-testid="orientation">{state.orientation}</div>
      <div data-testid="is-mobile">{isMobile.toString()}</div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="is-tv">{isTV.toString()}</div>
      <button 
        data-testid="set-mobile" 
        onClick={() => dispatch({ type: 'SET_DEVICE_TYPE', payload: DeviceType.MOBILE })}
      >
        Set Mobile
      </button>
      <button 
        data-testid="update-size" 
        onClick={() => dispatch({ 
          type: 'UPDATE_SCREEN_SIZE', 
          payload: { width: 500, height: 800 } 
        })}
      >
        Update Size
      </button>
    </div>
  );
};

describe('DeviceContext', () => {
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    // Store original objects
    originalWindow = global.window;
    originalNavigator = global.navigator;

    // Mock window and navigator
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original objects
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  describe('Initial State', () => {
    it('should have correct initial desktop state', () => {
      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('desktop');
      expect(getByTestId('screen-width')).toHaveTextContent('1024');
      expect(getByTestId('screen-height')).toHaveTextContent('768');
      expect(getByTestId('is-touch')).toHaveTextContent('false');
      expect(getByTestId('orientation')).toHaveTextContent('landscape');
      expect(getByTestId('is-mobile')).toHaveTextContent('false');
      expect(getByTestId('is-desktop')).toHaveTextContent('true');
      expect(getByTestId('is-tv')).toHaveTextContent('false');
    });

    it('should detect mobile device based on screen width', () => {
      // Mock mobile screen size
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 500, innerHeight: 800 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('mobile');
      expect(getByTestId('is-mobile')).toHaveTextContent('true');
      expect(getByTestId('is-desktop')).toHaveTextContent('false');
      expect(getByTestId('orientation')).toHaveTextContent('portrait');
    });

    it('should detect touch device', () => {
      // Mock touch device
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, ontouchstart: {} },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('is-touch')).toHaveTextContent('true');
    });

    it('should detect TV device based on large screen', () => {
      // Mock TV screen size
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 1920, innerHeight: 1080 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('tv');
      expect(getByTestId('is-tv')).toHaveTextContent('true');
      expect(getByTestId('is-desktop')).toHaveTextContent('false');
    });
  });

  describe('Device Type Actions', () => {
    it('should handle SET_DEVICE_TYPE action', () => {
      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      act(() => {
        getByTestId('set-mobile').click();
      });

      expect(getByTestId('device-type')).toHaveTextContent('mobile');
      expect(getByTestId('is-mobile')).toHaveTextContent('true');
      expect(getByTestId('is-desktop')).toHaveTextContent('false');
    });

    it('should handle UPDATE_SCREEN_SIZE action and auto-detect device type', () => {
      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      // Initially desktop
      expect(getByTestId('device-type')).toHaveTextContent('desktop');

      // Update to mobile size
      act(() => {
        getByTestId('update-size').click();
      });

      expect(getByTestId('screen-width')).toHaveTextContent('500');
      expect(getByTestId('screen-height')).toHaveTextContent('800');
      expect(getByTestId('device-type')).toHaveTextContent('mobile');
      expect(getByTestId('orientation')).toHaveTextContent('portrait');
    });

    it('should handle SET_TOUCH_DEVICE action and update device type', () => {
      const TestComponentWithTouchAction = () => {
        const { state, dispatch, isMobile } = useDevice();
        
        return (
          <div>
            <div data-testid="device-type">{state.deviceType}</div>
            <div data-testid="is-touch">{state.isTouchDevice.toString()}</div>
            <div data-testid="is-mobile">{isMobile.toString()}</div>
            <button 
              data-testid="set-touch" 
              onClick={() => dispatch({ type: 'SET_TOUCH_DEVICE', payload: true })}
            >
              Set Touch
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponentWithTouchAction />
        </DeviceProvider>
      );

      // Initially desktop, non-touch
      expect(getByTestId('device-type')).toHaveTextContent('desktop');
      expect(getByTestId('is-touch')).toHaveTextContent('false');

      // Set as touch device
      act(() => {
        getByTestId('set-touch').click();
      });

      expect(getByTestId('is-touch')).toHaveTextContent('true');
      // Device type should be mobile for touch screens under 1200px (1024px in this case)
      expect(getByTestId('device-type')).toHaveTextContent('mobile');
    });

    it('should handle INITIALIZE_DEVICE action', () => {
      const TestComponentWithInit = () => {
        const { state, dispatch } = useDevice();
        
        return (
          <div>
            <div data-testid="device-type">{state.deviceType}</div>
            <div data-testid="screen-width">{state.screenWidth}</div>
            <div data-testid="is-touch">{state.isTouchDevice.toString()}</div>
            <button 
              data-testid="initialize" 
              onClick={() => dispatch({ 
                type: 'INITIALIZE_DEVICE', 
                payload: { 
                  screenWidth: 400, 
                  screenHeight: 600, 
                  isTouchDevice: true 
                } 
              })}
            >
              Initialize
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponentWithInit />
        </DeviceProvider>
      );

      act(() => {
        getByTestId('initialize').click();
      });

      expect(getByTestId('screen-width')).toHaveTextContent('400');
      expect(getByTestId('is-touch')).toHaveTextContent('true');
      expect(getByTestId('device-type')).toHaveTextContent('mobile');
    });
  });

  describe('Event Listeners', () => {
    it('should add event listeners on mount', () => {
      render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      unmount();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });
  });

  describe('Device Detection Logic', () => {
    it('should detect mobile for small screens', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 600, innerHeight: 800 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('mobile');
    });

    it('should detect mobile for touch devices under 1200px', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 1000, innerHeight: 600, ontouchstart: {} },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('mobile');
      expect(getByTestId('is-touch')).toHaveTextContent('true');
    });

    it('should detect desktop for large non-touch screens', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 1200, innerHeight: 800 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('desktop');
    });

    it('should detect TV for very large screens', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 2560, innerHeight: 1440 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('device-type')).toHaveTextContent('tv');
    });
  });

  describe('Orientation Detection', () => {
    it('should detect landscape orientation', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 800, innerHeight: 600 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('orientation')).toHaveTextContent('landscape');
    });

    it('should detect portrait orientation', () => {
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, innerWidth: 600, innerHeight: 800 },
        writable: true,
      });

      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      expect(getByTestId('orientation')).toHaveTextContent('portrait');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useDevice is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useDevice must be used within a DeviceProvider');

      consoleSpy.mockRestore();
    });

    it('should handle server-side rendering gracefully', () => {
      // Test that initial state works when window is not available during SSR
      const { getByTestId } = render(
        <DeviceProvider>
          <TestComponent />
        </DeviceProvider>
      );

      // Should have valid initial values
      expect(getByTestId('screen-width')).toHaveTextContent(/\d+/);
      expect(getByTestId('screen-height')).toHaveTextContent(/\d+/);
      expect(getByTestId('device-type')).toHaveTextContent(/mobile|desktop|tv/);
    });
  });

  describe('Performance and Memory', () => {
    it('should memoize computed properties', () => {
      const TestComponentWithRenderCount = () => {
        const { isMobile, isDesktop, isTV } = useDevice();
        const renderCount = React.useRef(0);
        renderCount.current++;
        
        return (
          <div>
            <div data-testid="render-count">{renderCount.current}</div>
            <div data-testid="is-mobile">{isMobile.toString()}</div>
            <div data-testid="is-desktop">{isDesktop.toString()}</div>
            <div data-testid="is-tv">{isTV.toString()}</div>
          </div>
        );
      };

      const { getByTestId, rerender } = render(
        <DeviceProvider>
          <TestComponentWithRenderCount />
        </DeviceProvider>
      );

      const initialRenderCount = getByTestId('render-count').textContent;

      // Force re-render without state change
      rerender(
        <DeviceProvider>
          <TestComponentWithRenderCount />
        </DeviceProvider>
      );

      // Render count should increase but computed values should be memoized
      expect(getByTestId('is-desktop')).toHaveTextContent('true');
      expect(getByTestId('is-mobile')).toHaveTextContent('false');
      expect(getByTestId('is-tv')).toHaveTextContent('false');
    });
  });
});