import React, { useState, useEffect, useCallback } from 'react';
import styles from './TVDpadCameraControls.module.css';

interface ZoomControlProps {
  isZoomingIn: boolean;
  onZoomStateChange: (isZoomingIn: boolean) => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  isZoomingIn,
  onZoomStateChange
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);

  // Handle Enter key press (SELECT button)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isHolding) {
      event.preventDefault();
      setIsHolding(true);
      setHoldStartTime(Date.now());
    }
  }, [isHolding]);

  // Handle Enter key release
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter' && isHolding) {
      event.preventDefault();
      setIsHolding(false);
      setHoldStartTime(null);
      
      // Toggle zoom direction when Enter is released
      onZoomStateChange(!isZoomingIn);
    }
  }, [isHolding, isZoomingIn, onZoomStateChange]);

  // Set up global keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Get the appropriate text based on current state
  const getZoomText = () => {
    if (isHolding) {
      return isZoomingIn ? 'Zooming IN...' : 'Zooming OUT...';
    }
    return isZoomingIn ? 'Hold SELECT to Zoom IN' : 'Hold SELECT to Zoom OUT';
  };

  return (
    <div className={styles.zoomControl}>
      <div className={styles.zoomText}>
        {getZoomText()}
      </div>
      <div className={styles.zoomHint}>
        Press and hold Enter
      </div>
    </div>
  );
};
