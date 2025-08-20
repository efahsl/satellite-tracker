import { useCallback, useRef } from 'react';
import { useUI } from '../state/UIContext';
import { useCameraControlsContext } from '../state/CameraControlsContext';

export const useCameraControls = () => {
  const { state, setZoomMode } = useUI();
  const { controlsRef } = useCameraControlsContext();
  const zoomIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDirectionalMove = useCallback((direction: 'north' | 'east' | 'south' | 'west') => {
    if (controlsRef.current) {
      controlsRef.current.rotateToDirection(direction);
    }
  }, [controlsRef]);

  const handleZoomStart = useCallback((isZoomingIn: boolean) => {
    if (!controlsRef.current) return;

    // Clear any existing zoom interval
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
    }

    // Start continuous zoom
    zoomIntervalRef.current = setInterval(() => {
      if (controlsRef.current) {
        if (isZoomingIn) {
          controlsRef.current.zoomIn();
        } else {
          controlsRef.current.zoomOut();
        }
      }
    }, 50); // 20 FPS for smooth zoom
  }, []);

  const handleZoomEnd = useCallback(() => {
    // Stop continuous zoom
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }

    // Toggle zoom mode for next time
    setZoomMode(!state.isZoomingIn);
  }, [state.isZoomingIn, setZoomMode]);

  const handleZoomIn = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.zoomOut();
    }
  }, []);

  return {
    handleDirectionalMove,
    handleZoomStart,
    handleZoomEnd,
    handleZoomIn,
    handleZoomOut,
  };
};