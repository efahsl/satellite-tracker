import React, { useState, useEffect, useCallback } from 'react';
import { useDevice } from '../../../state/DeviceContext';
import { DpadButton } from './DpadButton';
import { ZoomControl } from './ZoomControl';
import styles from './TVDpadCameraControls.module.css';

interface TVDpadCameraControlsProps {
  isVisible: boolean;
  onHide: () => void;
  onDirectionChange?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoomChange?: (isZoomingIn: boolean) => void;
}

export const TVDpadCameraControls: React.FC<TVDpadCameraControlsProps> = ({
  isVisible,
  onHide,
  onDirectionChange,
  onZoomChange
}) => {
  const { isTVProfile } = useDevice();
  const [isZoomingIn, setIsZoomingIn] = useState(true);

  // Handle direction button clicks
  const handleDirectionClick = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    onDirectionChange?.(direction);
  }, [onDirectionChange]);

  // Handle zoom state changes
  const handleZoomStateChange = useCallback((zoomingIn: boolean) => {
    setIsZoomingIn(zoomingIn);
    onZoomChange?.(zoomingIn);
  }, [onZoomChange]);

  // Handle back button (Escape key)
  const handleBackPress = useCallback(() => {
    onHide();
  }, [onHide]);

  // Global keyboard event listener for TV mode
  useEffect(() => {
    if (!isTVProfile || !isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleDirectionClick('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleDirectionClick('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleDirectionClick('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleDirectionClick('right');
          break;
        case 'Escape':
          event.preventDefault();
          handleBackPress();
          break;
        case 'Enter':
          // Enter key handling is managed by ZoomControl component
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTVProfile, isVisible, handleDirectionClick, handleBackPress]);

  if (!isTVProfile || !isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.dpadContainer}>
        {/* Up arrow */}
        <DpadButton
          direction="up"
          onClick={() => handleDirectionClick('up')}
          className={styles.upButton}
        />
        
        {/* Middle row - Left and Right arrows */}
        <div className={styles.middleRow}>
          <DpadButton
            direction="left"
            onClick={() => handleDirectionClick('left')}
            className={styles.leftButton}
          />
          <DpadButton
            direction="right"
            onClick={() => handleDirectionClick('right')}
            className={styles.rightButton}
          />
        </div>
        
        {/* Down arrow */}
        <DpadButton
          direction="down"
          onClick={() => handleDirectionClick('down')}
          className={styles.downButton}
        />
      </div>

      {/* Zoom control */}
      <ZoomControl
        isZoomingIn={isZoomingIn}
        onZoomStateChange={handleZoomStateChange}
      />

      {/* Back button hint */}
      <div className={styles.backHint}>
        Press ESC to return to menu
      </div>
    </div>
  );
};
