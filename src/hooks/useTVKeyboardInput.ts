import { useCallback, useEffect } from 'react';
import { TV_CAMERA_KEYS, TV_CAMERA_DIRECTIONS } from '../utils/tvConstants';

/**
 * Props for the TV keyboard input hook
 */
interface UseTVKeyboardInputProps {
  /** Whether keyboard input is enabled */
  isEnabled?: boolean;
  /** Whether currently in zoom mode */
  isInZoomMode?: boolean;
  /** Callback for directional key press */
  onDirectionalKeyDown?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback for directional key release */
  onDirectionalKeyUp?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback for zoom mode toggle (SELECT key) */
  onZoomModeToggle?: () => void;
  /** Callback for zoom input (UP/DOWN in zoom mode) */
  onZoomInput?: (direction: 'in' | 'out') => void;
  /** Callback for zoom key press (for continuous zoom) */
  onZoomKeyDown?: (direction: 'in' | 'out') => void;
  /** Callback for zoom key release (for continuous zoom) */
  onZoomKeyUp?: () => void;
}

/**
 * Custom hook for handling TV keyboard input events
 * Manages keyboard event listeners and maps keys to camera actions
 * Handles mode-aware input (navigation mode vs zoom mode)
 */
export const useTVKeyboardInput = ({
  isEnabled = true,
  isInZoomMode = false,
  onDirectionalKeyDown,
  onDirectionalKeyUp,
  onZoomModeToggle,
  onZoomInput,
  onZoomKeyDown,
  onZoomKeyUp
}: UseTVKeyboardInputProps = {}) => {

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Prevent default behavior for camera navigation keys
    const cameraKeys = Object.values(TV_CAMERA_KEYS);
    if (cameraKeys.includes(event.key as any)) {
      event.preventDefault();
    }

    // Handle SELECT key for zoom mode toggle
    if (event.key === TV_CAMERA_KEYS.SELECT) {
      onZoomModeToggle?.();
      return;
    }

    // Handle keys based on current mode
    if (isInZoomMode) {
      // In zoom mode: only UP/DOWN arrows work for zoom control
      switch (event.key) {
        case TV_CAMERA_KEYS.ARROW_UP:
          onZoomKeyDown?.('in');
          break;
        
        case TV_CAMERA_KEYS.ARROW_DOWN:
          onZoomKeyDown?.('out');
          break;
        
        // Left/Right arrows are disabled in zoom mode
        case TV_CAMERA_KEYS.ARROW_LEFT:
        case TV_CAMERA_KEYS.ARROW_RIGHT:
          // Do nothing - these are disabled in zoom mode
          break;
      }
    } else {
      // In navigation mode: all directional keys work for camera rotation
      switch (event.key) {
        case TV_CAMERA_KEYS.ARROW_UP:
          onDirectionalKeyDown?.(TV_CAMERA_DIRECTIONS.UP);
          break;
        
        case TV_CAMERA_KEYS.ARROW_DOWN:
          onDirectionalKeyDown?.(TV_CAMERA_DIRECTIONS.DOWN);
          break;
        
        case TV_CAMERA_KEYS.ARROW_LEFT:
          onDirectionalKeyDown?.(TV_CAMERA_DIRECTIONS.LEFT);
          break;
        
        case TV_CAMERA_KEYS.ARROW_RIGHT:
          onDirectionalKeyDown?.(TV_CAMERA_DIRECTIONS.RIGHT);
          break;
      }
    }
  }, [isEnabled, isInZoomMode, onDirectionalKeyDown, onZoomModeToggle, onZoomKeyDown]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Handle keys based on current mode
    if (isInZoomMode) {
      // In zoom mode: only UP/DOWN arrows work for zoom control
      switch (event.key) {
        case TV_CAMERA_KEYS.ARROW_UP:
        case TV_CAMERA_KEYS.ARROW_DOWN:
          onZoomKeyUp?.();
          break;
        
        // Left/Right arrows are disabled in zoom mode
        case TV_CAMERA_KEYS.ARROW_LEFT:
        case TV_CAMERA_KEYS.ARROW_RIGHT:
          // Do nothing - these are disabled in zoom mode
          break;
      }
    } else {
      // In navigation mode: all directional keys work for camera rotation
      switch (event.key) {
        case TV_CAMERA_KEYS.ARROW_UP:
          onDirectionalKeyUp?.(TV_CAMERA_DIRECTIONS.UP);
          break;
        
        case TV_CAMERA_KEYS.ARROW_DOWN:
          onDirectionalKeyUp?.(TV_CAMERA_DIRECTIONS.DOWN);
          break;
        
        case TV_CAMERA_KEYS.ARROW_LEFT:
          onDirectionalKeyUp?.(TV_CAMERA_DIRECTIONS.LEFT);
          break;
        
        case TV_CAMERA_KEYS.ARROW_RIGHT:
          onDirectionalKeyUp?.(TV_CAMERA_DIRECTIONS.RIGHT);
          break;
      }
    }
  }, [isEnabled, isInZoomMode, onDirectionalKeyUp, onZoomKeyUp]);

  // Set up global keyboard event listeners
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled, handleKeyDown, handleKeyUp]);
};

export default useTVKeyboardInput;