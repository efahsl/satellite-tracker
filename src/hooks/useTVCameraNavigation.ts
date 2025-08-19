import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUI } from '../state/UIContext';
import { useDevice } from '../state/DeviceContext';
import { useISS } from '../state/ISSContext';
import {
  DIRECTIONAL_INPUTS,
  ZOOM_MODES,
  TV_REMOTE_KEYS,
  TV_CAMERA_CONFIG,
  type DirectionalInput,
  type ZoomMode
} from '../utils/tvCameraConfig';

export interface TVCameraNavigationState {
  activeDirections: Set<DirectionalInput>;
  isZooming: boolean;
  zoomMode: ZoomMode;
  isEnabled: boolean;
}

export interface TVCameraNavigationCallbacks {
  onDirectionalInput: (direction: DirectionalInput, isActive: boolean) => void;
  onZoomStart: () => void;
  onZoomEnd: () => void;
  onZoomModeChange: (mode: ZoomMode) => void;
}

export interface UseTVCameraNavigationOptions {
  enabled?: boolean;
  onDirectionalInput?: (direction: DirectionalInput, isActive: boolean) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  onZoomModeChange?: (mode: ZoomMode) => void;
}

/**
 * Custom hook for managing TV camera navigation input handling
 * 
 * Features:
 * - Directional input state management (arrow keys)
 * - Hold-to-zoom logic for Enter key
 * - Input debouncing and acceleration
 * - Automatic enable/disable based on TV profile and manual mode
 * - Zoom mode cycling (in/out) based on camera distance
 */
export const useTVCameraNavigation = (options: UseTVCameraNavigationOptions = {}) => {
  const { enabled = true, onDirectionalInput, onZoomStart, onZoomEnd, onZoomModeChange } = options;
  
  // Context hooks
  const { isTVProfile } = useDevice();
  const { state: uiState, setZoomMode, setZooming } = useUI();
  const { state: issState } = useISS();

  // Local state
  const [activeDirections, setActiveDirections] = useState<Set<DirectionalInput>>(new Set());
  const [keyHoldTimers, setKeyHoldTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [keyAcceleration, setKeyAcceleration] = useState<Map<string, number>>(new Map());
  
  // Refs for managing state across event handlers
  const activeDirectionsRef = useRef<Set<DirectionalInput>>(new Set());
  const isZoomingRef = useRef<boolean>(false);
  const zoomHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const keyRepeatTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Determine if the hook should be enabled
  const isEnabled = useMemo(() => {
    if (!enabled) return false;
    if (!isTVProfile) return false;
    if (uiState.hamburgerMenuVisible) return false;
    
    // Must be in manual mode (not following ISS or rotating Earth)
    const isManualMode = !issState.followISS && !issState.earthRotateMode;
    return isManualMode;
  }, [enabled, isTVProfile, uiState.hamburgerMenuVisible, issState.followISS, issState.earthRotateMode]);

  // Update active directions ref when state changes
  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  // Update zooming ref when UI state changes
  useEffect(() => {
    isZoomingRef.current = uiState.isZooming;
  }, [uiState.isZooming]);

  // Debounced direction input handler
  const handleDirectionalInput = useCallback((direction: DirectionalInput, isActive: boolean) => {
    if (!isEnabled) return;

    setActiveDirections(prev => {
      const newSet = new Set(prev);
      if (isActive) {
        newSet.add(direction);
      } else {
        newSet.delete(direction);
      }
      return newSet;
    });

    // Call external callback
    onDirectionalInput?.(direction, isActive);
  }, [isEnabled, onDirectionalInput]);

  // Zoom mode cycling logic
  const cycleZoomMode = useCallback(() => {
    const newMode = uiState.zoomMode === ZOOM_MODES.IN ? ZOOM_MODES.OUT : ZOOM_MODES.IN;
    setZoomMode(newMode);
    onZoomModeChange?.(newMode);
  }, [uiState.zoomMode, setZoomMode, onZoomModeChange]);

  // Zoom start handler
  const handleZoomStart = useCallback(() => {
    if (!isEnabled || isZoomingRef.current) return;

    setZooming(true);
    onZoomStart?.();

    // Set up hold timer for continuous zoom
    zoomHoldTimer.current = setTimeout(() => {
      // After hold threshold, start continuous zoom
      console.log('🔍 TV Camera: Starting continuous zoom');
    }, TV_CAMERA_CONFIG.ZOOM.HOLD_THRESHOLD);
  }, [isEnabled, setZooming, onZoomStart]);

  // Zoom end handler
  const handleZoomEnd = useCallback(() => {
    if (!isEnabled) return;

    // Clear hold timer
    if (zoomHoldTimer.current) {
      clearTimeout(zoomHoldTimer.current);
      zoomHoldTimer.current = null;
    }

    // If was zooming, cycle zoom mode for next time
    if (isZoomingRef.current) {
      cycleZoomMode();
    }

    setZooming(false);
    onZoomEnd?.();
  }, [isEnabled, setZooming, onZoomEnd, cycleZoomMode]);

  // Key acceleration calculation
  const calculateAcceleration = useCallback((key: string, holdDuration: number): number => {
    const { ACCELERATION_THRESHOLD, ACCELERATION_CURVE } = TV_CAMERA_CONFIG.INPUT;
    
    if (holdDuration < ACCELERATION_THRESHOLD) {
      return 1.0; // No acceleration initially
    }
    
    const accelerationFactor = Math.min(
      (holdDuration - ACCELERATION_THRESHOLD) / ACCELERATION_THRESHOLD,
      1.0
    );
    
    return 1.0 + (accelerationFactor ** ACCELERATION_CURVE) * (TV_CAMERA_CONFIG.ROTATION.ACCELERATION - 1.0);
  }, []);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const { key } = event;
    
    // Prevent default for TV remote keys
    if (Object.values(TV_REMOTE_KEYS).includes(key as any)) {
      event.preventDefault();
    }

    // Handle directional keys
    switch (key) {
      case TV_REMOTE_KEYS.ARROW_UP:
        if (!activeDirectionsRef.current.has(DIRECTIONAL_INPUTS.UP)) {
          handleDirectionalInput(DIRECTIONAL_INPUTS.UP, true);
        }
        break;
      case TV_REMOTE_KEYS.ARROW_DOWN:
        if (!activeDirectionsRef.current.has(DIRECTIONAL_INPUTS.DOWN)) {
          handleDirectionalInput(DIRECTIONAL_INPUTS.DOWN, true);
        }
        break;
      case TV_REMOTE_KEYS.ARROW_LEFT:
        if (!activeDirectionsRef.current.has(DIRECTIONAL_INPUTS.LEFT)) {
          handleDirectionalInput(DIRECTIONAL_INPUTS.LEFT, true);
        }
        break;
      case TV_REMOTE_KEYS.ARROW_RIGHT:
        if (!activeDirectionsRef.current.has(DIRECTIONAL_INPUTS.RIGHT)) {
          handleDirectionalInput(DIRECTIONAL_INPUTS.RIGHT, true);
        }
        break;
      case TV_REMOTE_KEYS.SELECT:
        if (!isZoomingRef.current) {
          handleZoomStart();
        }
        break;
    }

    // Set up key repeat and acceleration for held keys
    if (!keyRepeatTimers.current.has(key)) {
      const startTime = Date.now();
      
      const repeatHandler = () => {
        const holdDuration = Date.now() - startTime;
        const acceleration = calculateAcceleration(key, holdDuration);
        
        // Update acceleration state
        setKeyAcceleration(prev => new Map(prev.set(key, acceleration)));
        
        // Schedule next repeat
        const repeatRate = Math.max(
          TV_CAMERA_CONFIG.INPUT.KEY_REPEAT_RATE / acceleration,
          TV_CAMERA_CONFIG.INPUT.DEBOUNCE_DELAY
        );
        
        keyRepeatTimers.current.set(key, setTimeout(repeatHandler, repeatRate));
      };
      
      // Start repeat after initial delay
      keyRepeatTimers.current.set(key, setTimeout(repeatHandler, TV_CAMERA_CONFIG.INPUT.KEY_REPEAT_DELAY));
    }
  }, [isEnabled, handleDirectionalInput, handleZoomStart, calculateAcceleration]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const { key } = event;

    // Clear key repeat timer
    const timer = keyRepeatTimers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      keyRepeatTimers.current.delete(key);
    }

    // Clear acceleration
    setKeyAcceleration(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });

    // Handle directional key releases
    switch (key) {
      case TV_REMOTE_KEYS.ARROW_UP:
        handleDirectionalInput(DIRECTIONAL_INPUTS.UP, false);
        break;
      case TV_REMOTE_KEYS.ARROW_DOWN:
        handleDirectionalInput(DIRECTIONAL_INPUTS.DOWN, false);
        break;
      case TV_REMOTE_KEYS.ARROW_LEFT:
        handleDirectionalInput(DIRECTIONAL_INPUTS.LEFT, false);
        break;
      case TV_REMOTE_KEYS.ARROW_RIGHT:
        handleDirectionalInput(DIRECTIONAL_INPUTS.RIGHT, false);
        break;
      case TV_REMOTE_KEYS.SELECT:
        handleZoomEnd();
        break;
    }
  }, [isEnabled, handleDirectionalInput, handleZoomEnd]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!isEnabled) {
      // Clear all active states when disabled
      setActiveDirections(new Set());
      setKeyAcceleration(new Map());
      
      // Clear all timers
      keyRepeatTimers.current.forEach(timer => clearTimeout(timer));
      keyRepeatTimers.current.clear();
      
      if (zoomHoldTimer.current) {
        clearTimeout(zoomHoldTimer.current);
        zoomHoldTimer.current = null;
      }
      
      return;
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Clear all timers on cleanup
      keyRepeatTimers.current.forEach(timer => clearTimeout(timer));
      keyRepeatTimers.current.clear();
      
      if (zoomHoldTimer.current) {
        clearTimeout(zoomHoldTimer.current);
        zoomHoldTimer.current = null;
      }
    };
  }, [isEnabled, handleKeyDown, handleKeyUp]);

  // Handle visibility changes (blur/focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear all active states when page becomes hidden
        setActiveDirections(new Set());
        setKeyAcceleration(new Map());
        
        // Clear all timers
        keyRepeatTimers.current.forEach(timer => clearTimeout(timer));
        keyRepeatTimers.current.clear();
        
        if (isZoomingRef.current) {
          handleZoomEnd();
        }
      }
    };

    const handleBlur = () => {
      // Clear all active states when window loses focus
      setActiveDirections(new Set());
      setKeyAcceleration(new Map());
      
      if (isZoomingRef.current) {
        handleZoomEnd();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleZoomEnd]);

  // Log state changes for debugging
  useEffect(() => {
    if (activeDirections.size > 0) {
      console.log('🎮 TV Camera Navigation: Active directions', Array.from(activeDirections));
    }
  }, [activeDirections]);

  useEffect(() => {
    if (uiState.isZooming) {
      console.log('🔍 TV Camera Navigation: Zooming', { mode: uiState.zoomMode });
    }
  }, [uiState.isZooming, uiState.zoomMode]);

  // Return hook interface
  return {
    // State
    state: {
      activeDirections,
      isZooming: uiState.isZooming,
      zoomMode: uiState.zoomMode,
      isEnabled
    } as TVCameraNavigationState,
    
    // Callbacks for manual control
    callbacks: {
      onDirectionalInput: handleDirectionalInput,
      onZoomStart: handleZoomStart,
      onZoomEnd: handleZoomEnd,
      onZoomModeChange: cycleZoomMode
    } as TVCameraNavigationCallbacks,
    
    // Additional state for advanced usage
    keyAcceleration: Object.fromEntries(keyAcceleration),
    
    // Utility functions
    clearAllInputs: useCallback(() => {
      setActiveDirections(new Set());
      setKeyAcceleration(new Map());
      
      keyRepeatTimers.current.forEach(timer => clearTimeout(timer));
      keyRepeatTimers.current.clear();
      
      if (isZoomingRef.current) {
        handleZoomEnd();
      }
    }, [handleZoomEnd])
  };
};

export default useTVCameraNavigation;