import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DIRECTIONAL_INPUTS, ZOOM_MODES, TV_REMOTE_KEYS } from '../../utils/tvCameraConfig';

// Override the global mock to use the real implementation for this test
vi.mock('../useTVCameraNavigation', async () => {
  const actual = await vi.importActual('../useTVCameraNavigation');
  return actual;
});

import { useTVCameraNavigation } from '../useTVCameraNavigation';
import { useDevice } from '../../state/DeviceContext';
import { useUI } from '../../state/UIContext';
import { useISS } from '../../state/ISSContext';

// Mock the context hooks
vi.mock('../../state/DeviceContext');
vi.mock('../../state/UIContext');
vi.mock('../../state/ISSContext');

const mockUseDevice = vi.mocked(useDevice);
const mockUseUI = vi.mocked(useUI);
const mockUseISS = vi.mocked(useISS);

// Mock timers
vi.useFakeTimers();

describe('useTVCameraNavigation', () => {
  const mockSetZoomMode = vi.fn();
  const mockSetZooming = vi.fn();
  const mockOnDirectionalInput = vi.fn();
  const mockOnZoomStart = vi.fn();
  const mockOnZoomEnd = vi.fn();
  const mockOnZoomModeChange = vi.fn();

  // Default mock values
  const defaultDeviceState = {
    isTVProfile: true
  };

  const defaultUIState = {
    state: {
      hamburgerMenuVisible: false,
      zoomMode: ZOOM_MODES.IN as const,
      isZooming: false
    },
    setZoomMode: mockSetZoomMode,
    setZooming: mockSetZooming
  };

  const defaultISSState = {
    state: {
      followISS: false,
      earthRotateMode: false
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Set up default mocks
    mockUseDevice.mockReturnValue(defaultDeviceState as any);
    mockUseUI.mockReturnValue(defaultUIState as any);
    mockUseISS.mockReturnValue(defaultISSState as any);

    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Hook Initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      expect(result.current.state).toEqual({
        activeDirections: new Set(),
        isZooming: false,
        zoomMode: ZOOM_MODES.IN,
        isEnabled: true
      });
    });

    it('provides callback functions', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      expect(typeof result.current.callbacks.onDirectionalInput).toBe('function');
      expect(typeof result.current.callbacks.onZoomStart).toBe('function');
      expect(typeof result.current.callbacks.onZoomEnd).toBe('function');
      expect(typeof result.current.callbacks.onZoomModeChange).toBe('function');
    });

    it('provides utility functions', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      expect(typeof result.current.clearAllInputs).toBe('function');
      expect(typeof result.current.keyAcceleration).toBe('object');
    });
  });

  describe('Enable/Disable Logic', () => {
    it('is enabled when all conditions are met', () => {
      const { result } = renderHook(() => useTVCameraNavigation());
      
      expect(result.current.state.isEnabled).toBe(true);
    });

    it('is disabled when not in TV profile', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: false
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation());
      
      expect(result.current.state.isEnabled).toBe(false);
    });

    it('is disabled when hamburger menu is visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: true
        }
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation());
      
      expect(result.current.state.isEnabled).toBe(false);
    });

    it('is disabled when following ISS', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: true,
          earthRotateMode: false
        }
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation());
      
      expect(result.current.state.isEnabled).toBe(false);
    });

    it('is disabled when in Earth rotate mode', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: false,
          earthRotateMode: true
        }
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation());
      
      expect(result.current.state.isEnabled).toBe(false);
    });

    it('is disabled when explicitly disabled via options', () => {
      const { result } = renderHook(() => useTVCameraNavigation({ enabled: false }));
      
      expect(result.current.state.isEnabled).toBe(false);
    });
  });

  describe('Directional Input Handling', () => {
    it('handles arrow up key press', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(true);
      expect(mockOnDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.UP, true);
    });

    it('handles arrow down key press', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_DOWN });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.DOWN)).toBe(true);
      expect(mockOnDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.DOWN, true);
    });

    it('handles arrow left key press', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_LEFT });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.LEFT)).toBe(true);
      expect(mockOnDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.LEFT, true);
    });

    it('handles arrow right key press', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_RIGHT });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.RIGHT)).toBe(true);
      expect(mockOnDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.RIGHT, true);
    });

    it('handles key release', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      // Press key
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(true);

      // Release key
      act(() => {
        const event = new KeyboardEvent('keyup', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(false);
      expect(mockOnDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.UP, false);
    });

    it('handles multiple simultaneous key presses', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      act(() => {
        const upEvent = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        const rightEvent = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_RIGHT });
        window.dispatchEvent(upEvent);
        window.dispatchEvent(rightEvent);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(true);
      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.RIGHT)).toBe(true);
      expect(result.current.state.activeDirections.size).toBe(2);
    });

    it('ignores directional input when disabled', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: false
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation({
        onDirectionalInput: mockOnDirectionalInput
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(0);
      expect(mockOnDirectionalInput).not.toHaveBeenCalled();
    });
  });

  describe('Zoom Handling', () => {
    it('starts zoom on Enter key press', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockOnZoomStart
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      expect(mockSetZooming).toHaveBeenCalledWith(true);
      expect(mockOnZoomStart).toHaveBeenCalled();
    });

    it('ends zoom on Enter key release', () => {
      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomEnd: mockOnZoomEnd,
        onZoomModeChange: mockOnZoomModeChange
      }));

      // Start zoom
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      // Update UI state to reflect zooming
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          isZooming: true
        }
      } as any);

      // End zoom
      act(() => {
        const event = new KeyboardEvent('keyup', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      expect(mockSetZooming).toHaveBeenCalledWith(false);
      expect(mockOnZoomEnd).toHaveBeenCalled();
    });

    it('cycles zoom mode when zoom ends', () => {
      // Start with zoom mode IN and zooming active
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          zoomMode: ZOOM_MODES.IN,
          isZooming: true
        }
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomModeChange: mockOnZoomModeChange
      }));

      // End zoom
      act(() => {
        const event = new KeyboardEvent('keyup', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      expect(mockSetZoomMode).toHaveBeenCalledWith(ZOOM_MODES.OUT);
      expect(mockOnZoomModeChange).toHaveBeenCalledWith(ZOOM_MODES.OUT);
    });

    it('ignores zoom input when disabled', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: false
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockOnZoomStart
      }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      expect(mockSetZooming).not.toHaveBeenCalled();
      expect(mockOnZoomStart).not.toHaveBeenCalled();
    });

    it('prevents multiple zoom starts', () => {
      // Set up UI state to reflect already zooming
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          isZooming: true
        }
      } as any);

      const { result } = renderHook(() => useTVCameraNavigation({
        onZoomStart: mockOnZoomStart
      }));

      // Clear any calls from initialization
      mockOnZoomStart.mockClear();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.SELECT });
        window.dispatchEvent(event);
      });

      // Should not call zoom start again
      expect(mockOnZoomStart).not.toHaveBeenCalled();
    });
  });

  describe('Key Acceleration', () => {
    it('tracks key acceleration for held keys', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      // Fast forward time to trigger acceleration
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should have acceleration data
      expect(typeof result.current.keyAcceleration).toBe('object');
    });

    it('clears acceleration on key release', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      // Press key
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      // Release key
      act(() => {
        const event = new KeyboardEvent('keyup', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.keyAcceleration[TV_REMOTE_KEYS.ARROW_UP]).toBeUndefined();
    });
  });

  describe('Manual Control Callbacks', () => {
    it('allows manual directional input control', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      act(() => {
        result.current.callbacks.onDirectionalInput(DIRECTIONAL_INPUTS.UP, true);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(true);

      act(() => {
        result.current.callbacks.onDirectionalInput(DIRECTIONAL_INPUTS.UP, false);
      });

      expect(result.current.state.activeDirections.has(DIRECTIONAL_INPUTS.UP)).toBe(false);
    });

    it('allows manual zoom control', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      act(() => {
        result.current.callbacks.onZoomStart();
      });

      expect(mockSetZooming).toHaveBeenCalledWith(true);

      act(() => {
        result.current.callbacks.onZoomEnd();
      });

      expect(mockSetZooming).toHaveBeenCalledWith(false);
    });

    it('allows manual zoom mode cycling', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      act(() => {
        result.current.callbacks.onZoomModeChange();
      });

      expect(mockSetZoomMode).toHaveBeenCalledWith(ZOOM_MODES.OUT);
    });
  });

  describe('Utility Functions', () => {
    it('clears all inputs with clearAllInputs', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      // Set some active state
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(1);

      // Clear all inputs
      act(() => {
        result.current.clearAllInputs();
      });

      expect(result.current.state.activeDirections.size).toBe(0);
    });
  });

  describe('Window Events', () => {
    it('clears inputs on window blur', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      // Set some active state
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(1);

      // Trigger blur
      act(() => {
        const event = new Event('blur');
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(0);
    });

    it('clears inputs on visibility change', () => {
      const { result } = renderHook(() => useTVCameraNavigation());

      // Set some active state
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(1);

      // Mock document.hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      });

      // Trigger visibility change
      act(() => {
        const event = new Event('visibilitychange');
        document.dispatchEvent(event);
      });

      expect(result.current.state.activeDirections.size).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useTVCameraNavigation());

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('clears timers on unmount', () => {
      const { result, unmount } = renderHook(() => useTVCameraNavigation());

      // Start some timers
      act(() => {
        const event = new KeyboardEvent('keydown', { key: TV_REMOTE_KEYS.ARROW_UP });
        window.dispatchEvent(event);
      });

      unmount();

      // Should not throw or cause memory leaks
      expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    });
  });
});