import { useState, useEffect, useCallback, useRef } from 'react';
import { useDevice } from '../state/DeviceContext';
import { useUI } from '../state/UIContext';
import { useISS } from '../state/ISSContext';
import { useCameraControls } from '../state/CameraControlsContext';
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
  const { getControlsRef } = useCameraControls();

  // Local state
  const [directionalInput, setDirectionalInput] = useState<DirectionalInputState>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Track pressed state for immediate visual feedback
  const [pressedDirection, setPressedDirection] = useState<string | null>(null);

  // Refs for tracking input state and timers
  const keyPressTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const keyHoldTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const inputAcceleration = useRef<Map<string, InputAcceleration>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastInputTime = useRef<number>(0);
  const directionalInputRef = useRef<DirectionalInputState>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Calculate if controls should be enabled
  const manualMode = !issState.followISS && !issState.earthRotateMode;
  const isControlsEnabled = isEnabled && 
    isTVProfile && 
    !uiState.hamburgerMenuVisible && 
    manualMode;
    
  // Debug: Log current window width and TV profile status
  useEffect(() => {
    console.log('📊 TV Navigation State:', {
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
      isTVProfile,
      hamburgerMenuVisible: uiState.hamburgerMenuVisible,
      manualMode,
      followISS: issState.followISS,
      earthRotateMode: issState.earthRotateMode,
      isControlsEnabled,
      zoomMode: uiState.zoomMode,
      isZooming: uiState.isZooming
    });
  }, [isTVProfile, uiState.hamburgerMenuVisible, manualMode, isControlsEnabled, issState.followISS, issState.earthRotateMode, uiState.zoomMode, uiState.isZooming]);

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
    setDirectionalInput(prev => {
      const newState = {
        ...prev,
        [direction]: isActive
      };
      // Also update the ref for immediate access in animation loop
      directionalInputRef.current = newState;
      return newState;
    });

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

    // Process each active direction using ref for current state
    Object.entries(directionalInputRef.current).forEach(([direction, isActive]) => {
      if (isActive) {
        hasActiveInput = true;
        const accelerationData = inputAcceleration.current.get(direction);
        
        if (accelerationData) {
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

          // Use controls ref to rotate camera directly
          const controlsRef = getControlsRef();
          if (controlsRef?.handleDirectionalRotation) {
            controlsRef.handleDirectionalRotation(direction, speed);
          }

          // Call camera rotation callback if provided
          if (onCameraRotation) {
            onCameraRotation(direction as 'up' | 'down' | 'left' | 'right', speed);
          }
        }
      }
    });

    // Continue animation loop if there's active input
    if (hasActiveInput) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      animationFrameRef.current = null;
    }
  }, [isControlsEnabled, onCameraRotation, getControlsRef]);

  // Start animation loop when there's active input
  useEffect(() => {
    const hasActiveInput = Object.values(directionalInput).some(Boolean);
    
    if (hasActiveInput && !animationFrameRef.current && isControlsEnabled) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [directionalInput, animationLoop, isControlsEnabled]);

  // Zoom animation frame ref for continuous zooming
  const zoomAnimationFrameRef = useRef<number | null>(null);
  const zoomStartTime = useRef<number>(0);
  const currentZoomDirection = useRef<boolean>(false); // true for zoom in, false for zoom out
  const isZoomingRef = useRef<boolean>(false); // Track zooming state for animation loop

  // Handle zoom functionality with continuous hold-to-zoom behavior
  const handleZoomStart = useCallback(() => {
    console.log('🔍 handleZoomStart called:', { 
      isControlsEnabled, 
      zoomMode: uiState.zoomMode,
      isZooming: uiState.isZooming 
    });
    
    if (!isControlsEnabled) {
      console.log('❌ Zoom blocked - controls disabled');
      return;
    }

    console.log('✅ Starting zoom...');
    setZooming(true);
    isZoomingRef.current = true; // Set ref immediately for animation loop
    zoomStartTime.current = Date.now();
    
    // Determine zoom direction based on current mode
    currentZoomDirection.current = uiState.zoomMode === TV_CAMERA_ZOOM_MODES.IN;
    console.log('🎯 Zoom direction:', currentZoomDirection.current ? 'IN (closer)' : 'OUT (further)');
    
    if (onZoomStart) {
      onZoomStart();
    }

    // Start continuous zoom animation
    const zoomLoop = () => {
      if (!isZoomingRef.current) {
        zoomAnimationFrameRef.current = null;
        return;
      }

      const controlsRef = getControlsRef();
      
      if (controlsRef?.handleZoomChange) {
        // Calculate zoom speed with acceleration
        const elapsed = Date.now() - zoomStartTime.current;
        const accelerationFactor = Math.min(
          TV_CAMERA_CONFIG.ZOOM_ACCELERATION,
          1 + (elapsed / 1000) * (TV_CAMERA_CONFIG.ZOOM_ACCELERATION - 1)
        );
        const zoomSpeed = TV_CAMERA_CONFIG.ZOOM_SPEED * accelerationFactor;
        
        controlsRef.handleZoomChange(currentZoomDirection.current, zoomSpeed);
      }

      // Continue zoom animation - check if requestAnimationFrame is available (not in test environment)
      if (typeof requestAnimationFrame !== 'undefined') {
        zoomAnimationFrameRef.current = requestAnimationFrame(zoomLoop);
      } else {
        // Fallback for test environment
        zoomAnimationFrameRef.current = setTimeout(zoomLoop, 16) as any;
      }
    };

    // Start the zoom animation loop
    console.log('🚀 Starting zoom animation loop');
    zoomAnimationFrameRef.current = requestAnimationFrame(zoomLoop);

    // Toggle zoom mode for next time (this changes the instruction text)
    const newZoomMode = uiState.zoomMode === TV_CAMERA_ZOOM_MODES.IN 
      ? TV_CAMERA_ZOOM_MODES.OUT 
      : TV_CAMERA_ZOOM_MODES.IN;
    console.log('🔄 Toggling zoom mode:', uiState.zoomMode, '->', newZoomMode);
    setZoomMode(newZoomMode);
  }, [isControlsEnabled, uiState.zoomMode, uiState.isZooming, setZooming, setZoomMode, onZoomStart, getControlsRef]);

  const handleZoomEnd = useCallback(() => {
    if (!isControlsEnabled) return;

    setZooming(false);
    isZoomingRef.current = false; // Set ref immediately to stop animation loop
    
    // Stop zoom animation
    if (zoomAnimationFrameRef.current) {
      cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
    
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
          // Set immediate pressed feedback
          setPressedDirection(TV_CAMERA_DIRECTIONS.UP);
          // Clear pressed state after animation duration
          setTimeout(() => setPressedDirection(null), 150);
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.UP, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_DOWN:
        if (!directionalInput.down) {
          // Set immediate pressed feedback
          setPressedDirection(TV_CAMERA_DIRECTIONS.DOWN);
          // Clear pressed state after animation duration
          setTimeout(() => setPressedDirection(null), 150);
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.DOWN, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_LEFT:
        if (!directionalInput.left) {
          // Set immediate pressed feedback
          setPressedDirection(TV_CAMERA_DIRECTIONS.LEFT);
          // Clear pressed state after animation duration
          setTimeout(() => setPressedDirection(null), 150);
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.LEFT, true);
        }
        break;
      
      case TV_CAMERA_KEYS.ARROW_RIGHT:
        if (!directionalInput.right) {
          // Set immediate pressed feedback
          setPressedDirection(TV_CAMERA_DIRECTIONS.RIGHT);
          // Clear pressed state after animation duration
          setTimeout(() => setPressedDirection(null), 150);
          handleDebouncedInput(TV_CAMERA_DIRECTIONS.RIGHT, true);
        }
        break;
      
      case TV_CAMERA_KEYS.SELECT:
        // Handle zoom with immediate hold-to-zoom logic
        console.log('🎮 SELECT key pressed:', { 
          isZooming: uiState.isZooming, 
          isControlsEnabled,
          zoomMode: uiState.zoomMode 
        });
        if (!uiState.isZooming) {
          // Start zoom immediately on key press (no delay for better responsiveness)
          handleZoomStart();
        }
        break;
    }
  }, [isControlsEnabled, directionalInput, handleDebouncedInput, uiState.isZooming, handleZoomStart]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isControlsEnabled) return;

    // Handle directional keys
    switch (event.key) {
      case TV_CAMERA_KEYS.ARROW_UP:
        // Clear pressed state immediately on key up
        setPressedDirection(null);
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.UP, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_DOWN:
        // Clear pressed state immediately on key up
        setPressedDirection(null);
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.DOWN, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_LEFT:
        // Clear pressed state immediately on key up
        setPressedDirection(null);
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.LEFT, false);
        break;
      
      case TV_CAMERA_KEYS.ARROW_RIGHT:
        // Clear pressed state immediately on key up
        setPressedDirection(null);
        handleDebouncedInput(TV_CAMERA_DIRECTIONS.RIGHT, false);
        break;
      
      case TV_CAMERA_KEYS.SELECT:
        // Handle zoom end
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
      
      // Clear animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (zoomAnimationFrameRef.current) {
        cancelAnimationFrame(zoomAnimationFrameRef.current);
        zoomAnimationFrameRef.current = null;
      }
      
      // Reset input state
      setDirectionalInput({
        up: false,
        down: false,
        left: false,
        right: false
      });
      
      // Reset zoom state
      setZooming(false);
      isZoomingRef.current = false;
      
      // Clear pressed state
      setPressedDirection(null);
      
      // Clear acceleration data
      inputAcceleration.current.clear();
    }
  }, [isControlsEnabled, setZooming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
      keyPressTimers.current.forEach(timer => clearTimeout(timer));
      keyHoldTimers.current.forEach(timer => clearTimeout(timer));
      
      // Clear animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (zoomAnimationFrameRef.current) {
        cancelAnimationFrame(zoomAnimationFrameRef.current);
      }
    };
  }, []);

  return {
    directionalInput,
    activeDirection,
    pressedDirection,
    isZooming: uiState.isZooming,
    zoomMode: uiState.zoomMode,
    isControlsEnabled
  };
};

export default useTVCameraNavigation;