import { useCallback, useRef, useEffect } from 'react';
import { useUI } from '../state/UIContext';
import { useCameraControls } from '../state/CameraControlsContext';
import { TV_CAMERA_CONFIG } from '../utils/tvConstants';

/**
 * Props for the TV zoom control hook
 */
interface UseTVZoomControlProps {
  /** Whether zoom control is enabled */
  isEnabled?: boolean;
  /** Callback for zoom start */
  onZoomStart?: () => void;
  /** Callback for zoom end */
  onZoomEnd?: () => void;
}

/**
 * Return type for the TV zoom control hook
 */
interface UseTVZoomControlReturn {
  /** Whether in zoom mode */
  isInZoomMode: boolean;
  /** Currently active zoom direction */
  activeZoomDirection: 'in' | 'out' | null;
  /** Handle zoom mode toggle (SELECT key) */
  handleZoomModeToggle: () => void;
  /** Handle zoom input (UP/DOWN arrows in zoom mode) */
  handleZoomInput: (direction: 'in' | 'out') => void;
  /** Handle zoom key press (for continuous zoom) */
  handleZoomKeyDown: (direction: 'in' | 'out') => void;
  /** Handle zoom key release (for continuous zoom) */
  handleZoomKeyUp: () => void;
}

/**
 * Custom hook for TV zoom control functionality
 * Manages toggle-based zoom mode and continuous zoom animation
 */
export const useTVZoomControl = ({
  isEnabled = true,
  onZoomStart,
  onZoomEnd
}: UseTVZoomControlProps = {}): UseTVZoomControlReturn => {
  
  // Context hooks
  const { state: uiState, setZoomMode, setActiveZoomDirection } = useUI();
  const { getControlsRef } = useCameraControls();

  // Zoom animation frame ref for continuous zooming
  const zoomAnimationFrameRef = useRef<number | null>(null);
  const zoomStartTime = useRef<number>(0);
  const currentZoomDirection = useRef<'in' | 'out' | null>(null);
  const isZoomingRef = useRef<boolean>(false); // Track zooming state for animation loop

  // Handle zoom mode toggle (SELECT key)
  const handleZoomModeToggle = useCallback(() => {
    if (!isEnabled) return;
    
    // Toggle zoom mode
    const newZoomMode = !uiState.isInZoomMode;
    setZoomMode(newZoomMode);
    
    // Clear active zoom direction when exiting zoom mode
    if (!newZoomMode) {
      setActiveZoomDirection(null);
      // Stop any ongoing zoom animation
      if (zoomAnimationFrameRef.current) {
        cancelAnimationFrame(zoomAnimationFrameRef.current);
        zoomAnimationFrameRef.current = null;
        isZoomingRef.current = false;
        onZoomEnd?.();
      }
    }
  }, [isEnabled, uiState.isInZoomMode, setZoomMode, setActiveZoomDirection, onZoomEnd]);

  // Handle zoom input (UP/DOWN arrows in zoom mode)
  const handleZoomInput = useCallback((direction: 'in' | 'out') => {
    if (!isEnabled || !uiState.isInZoomMode) return;
    
    setActiveZoomDirection(direction);
  }, [isEnabled, uiState.isInZoomMode, setActiveZoomDirection]);

  // Start continuous zoom animation
  const startZoomAnimation = useCallback((direction: 'in' | 'out') => {
    if (isZoomingRef.current) return; // Already zooming
    
    isZoomingRef.current = true;
    currentZoomDirection.current = direction;
    zoomStartTime.current = Date.now();
    
    onZoomStart?.();

    const zoomLoop = () => {
      if (!isZoomingRef.current || currentZoomDirection.current === null) {
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
        
        controlsRef.handleZoomChange(currentZoomDirection.current === 'in', zoomSpeed);
      }

      // Continue zoom animation
      if (typeof requestAnimationFrame !== 'undefined') {
        zoomAnimationFrameRef.current = requestAnimationFrame(zoomLoop);
      } else {
        // Fallback for test environment
        zoomAnimationFrameRef.current = setTimeout(zoomLoop, 16) as any;
      }
    };

    // Start the zoom animation loop
    zoomAnimationFrameRef.current = requestAnimationFrame(zoomLoop);
  }, [onZoomStart, getControlsRef]);

  // Stop zoom animation
  const stopZoomAnimation = useCallback(() => {
    isZoomingRef.current = false;
    currentZoomDirection.current = null;
    
    if (zoomAnimationFrameRef.current) {
      cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
    
    onZoomEnd?.();
  }, [onZoomEnd]);

  // Handle zoom key press (for continuous zoom)
  const handleZoomKeyDown = useCallback((direction: 'in' | 'out') => {
    if (!isEnabled || !uiState.isInZoomMode) return;
    
    setActiveZoomDirection(direction);
    startZoomAnimation(direction);
  }, [isEnabled, uiState.isInZoomMode, setActiveZoomDirection, startZoomAnimation]);

  // Handle zoom key release (for continuous zoom)
  const handleZoomKeyUp = useCallback(() => {
    if (!isEnabled) return;
    
    setActiveZoomDirection(null);
    stopZoomAnimation();
  }, [isEnabled, setActiveZoomDirection, stopZoomAnimation]);

  // Cleanup when disabled or exiting zoom mode
  useEffect(() => {
    if (!isEnabled) {
      // When disabled, exit zoom mode and clean up
      if (uiState.isInZoomMode) {
        setZoomMode(false);
      }
      stopZoomAnimation();
      setActiveZoomDirection(null);
    } else if (!uiState.isInZoomMode) {
      // When exiting zoom mode, clean up zoom animation
      stopZoomAnimation();
      setActiveZoomDirection(null);
    }
  }, [isEnabled, uiState.isInZoomMode, stopZoomAnimation, setActiveZoomDirection, setZoomMode]);

  return {
    isInZoomMode: uiState.isInZoomMode,
    activeZoomDirection: uiState.activeZoomDirection,
    handleZoomModeToggle,
    handleZoomInput,
    handleZoomKeyDown,
    handleZoomKeyUp
  };
};

export default useTVZoomControl;