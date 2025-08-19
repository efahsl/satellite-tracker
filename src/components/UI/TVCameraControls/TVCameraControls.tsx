import React from 'react';
import { DirectionalArrow } from './DirectionalArrow';
import { ZoomInstructions } from './ZoomInstructions';
import { DIRECTIONAL_INPUTS, TV_CAMERA_CONFIG, type DirectionalInput, type ZoomMode } from '../../../utils/tvCameraConfig';
import styles from './TVCameraControls.module.css';

export interface TVCameraControlsProps {
  visible: boolean;
  zoomMode: ZoomMode;
  isZooming: boolean;
  activeDirections?: Set<DirectionalInput>;
  onDirectionalInput?: (direction: DirectionalInput) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

export const TVCameraControls: React.FC<TVCameraControlsProps> = ({
  visible,
  zoomMode,
  isZooming,
  activeDirections = new Set(),
  onDirectionalInput,
  onZoomStart,
  onZoomEnd
}) => {
  if (!visible) {
    return null;
  }

  const handleDirectionalClick = (direction: DirectionalInput) => {
    onDirectionalInput?.(direction);
  };

  return (
    <div className={styles.container} data-testid="tv-camera-controls">
      {/* Directional arrows in cross pattern */}
      <div className={styles.arrowsContainer}>
        {/* Up arrow */}
        <DirectionalArrow
          direction={DIRECTIONAL_INPUTS.UP}
          isActive={activeDirections.has(DIRECTIONAL_INPUTS.UP)}
          onClick={() => handleDirectionalClick(DIRECTIONAL_INPUTS.UP)}
          className={styles.arrowUp}
        />
        
        {/* Left and Right arrows */}
        <div className={styles.horizontalArrows}>
          <DirectionalArrow
            direction={DIRECTIONAL_INPUTS.LEFT}
            isActive={activeDirections.has(DIRECTIONAL_INPUTS.LEFT)}
            onClick={() => handleDirectionalClick(DIRECTIONAL_INPUTS.LEFT)}
            className={styles.arrowLeft}
          />
          <DirectionalArrow
            direction={DIRECTIONAL_INPUTS.RIGHT}
            isActive={activeDirections.has(DIRECTIONAL_INPUTS.RIGHT)}
            onClick={() => handleDirectionalClick(DIRECTIONAL_INPUTS.RIGHT)}
            className={styles.arrowRight}
          />
        </div>
        
        {/* Down arrow */}
        <DirectionalArrow
          direction={DIRECTIONAL_INPUTS.DOWN}
          isActive={activeDirections.has(DIRECTIONAL_INPUTS.DOWN)}
          onClick={() => handleDirectionalClick(DIRECTIONAL_INPUTS.DOWN)}
          className={styles.arrowDown}
        />
      </div>

      {/* Zoom instructions */}
      <ZoomInstructions
        zoomMode={zoomMode}
        isZooming={isZooming}
        onZoomStart={onZoomStart}
        onZoomEnd={onZoomEnd}
      />
    </div>
  );
};

export default TVCameraControls;