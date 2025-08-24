import { useCallback, useRef, useEffect } from 'react';
import { useUI } from '../state/UIContext';
import { useCameraControls } from '../state/CameraControlsContext';
import { TV_CAMERA_ZOOM_MODES, TV_CAMERA_CONFIG } from '../utils/tvConstants';

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
  /** Whether zoom is currently active */
  isZooming: boolean;
  /** Current zoom mode */
  zoomMode: 'in' | 'out';
  /** Handle zoom key press */
  handleZoomKeyDown: () => void;
  /** Handle zoom key release */
  handleZoomKeyUp: () => void;
}

/**
 * Custom hook for TV zoom control functionality
 * Manages zoom state and continuous zoom animation
 */
export const useTVZoomControl = ({
  isEnabled = true,
  onZoomStart,
  onZoomEnd
}: UseTVZoomControlProps = {}): UseTVZoomControlReturn => {
  
  // Context hooks
  const { state: uiState, setZoomMode, setZooming } = useUI();
  const { getControlsRef } = useCameraControls();

  // Zoom animation frame ref for continuous zooming
  const zoomAnimationFrameRef = useRef<number | null>(null);
  const zoomStartTime = useRef<number>(0);
  const currentZoomDirection = useRef<boolean>(false); // true for zoom in, false for zoom out
  const isZoomingRef = useRef<boolean>(false); // Track zooming state for animation loop

  // Handle zoom functionality with continuous hold-to-zoom behavior
  const handleZoomStart = useCallback(() => {
    if (!isEnabled) {
      return;
    }

    setZooming(true);
    isZoomingRef.current = true; // Set ref immediately for animation loop
    zoomStartTime.current = Date.now();
    
    // Determine zoom direction based on current mode
    currentZoomDirection.current = uiState.zoomMode === TV_CAMERA_ZOOM_MODES.IN;
    
    onZoomStart?.();

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
    zoomAnimationFrameRef.current = requestAnimationFrame(zoomLoop);

    // Toggle zoom mode for next time (this changes the instruction text)
    const newZoomMode = uiState.zoomMode === TV_CAMERA_ZOOM_MODES.IN 
      ? TV_CAMERA_ZOOM_MODES.OUT 
      : TV_CAMERA_ZOOM_MODES.IN;
    setZoomMode(newZoomMode);
  }, [isEnabled, uiState.zoomMode, uiState.isZooming, setZooming, setZoomMode, onZoomStart, getControlsRef]);

  const handleZoomEnd = useCallback(() => {
    setZooming(false);
    isZoomingRef.current = false; // Set ref immediately to stop animation loop
    
    // Stop zoom animation
    if (zoomAnimationFrameRef.current) {
      cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
    
    onZoomEnd?.();
  }, [setZooming, onZoomEnd]);

  // Handle zoom key press
  const handleZoomKeyDown = useCallback(() => {
    if (!uiState.isZooming) {
      // Start zoom immediately on key press (no delay for better responsiveness)
      handleZoomStart();
    }
  }, [uiState.isZooming, handleZoomStart]);

  // Handle zoom key release
  const handleZoomKeyUp = useCallback(() => {
    if (!isEnabled) return;
    
    if (uiState.isZooming) {
      handleZoomEnd();
    }
  }, [isEnabled, uiState.isZooming, handleZoomEnd]);

  // Cleanup when disabled
  useEffect(() => {
    if (!isEnabled && uiState.isZooming) {
      handleZoomEnd();
    }
  }, [isEnabled, uiState.isZooming, handleZoomEnd]);

  return {
    isZooming: uiState.isZooming,
    zoomMode: uiState.zoomMode,
    handleZoomKeyDown,
    handleZoomKeyUp
  };
};

export default useTVZoomControl;