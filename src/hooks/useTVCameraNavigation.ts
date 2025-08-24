import React from 'react';
import { useCameraControls } from '../state/CameraControlsContext';
import { useTVKeyboardInput } from './useTVKeyboardInput';
import { useTVDirectionalInput } from './useTVDirectionalInput';
import { useTVZoomControl } from './useTVZoomControl';
import { useTVControlsState } from './useTVControlsState';
import { TV_CAMERA_CONFIG } from '../utils/tvConstants';

/**
 * Directional input state for camera navigation
 */
interface DirectionalInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * Props for the TV camera navigation hook
 */
interface UseTVCameraNavigationProps {
  /** Whether camera navigation is enabled */
  isEnabled?: boolean;
  /** Callback for directional input changes */
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right', isActive: boolean) => void;
  /** Callback for zoom start */
  onZoomStart?: () => void;
  /** Callback for zoom end */
  onZoomEnd?: () => void;
  /** Callback for camera rotation */
  onCameraRotation?: (direction: 'up' | 'down' | 'left' | 'right', speed: number) => void;
}

/**
 * Return type for the TV camera navigation hook
 */
interface UseTVCameraNavigationReturn {
  /** Current directional input state */
  directionalInput: DirectionalInputState;
  /** Currently active direction (if any) */
  activeDirection: string | null;
  /** Currently pressed direction for immediate visual feedback */
  pressedDirection: string | null;
  /** Whether zoom is currently active */
  isZooming: boolean;
  /** Current zoom mode */
  zoomMode: 'in' | 'out';
  /** Whether controls are currently enabled */
  isControlsEnabled: boolean;
}

/**
 * Custom hook for TV camera navigation input handling
 * Orchestrates keyboard input, directional input, zoom control, and controls state
 */
export const useTVCameraNavigation = ({
  isEnabled = true,
  onDirectionalInput,
  onZoomStart,
  onZoomEnd,
  onCameraRotation
}: UseTVCameraNavigationProps = {}): UseTVCameraNavigationReturn => {
  
  // Context hooks
  const { getControlsRef } = useCameraControls();

  // Sub-hooks for different responsibilities
  const { isControlsEnabled } = useTVControlsState({ isEnabled });
  
  const {
    directionalInput,
    activeDirection,
    pressedDirection,
    handleDirectionalKeyDown,
    handleDirectionalKeyUp
  } = useTVDirectionalInput({
    isControlsEnabled,
    onDirectionalInput,
    onCameraRotation: (direction, speed) => {
      // Handle continuous camera rotation during long-press
      const controlsRef = getControlsRef();
      if (controlsRef?.handleDirectionalRotation) {
        controlsRef.handleDirectionalRotation(direction, speed);
      }
      onCameraRotation?.(direction, speed);
    }
  });

  const {
    isZooming,
    zoomMode,
    handleZoomKeyDown,
    handleZoomKeyUp
  } = useTVZoomControl({
    isEnabled: isControlsEnabled,
    onZoomStart,
    onZoomEnd
  });

  // Set up keyboard input handling
  useTVKeyboardInput({
    isEnabled: isControlsEnabled,
    onDirectionalKeyDown: handleDirectionalKeyDown,
    onDirectionalKeyUp: handleDirectionalKeyUp,
    onZoomKeyDown: handleZoomKeyDown,
    onZoomKeyUp: handleZoomKeyUp
  });

  return {
    directionalInput,
    activeDirection,
    pressedDirection,
    isZooming,
    zoomMode,
    isControlsEnabled
  };
};

export default useTVCameraNavigation;