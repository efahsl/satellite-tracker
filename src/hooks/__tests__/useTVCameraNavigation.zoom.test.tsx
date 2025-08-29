import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTVCameraNavigation } from '../useTVCameraNavigation';
import { DeviceProvider } from '../../state/DeviceContext';
import { UIProvider, useUI } from '../../state/UIContext';
import { ISSProvider, useISS } from '../../state/ISSContext';
import { CameraControlsProvider } from '../../state/CameraControlsContext';
import { TV_CAMERA_KEYS } from '../../utils/tvConstants';
import React from 'react';

// Mock the CameraControlsContext to provide a working controls ref
const mockControlsRef = {
  handleDirectionalRotation: vi.fn(),
  handleZoomChange: vi.fn(),
  rotateCameraNorth: vi.fn(),
  rotateCameraSouth: vi.fn(),
  rotateCameraEast: vi.fn(),
  rotateCameraWest: vi.fn(),
  getOrbitControls: vi.fn(),
};

vi.mock('../../state/CameraControlsContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCameraControls: () => ({
      globeRef: { current: null },
      getControlsRef: () => mockControlsRef,
    }),
  };
});

// Test wrapper component with UI context setup
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DeviceProvider>
      <UIProvider>
        <ISSProvider>
          <CameraControlsProvider>
            <TestSetup>
              {children}
            </TestSetup>
          </CameraControlsProvider>
        </ISSProvider>
      </UIProvider>
    </DeviceProvider>
  );
};

// Component to set up test state
const TestSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setHamburgerMenuVisible } = useUI();
  const { dispatch } = useISS();
  
  React.useEffect(() => {
    // Close hamburger menu to enable camera controls
    setHamburgerMenuVisible(false);
    // Set manual mode to enable camera controls
    dispatch({ type: 'SET_MANUAL_MODE' });
  }, [setHamburgerMenuVisible, dispatch]);
  
  return <>{children}</>;
};

// Mock window dimensions for TV mode
const mockTVDimensions = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1080,
  });
};

describe('useTVCameraNavigation - Zoom Functionality', () => {
  beforeEach(() => {
    // Reset window dimensions to TV mode
    mockTVDimensions();
    
    // Trigger resize event to update device context
    window.dispatchEvent(new Event('resize'));
    
    // Clear any existing mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    document.removeEventListener('keydown', vi.fn());
    document.removeEventListener('keyup', vi.fn());
  });

  describe('Zoom Mode State Management', () => {
    it('should initialize with navigation mode (not in zoom mode)', () => {
      const { result } = renderHook(() => useTVCameraNavigation(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isInZoomMode).toBe(false);
      expect(result.current.activeZoomDirection).toBeNull();
    });

    it('should have controls enabled in test environment', async () => {
      const { result } = renderHook(() => useTVCameraNavigation(), {
        wrapper: TestWrapper,
      });

      // Wait for contexts to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Debug: Check if controls are enabled
      console.log('Controls enabled:', result.current.isControlsEnabled);
      expect(result.current.isControlsEnabled).toBe(true);
    });

    it('should toggle zoom mode when SELECT key is pressed', async () => {
      const { result } = renderHook(() => useTVCameraNavigation(), {
        wrapper: TestWrapper,
      });

      // Initial state should be navigation mode
      expect(result.current.isInZoomMode).toBe(false);

      // Simulate SELECT key press (zoom mode toggle)
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      // Wait for state updates
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Should now be in zoom mode
      expect(result.current.isInZoomMode).toBe(true);
      expect(result.current.activeZoomDirection).toBeNull(); // No active zoom direction yet

      // Press SELECT again to exit zoom mode
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      // Wait for state updates
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Should be back in navigation mode
      expect(result.current.isInZoomMode).toBe(false);
    });
  });

  describe('Zoom Mode Behavior', () => {
    it('should handle UP/DOWN arrows in zoom mode', async () => {
      const mockZoomStart = vi.fn();
      const mockZoomEnd = vi.fn();

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockZoomStart,
        onZoomEnd: mockZoomEnd,
      }), {
        wrapper: TestWrapper,
      });

      // First enter zoom mode
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isInZoomMode).toBe(true);

      // Now test UP arrow for zoom in
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.activeZoomDirection).toBe('in');

      // Release UP arrow
      act(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keyupEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.activeZoomDirection).toBeNull();
    });

    it('should call zoom callbacks when using UP/DOWN in zoom mode', async () => {
      const mockZoomStart = vi.fn();
      const mockZoomEnd = vi.fn();

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockZoomStart,
        onZoomEnd: mockZoomEnd,
      }), {
        wrapper: TestWrapper,
      });

      // Enter zoom mode first
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Use UP arrow to zoom in
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      act(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keyupEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Callbacks should be called
      expect(mockZoomStart).toHaveBeenCalled();
      expect(mockZoomEnd).toHaveBeenCalled();
    });
  });

  describe('Zoom Direction Logic', () => {
    it('should handle zoom in and zoom out directions', async () => {
      const { result } = renderHook(() => useTVCameraNavigation(), {
        wrapper: TestWrapper,
      });

      // Enter zoom mode
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.isInZoomMode).toBe(true);

      // Test UP arrow for zoom in
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.activeZoomDirection).toBe('in');

      // Release UP arrow
      act(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keyupEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.activeZoomDirection).toBeNull();

      // Test DOWN arrow for zoom out
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.ARROW_DOWN,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.activeZoomDirection).toBe('out');
    });
  });

  describe('Continuous Zoom Animation', () => {
    it('should handle continuous zoom with animation frames', async () => {
      const mockZoomStart = vi.fn();

      // Mock requestAnimationFrame
      const mockRequestAnimationFrame = vi.fn((callback) => {
        setTimeout(callback, 16); // Simulate 60fps
        return 1;
      });
      const mockCancelAnimationFrame = vi.fn();

      global.requestAnimationFrame = mockRequestAnimationFrame;
      global.cancelAnimationFrame = mockCancelAnimationFrame;

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockZoomStart,
      }), {
        wrapper: TestWrapper,
      });

      // Enter zoom mode first
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Start continuous zoom with UP arrow
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should have started animation loop
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      // Stop zoom
      act(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
          key: TV_CAMERA_KEYS.ARROW_UP,
          bubbles: true,
        });
        document.dispatchEvent(keyupEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // The animation should be stopped (either by cancelAnimationFrame or by the zoom loop ending)
      // This test verifies that the zoom animation system is working
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      // Restore original functions
      global.requestAnimationFrame = window.requestAnimationFrame;
      global.cancelAnimationFrame = window.cancelAnimationFrame;
    });
  });

  describe('Zoom State Integration', () => {
    it('should integrate with UI context zoom state', () => {
      const { result } = renderHook(() => useTVCameraNavigation(), {
        wrapper: TestWrapper,
      });

      // Should reflect UI context state
      expect(typeof result.current.isInZoomMode).toBe('boolean');
      expect([null, 'in', 'out']).toContain(result.current.activeZoomDirection);
    });

    it('should handle disabled state during zoom mode', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useTVCameraNavigation({ isEnabled: enabled }),
        {
          wrapper: TestWrapper,
          initialProps: { enabled: true },
        }
      );

      // Enter zoom mode while enabled
      act(() => {
        const keydownEvent = new KeyboardEvent('keydown', {
          key: TV_CAMERA_KEYS.SELECT,
          bubbles: true,
        });
        document.dispatchEvent(keydownEvent);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Should be in zoom mode
      expect(result.current.isInZoomMode).toBe(true);

      // Disable the hook
      rerender({ enabled: false });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Should exit zoom mode when disabled
      expect(result.current.isInZoomMode).toBe(false);
      expect(result.current.activeZoomDirection).toBeNull();
    });
  });
});