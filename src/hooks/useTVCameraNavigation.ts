import { useState, useEffect, useCallback, useRef } from 'react';
import { useDevice } from '../state/DeviceContext';
import { useUI } from '../state/UIContext';
import { useISS } from '../state/ISSContext';
import { 
  TV_CAMERA_KEYS, 
  TV_CAMERA_DIRECTIONS, 
  TV_CAMERA_ZOOM_MODES,
  TV_CAMERA_CONFIG 
} from '../utils/tvConstants';

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
 * Input acceleration state for smooth camera movement
 */
interface InputAcceleration {
  startTime: number;
  isAccelerating: boolean;
  currentSpeed: number;
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
  /** Whether zoom is currently active */
  isZooming: boolean;
  /** Current zoom mode */
  zoomMode: 'in' | 'out';
  /** Whether controls are currently enabled */
  isControlsEnabled: boolean;
}

/**
 * Custom hook for TV camera navigation input handling
 * Manages directional input, zoom controls, and input acceleration
 */
export const useTVCameraNavigation = ({
  isEnabled = true,
  onDirectionalInput,
  onZoomStart,
  onZoomEnd,
  onCameraRotation
}: UseTVCameraNavigationProps = {}): UseTVCameraNavigationReturn => {
  
  // Context hooks
  const { isTVProfile } = useDevice();
  const { state: uiState, setZoomMode, setZooming } = useUI();
  const { state: issState } = useISS();

  // Local state
  const [directionalInput, setDirectionalInput] = useState<DirectionalInputState>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Refs for tracking input state and timers
  const keyPressTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const keyHoldTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const inputAcceleration = useRef<Map<string, InputAcceleration>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastInputTime = useRef<number>(0);

  // Calculate if controls should be enabled
  const manualMode = !issState.followISS && !issState.earthRotateMode;
  const isControlsEnabled = isEnabled && 
    isTVProfile && 
    !uiState.hamburgerMenuVisible && 
    manualMode;

  // Get currently active direction
  const activeDirection = Object.entries(directionalInput).find(([_, isActive]) => isActive)?.[0] || null;

  // Debounced input handler
  const handleDebouncedInput = useCallback((direction: 'up' | 'down' | 'left' | 'right', isActive: boolean) => {
    const now = Date.now();
    if (now - lastInputTime.current < TV_CAMERA_CONFIG.INPUT_DEBOUNCE_MS) {
      return;
    }
    lastInputTime.current = now;

    // Update directional input state
    setDirectionalInput(prev => ({
      ...prev,
      [direction]: isActive
    }));

    // Call callback if provided
    if (onDirectionalInput) {
      onDirectionalInput(direction, isActive);
    }

    // Handle acceleration for camera rotation
    if (isActive) {
      const accelerationData: InputAcceleration = {
        startTime: now,
        isAccelerating: false,
        currentSpeed: TV_CAMERA_CONFIG.ROTATION_SPEED
      };
      inputAcceleration.current.set(direction, accelerationData);

      // Start acceleration timer
      const accelerationTimer = setTimeout(() => {
        const data = inputAcceleration.current.get(direction);
        if (data) {
          data.isAccelerating = true;
          inputAcceleration.current.set(direction, data);
        }
      }, TV_CAMERA_CONFIG.ACCELERATION_DELAY_MS);

      keyHoldTimers.current.set(`${direction}-acceleration`, accelerationTimer);
    } else {
      // Clean up acceleration data
      inputAcceleration.current.delete(direction);
      const accelerationTimer = keyHoldTimers.current.get(`${direction}-acceleration`);
      if (accelerationTimer) {
        clearTimeout(accelerationTimer);
        keyHoldTimers.current.delete(`${direction}-acceleration`);
      }
    }
  }, [onDirectionalInput]);

  // Animation loop for continuous camera rotation
  const animationLoop = useCallback(() => {
    if (!isControlsEnabled) {
      animationFrameRef.current = null;
      return;
    }

    let hasActiveInput = false;

    // Process each active direction
    Object.entries(directionalInput).forEach(([direction, isActive]) => {
      if (isActive) {
        hasActiveInput = true;
        const accelerationData = inputAcceleration.current.get(direction);
        
        if (accelerationData && onCameraRotation) {
          let speed = accelerationData.currentSpeed;
          
          // Apply acceleration if enough time has passed
          if (accelerationData.isAccelerating) {
            const elapsed = Date.now() - accelerationData.startTime;
            const accelerationFactor = Math.min(
              TV_CAMERA_CONFIG.ROTATION_ACCELERATION,
              1 + (elapsed / 1000) * TV_CAMERA_CONFIG.ROTATION_ACCELERATION
            );
            speed = Math.min(
              TV_CAMERA_CONFIG.MAX_ROTATION_SPEED,
              TV_CAMERA_CONFIG.ROTATION_SPEED * accelerationFactor
            );
            accelerationData.currentSpeed = speed;
          }

          // Call camera rotation callback
          onCameraRotation(direction as 'up' | 'down' | 'left' | 'right', speed);
        }
      }
    });

    // Continue animation loop if there's active input
    if (hasActiveInput) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      animationFrameRef.current = null;
    }
  }, [isControlsEnabled, directionalInput, onCameraRotation]);

  // Start animation loop when there's active input
  useEffect(() => {
    const hasActiveInput = Object.values(directionalInput).some(Boolean);
    
    if (hasActiveInput && !animationFrameRef.current && isControlsEnabled) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [directionalInput, animationLoop, isControlsEnabled]);

  // Handle zoom functionality
  const handleZoomStart = useCallback(() => {
    if (!isControlsEnabled) return;

    setZooming(true);
    if (onZoomStart) {
      onZoomStart();
    }

    // Toggle zoom mode for next time
    const newZoomMode = uiState.zoomMode === TV_CAMERA_ZOOM_MODES.IN 
      ? TV_CAMERA_ZOOM_MODES.OUT 
      : TV_CAMERA_ZOOM_MODES.IN;
    setZoomMode(newZoomMode);
  }, [isControlsEnabled, uiState.zoomMode, setZooming, setZoomMode, onZoomStart]);

  const handleZoomEnd = useCallback(() => {
    if (!isControlsEnabled) return;

    setZooming(false);
    if (onZoomEnd) {
      onZoomEnd();
    }
  }, [isControlsEnabled, setZooming, onZoomEnd]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isControlsEnabled) return;

    // Prevent default behavior for camera navigation keys
    const cameraKeys = Object.values(TV_CAMERA_KEYS);
    if (cameraKeys.includes(event.key as any)) {
      event.preventDefault();
    }

    // Handle directional keys
    switch (event.key) {
      case TV_CAMERA_KEYS.ARROW_UP:
        if (!directionalInput.up) {
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.UP, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_DOWN:
        if (!directionalInput.down) {
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.DOWN, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_LEFT:
        if (!directionalInput.left) {
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.LEFT, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_RIGHT:
        if (!directionalInput.right) {
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.RIGHT, true);
        }
        break;
      
      case TV_CAMERA_KEYS.SELECT:
        // Handle zoom with hold-to-zoom logic
        if (!uiState.isZooming) {
          const holdTimer = setTimeout(() => {
            handleZoomStart();
          }, TV_CAMERA_CONFIG.HOLD_THRESHOLD_MS);
          
          keyPressTimers.current.set('zoom', holdTimer);
        }
        break;
    }
  }, [isControlsEnabled, directionalInput, handleDebouncedInput, uiState.isZooming, handleZoomStart]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isControlsEnabled) return;

    // Handle directional keys
    switch (event.key) {
      case TV_CAMERA_KEYS.ARROW_UP:
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.UP, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_DOWN:
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.DOWN, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_LEFT:
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.LEFT, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_RIGHT:
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.RIGHT, false);
        break;
      
      case TV_CAMERA_KEYS.SELECT:
        // Handle zoom end
        const zoomTimer = keyPressTimers.current.get('zoom');
        if (zoomTimer) {
          clearTimeout(zoomTimer);
          keyPressTimers.current.delete('zoom');
        }
        
        if (uiState.isZooming) {
          handleZoomEnd();
        }
        break;
    }
  }, [isControlsEnabled, handleDebouncedInput, uiState.isZooming, handleZoomEnd]);

  // Set up global keyboard event listeners
  useEffect(() => {
    if (!isControlsEnabled) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isControlsEnabled, handleKeyDown, handleKeyUp]);

  // Cleanup timers and animation frames on unmount or when disabled
  useEffect(() => {
    if (!isControlsEnabled) {
      // Clear all timers
      keyPressTimers.current.forEach(timer => clearTimeout(timer));
      keyPressTimers.current.clear();
      
      keyHoldTimers.current.forEach(timer => clearTimeout(timer));
      keyHoldTimers.current.clear();
      
      // Clear animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Reset input state
      setDirectionalInput({
        up: false,
        down: false,
        left: false,
        right: false
      });
      
      // Clear acceleration data
      inputAcceleration.current.clear();
    }
  }, [isControlsEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      keyPressTimers.current.forEach(timer => clearTimeout(timer));
      keyHoldTimers.current.forEach(timer => clearTimeout(timer));
      
      // Clear animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    directionalInput,
    activeDirection,
    isZooming: uiState.isZooming,
    zoomMode: uiState.zoomMode,
    isControlsEnabled
  };
};

export default useTVCameraNavigation;