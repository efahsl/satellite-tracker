import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { UIProvider, useUI } from '../UIContext';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UIProvider>{children}</UIProvider>
);

describe('UIContext', () => {
  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      expect(result.current.state.fpsMonitorVisible).toBe(true);
      expect(result.current.state.infoPanelVisible).toBe(true);
      expect(result.current.state.hamburgerMenuVisible).toBe(true);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
      expect(result.current.state.tvCameraControlsVisible).toBe(false);
      expect(result.current.state.zoomMode).toBe('in');
      expect(result.current.state.isZooming).toBe(false);
    });
  });

  describe('Hamburger Menu Visibility', () => {
    it('should set hamburger menu visibility to true', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setHamburgerMenuVisible(true);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(true);
    });

    it('should set hamburger menu visibility to false', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setHamburgerMenuVisible(false);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
    });

    it('should toggle hamburger menu visibility correctly', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start with true (default)
      expect(result.current.state.hamburgerMenuVisible).toBe(true);

      act(() => {
        result.current.setHamburgerMenuVisible(false);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);

      act(() => {
        result.current.setHamburgerMenuVisible(true);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(true);
    });
  });

  describe('Hamburger Menu Focus Management', () => {
    it('should set focus index to specific value', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setHamburgerMenuFocus(3);
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(3);
    });

    it('should handle focus index of 0', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Set to non-zero first
      act(() => {
        result.current.setHamburgerMenuFocus(5);
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(5);

      // Reset to 0
      act(() => {
        result.current.setHamburgerMenuFocus(0);
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });

    it('should handle negative focus index values', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setHamburgerMenuFocus(-1);
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(-1);
    });

    it('should handle large focus index values', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setHamburgerMenuFocus(999);
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(999);
    });
  });

  describe('Close Hamburger Menu for Manual Mode', () => {
    it('should close menu and reset focus when manual mode is activated', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Set initial state with menu visible and focus on item 3
      act(() => {
        result.current.setHamburgerMenuVisible(true);
        result.current.setHamburgerMenuFocus(3);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(true);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(3);

      // Close menu for manual mode
      act(() => {
        result.current.closeHamburgerMenuForManual();
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });

    it('should work correctly when menu is already closed', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Set menu to closed with focus on item 2
      act(() => {
        result.current.setHamburgerMenuVisible(false);
        result.current.setHamburgerMenuFocus(2);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(2);

      // Close menu for manual mode (should still reset focus)
      act(() => {
        result.current.closeHamburgerMenuForManual();
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });
  });

  describe('State Persistence', () => {
    it('should maintain hamburger menu state across multiple operations', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Perform multiple state changes
      act(() => {
        result.current.setHamburgerMenuVisible(false);
        result.current.setHamburgerMenuFocus(5);
        result.current.setFPSMonitorVisible(false);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(5);
      expect(result.current.state.fpsMonitorVisible).toBe(false);

      // Change other state, hamburger menu state should persist
      act(() => {
        result.current.setInfoPanelVisible(false);
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(5);
      expect(result.current.state.infoPanelVisible).toBe(false);
    });
  });

  describe('Action Creators Memoization', () => {
    it('should maintain stable references for action creators', () => {
      const { result, rerender } = renderHook(() => useUI(), { wrapper: TestWrapper });

      const initialSetHamburgerMenuVisible = result.current.setHamburgerMenuVisible;
      const initialSetHamburgerMenuFocus = result.current.setHamburgerMenuFocus;
      const initialCloseHamburgerMenuForManual = result.current.closeHamburgerMenuForManual;

      // Trigger a state change
      act(() => {
        result.current.setHamburgerMenuVisible(false);
      });

      // Rerender and check if references are stable
      rerender();

      expect(result.current.setHamburgerMenuVisible).toBe(initialSetHamburgerMenuVisible);
      expect(result.current.setHamburgerMenuFocus).toBe(initialSetHamburgerMenuFocus);
      expect(result.current.closeHamburgerMenuForManual).toBe(initialCloseHamburgerMenuForManual);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useUI is used outside of UIProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useUI());
      }).toThrow('useUI must be used within a UIProvider');

      console.error = originalError;
    });
  });

  describe('Integration with Existing State', () => {
    it('should not affect existing FPS monitor functionality', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Test existing FPS monitor functionality
      act(() => {
        result.current.toggleFPSMonitor();
      });

      expect(result.current.state.fpsMonitorVisible).toBe(false);

      act(() => {
        result.current.setFPSMonitorVisible(true);
      });

      expect(result.current.state.fpsMonitorVisible).toBe(true);

      // Hamburger menu state should remain unchanged
      expect(result.current.state.hamburgerMenuVisible).toBe(true);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });

    it('should not affect existing info panel functionality', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Test existing info panel functionality
      act(() => {
        result.current.toggleInfoPanel();
      });

      expect(result.current.state.infoPanelVisible).toBe(false);

      act(() => {
        result.current.setInfoPanelVisible(true);
      });

      expect(result.current.state.infoPanelVisible).toBe(true);

      // Hamburger menu state should remain unchanged
      expect(result.current.state.hamburgerMenuVisible).toBe(true);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });
  });

  describe('Direct Dispatch Usage', () => {
    it('should support direct dispatch for SET_HAMBURGER_MENU_VISIBLE', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.dispatch({ type: 'SET_HAMBURGER_MENU_VISIBLE', payload: false });
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
    });

    it('should support direct dispatch for SET_HAMBURGER_MENU_FOCUS', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.dispatch({ type: 'SET_HAMBURGER_MENU_FOCUS', payload: 7 });
      });

      expect(result.current.state.hamburgerMenuFocusIndex).toBe(7);
    });

    it('should support direct dispatch for CLOSE_HAMBURGER_MENU_FOR_MANUAL', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Set initial state
      act(() => {
        result.current.setHamburgerMenuVisible(true);
        result.current.setHamburgerMenuFocus(4);
      });

      act(() => {
        result.current.dispatch({ type: 'CLOSE_HAMBURGER_MENU_FOR_MANUAL' });
      });

      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(0);
    });
  });

  describe('TV Camera Controls Visibility', () => {
    it('should set TV camera controls visibility to true', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setTVCameraControlsVisible(true);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);
    });

    it('should set TV camera controls visibility to false', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setTVCameraControlsVisible(false);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(false);
    });

    it('should toggle TV camera controls visibility correctly', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start with false (default)
      expect(result.current.state.tvCameraControlsVisible).toBe(false);

      act(() => {
        result.current.setTVCameraControlsVisible(true);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);

      act(() => {
        result.current.setTVCameraControlsVisible(false);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(false);
    });

    it('should support direct dispatch for SET_TV_CAMERA_CONTROLS_VISIBLE', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.dispatch({ type: 'SET_TV_CAMERA_CONTROLS_VISIBLE', payload: true });
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'SET_TV_CAMERA_CONTROLS_VISIBLE', payload: false });
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(false);
    });
  });

  describe('Zoom Mode Management', () => {
    it('should set zoom mode to "in"', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setZoomMode('in');
      });

      expect(result.current.state.zoomMode).toBe('in');
    });

    it('should set zoom mode to "out"', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setZoomMode('out');
      });

      expect(result.current.state.zoomMode).toBe('out');
    });

    it('should toggle between zoom modes correctly', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start with 'in' (default)
      expect(result.current.state.zoomMode).toBe('in');

      act(() => {
        result.current.setZoomMode('out');
      });

      expect(result.current.state.zoomMode).toBe('out');

      act(() => {
        result.current.setZoomMode('in');
      });

      expect(result.current.state.zoomMode).toBe('in');
    });

    it('should support direct dispatch for SET_ZOOM_MODE', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.dispatch({ type: 'SET_ZOOM_MODE', payload: 'out' });
      });

      expect(result.current.state.zoomMode).toBe('out');

      act(() => {
        result.current.dispatch({ type: 'SET_ZOOM_MODE', payload: 'in' });
      });

      expect(result.current.state.zoomMode).toBe('in');
    });
  });

  describe('Zooming State Management', () => {
    it('should set zooming state to true', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setZooming(true);
      });

      expect(result.current.state.isZooming).toBe(true);
    });

    it('should set zooming state to false', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.setZooming(false);
      });

      expect(result.current.state.isZooming).toBe(false);
    });

    it('should toggle zooming state correctly', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start with false (default)
      expect(result.current.state.isZooming).toBe(false);

      act(() => {
        result.current.setZooming(true);
      });

      expect(result.current.state.isZooming).toBe(true);

      act(() => {
        result.current.setZooming(false);
      });

      expect(result.current.state.isZooming).toBe(false);
    });

    it('should support direct dispatch for SET_ZOOMING', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      act(() => {
        result.current.dispatch({ type: 'SET_ZOOMING', payload: true });
      });

      expect(result.current.state.isZooming).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'SET_ZOOMING', payload: false });
      });

      expect(result.current.state.isZooming).toBe(false);
    });
  });

  describe('TV Camera Controls State Persistence', () => {
    it('should maintain TV camera controls state across multiple operations', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Perform multiple TV camera controls state changes
      act(() => {
        result.current.setTVCameraControlsVisible(true);
        result.current.setZoomMode('out');
        result.current.setZooming(true);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);
      expect(result.current.state.zoomMode).toBe('out');
      expect(result.current.state.isZooming).toBe(true);

      // Change other state, TV camera controls state should persist
      act(() => {
        result.current.setHamburgerMenuVisible(false);
        result.current.setFPSMonitorVisible(false);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);
      expect(result.current.state.zoomMode).toBe('out');
      expect(result.current.state.isZooming).toBe(true);
      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.fpsMonitorVisible).toBe(false);
    });

    it('should not affect existing state when TV camera controls state changes', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Set initial existing state
      act(() => {
        result.current.setHamburgerMenuVisible(false);
        result.current.setHamburgerMenuFocus(3);
        result.current.setFPSMonitorVisible(false);
        result.current.setInfoPanelVisible(false);
      });

      // Change TV camera controls state
      act(() => {
        result.current.setTVCameraControlsVisible(true);
        result.current.setZoomMode('out');
        result.current.setZooming(true);
      });

      // Existing state should remain unchanged
      expect(result.current.state.hamburgerMenuVisible).toBe(false);
      expect(result.current.state.hamburgerMenuFocusIndex).toBe(3);
      expect(result.current.state.fpsMonitorVisible).toBe(false);
      expect(result.current.state.infoPanelVisible).toBe(false);

      // TV camera controls state should be updated
      expect(result.current.state.tvCameraControlsVisible).toBe(true);
      expect(result.current.state.zoomMode).toBe('out');
      expect(result.current.state.isZooming).toBe(true);
    });
  });

  describe('TV Camera Controls Action Creators Memoization', () => {
    it('should maintain stable references for TV camera controls action creators', () => {
      const { result, rerender } = renderHook(() => useUI(), { wrapper: TestWrapper });

      const initialSetTVCameraControlsVisible = result.current.setTVCameraControlsVisible;
      const initialSetZoomMode = result.current.setZoomMode;
      const initialSetZooming = result.current.setZooming;

      // Trigger a state change
      act(() => {
        result.current.setTVCameraControlsVisible(true);
      });

      // Rerender and check if references are stable
      rerender();

      expect(result.current.setTVCameraControlsVisible).toBe(initialSetTVCameraControlsVisible);
      expect(result.current.setZoomMode).toBe(initialSetZoomMode);
      expect(result.current.setZooming).toBe(initialSetZooming);
    });
  });

  describe('TV Camera Controls Complex State Scenarios', () => {
    it('should handle rapid state changes correctly', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Rapid state changes
      act(() => {
        result.current.setTVCameraControlsVisible(true);
        result.current.setZoomMode('out');
        result.current.setZooming(true);
        result.current.setZoomMode('in');
        result.current.setZooming(false);
        result.current.setTVCameraControlsVisible(false);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(false);
      expect(result.current.state.zoomMode).toBe('in');
      expect(result.current.state.isZooming).toBe(false);
    });

    it('should handle zoom mode changes during zooming', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start zooming in 'in' mode
      act(() => {
        result.current.setZoomMode('in');
        result.current.setZooming(true);
      });

      expect(result.current.state.zoomMode).toBe('in');
      expect(result.current.state.isZooming).toBe(true);

      // Change zoom mode while zooming
      act(() => {
        result.current.setZoomMode('out');
      });

      expect(result.current.state.zoomMode).toBe('out');
      expect(result.current.state.isZooming).toBe(true);

      // Stop zooming
      act(() => {
        result.current.setZooming(false);
      });

      expect(result.current.state.zoomMode).toBe('out');
      expect(result.current.state.isZooming).toBe(false);
    });

    it('should handle controls visibility changes during zooming', () => {
      const { result } = renderHook(() => useUI(), { wrapper: TestWrapper });

      // Start with controls visible and zooming
      act(() => {
        result.current.setTVCameraControlsVisible(true);
        result.current.setZooming(true);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(true);
      expect(result.current.state.isZooming).toBe(true);

      // Hide controls while zooming
      act(() => {
        result.current.setTVCameraControlsVisible(false);
      });

      expect(result.current.state.tvCameraControlsVisible).toBe(false);
      expect(result.current.state.isZooming).toBe(true);
    });
  });
});