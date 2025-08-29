import { useState, useCallback, useRef, useEffect } from 'react';
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
 * Input acceleration state for smooth camera movement
 */
interface InputAcceleration {
  startTime: number;
  isAccelerating: boolean;
  currentSpeed: number;
}

/**
 * Props for the TV directional input hook
 */
interface UseTVDirectionalInputProps {
  /** Whether controls are enabled (for animation loop) */
  isControlsEnabled?: boolean;
  /** Callback for directional input changes */
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right', isActive: boolean) => void;
  /** Callback for continuous camera rotation during hold */
  onCameraRotation?: (direction: 'up' | 'down' | 'left' | 'right', speed: number) => void;
}

/**
 * Return type for the TV directional input hook
 */
interface UseTVDirectionalInputReturn {
  /** Current directional input state */
  directionalInput: DirectionalInputState;
  /** Currently active direction (if any) */
  activeDirection: string | null;
  /** Currently pressed direction for immediate visual feedback */
  pressedDirection: string | null;
  /** Handle directional key press */
  handleDirectionalKeyDown: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Handle directional key release */
  handleDirectionalKeyUp: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

/**
 * Custom hook for TV directional input handling
 * Manages directional input state and provides continuous rotation during long-press
 */
export const useTVDirectionalInput = ({
  isControlsEnabled = true,
  onDirectionalInput,
  onCameraRotation
}: UseTVDirectionalInputProps = {}): UseTVDirectionalInputReturn => {
  
  // Local state
  const [directionalInput, setDirectionalInput] = useState<DirectionalInputState>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Track pressed state for immediate visual feedback
  const [pressedDirection, setPressedDirection] = useState<string | null>(null);

  // Refs for debouncing and animation
  const lastInputTime = useRef<number>(0);
  const inputAcceleration = useRef<Map<string, InputAcceleration>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const keyHoldTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const directionalInputRef = useRef<DirectionalInputState>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Get currently active direction
  const activeDirection = Object.entries(directionalInput).find(([_, isActive]) => isActive)?.[0] || null;

  // Animation loop for continuous camera rotation during long-press
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

          // Call camera rotation callback continuously during hold
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
  }, [isControlsEnabled, onCameraRotation]);

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
    onDirectionalInput?.(direction, isActive);

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

  // Handle directional key press
  const handleDirectionalKeyDown = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!directionalInput[direction]) {
      // Set immediate pressed feedback
      setPressedDirection(direction);
      // Clear pressed state after animation duration
      setTimeout(() => setPressedDirection(null), 150);
      handleDebouncedInput(direction, true);
    }
  }, [directionalInput, handleDebouncedInput]);

  // Handle directional key release
  const handleDirectionalKeyUp = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // Clear pressed state immediately on key up
    setPressedDirection(null);
    handleDebouncedInput(direction, false);
  }, [handleDebouncedInput]);

  // Start animation loop when there's active input
  useEffect(() => {
    const hasActiveInput = Object.values(directionalInput).some(Boolean);
    
    if (hasActiveInput && !animationFrameRef.current && isControlsEnabled) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [directionalInput, animationLoop, isControlsEnabled]);

  // Cleanup when controls are disabled
  useEffect(() => {
    if (!isControlsEnabled) {
      // Clear animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear all timers
      keyHoldTimers.current.forEach(timer => clearTimeout(timer));
      keyHoldTimers.current.clear();
      
      // Clear acceleration data
      inputAcceleration.current.clear();
      
      // Reset input state
      setDirectionalInput({
        up: false,
        down: false,
        left: false,
        right: false
      });
      directionalInputRef.current = {
        up: false,
        down: false,
        left: false,
        right: false
      };
      
      // Clear pressed state
      setPressedDirection(null);
    }
  }, [isControlsEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timers
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
    pressedDirection,
    handleDirectionalKeyDown,
    handleDirectionalKeyUp
  };
};

export default useTVDirectionalInput;