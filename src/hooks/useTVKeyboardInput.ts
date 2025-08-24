import { useCallback, useEffect } from 'react';
import { TV_CAMERA_KEYS, TV_CAMERA_DIRECTIONS } from '../utils/tvConstants';

/**
 * Props for the TV keyboard input hook
 */
interface UseTVKeyboardInputProps {
  /** Whether keyboard input is enabled */
  isEnabled?: boolean;
  /** Callback for directional key press */
  onDirectionalKeyDown?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback for directional key release */
  onDirectionalKeyUp?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Callback for zoom key press */
  onZoomKeyDown?: () => void;
  /** Callback for zoom key release */
  onZoomKeyUp?: () => void;
}

/**
 * Custom hook for handling TV keyboard input events
 * Manages keyboard event listeners and maps keys to camera actions
 */
export const useTVKeyboardInput = ({
  isEnabled = true,
  onDirectionalKeyDown,
  onDirectionalKeyUp,
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

    // Handle directional keys
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
      
      case TV_CAMERA_KEYS.SELECT:
        onZoomKeyDown?.();
        break;
    }
  }, [isEnabled, onDirectionalKeyDown, onZoomKeyDown]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Handle directional keys
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
      
      case TV_CAMERA_KEYS.SELECT:
        onZoomKeyUp?.();
        break;
    }
  }, [isEnabled, onDirectionalKeyUp, onZoomKeyUp]);

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