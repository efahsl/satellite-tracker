import React from 'react';
import styles from './TVCameraControls.module.css';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useISS } from '../../../state/ISSContext';
import { TV_CAMERA_DIRECTIONS, TV_CAMERA_ZOOM_MODES } from '../../../utils/tvConstants';

export interface TVCameraControlsProps {
  visible?: boolean;
  zoomMode?: 'in' | 'out';
  isZooming?: boolean;
  activeDirection?: string | null;
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

interface DirectionalArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  isActive?: boolean;
  className?: string;
}

const DirectionalArrow: React.FC<DirectionalArrowProps> = ({ 
  direction, 
  isActive = false,
  className = ''
}) => {
  const arrowSymbols = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→'
  };

  const arrowClasses = [
    styles.arrow,
    styles[`arrow--${direction}`],
    isActive ? styles['arrow--active'] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={arrowClasses}
      role="button"
      tabIndex={-1}
      aria-label={`Navigate ${direction}`}
    >
      <span className={styles.arrowSymbol}>
        {arrowSymbols[direction]}
      </span>
    </div>
  );
};

interface ZoomInstructionTextProps {
  zoomMode: 'in' | 'out';
  isZooming: boolean;
}

const ZoomInstructionText: React.FC<ZoomInstructionTextProps> = ({ 
  zoomMode, 
  isZooming 
}) => {
  const getZoomText = () => {
    if (isZooming) {
      return zoomMode === TV_CAMERA_ZOOM_MODES.IN 
        ? 'Hold SELECT to Zoom OUT' 
        : 'Hold SELECT to Zoom IN';
    }
    return zoomMode === TV_CAMERA_ZOOM_MODES.IN 
      ? 'Hold SELECT to Zoom IN' 
      : 'Hold SELECT to Zoom OUT';
  };

  return (
    <div className={styles.zoomText}>
      <span className={styles.zoomInstruction}>
        {getZoomText()}
      </span>
    </div>
  );
};

export const TVCameraControls: React.FC<TVCameraControlsProps> = ({
  visible = true,
  zoomMode = TV_CAMERA_ZOOM_MODES.IN,
  isZooming = false,
  activeDirection = null,
  onDirectionalInput,
  onZoomStart,
  onZoomEnd
}) => {
  const { isTVProfile } = useDevice();
  const { hamburgerMenuVisible } = useUI();
  const { state } = useISS();

  // Manual mode is when neither followISS nor earthRotateMode is active
  const manualMode = !state.followISS && !state.earthRotateMode;

  // Determine if controls should be visible based on all conditions
  const shouldShowControls = visible && 
    isTVProfile && 
    !hamburgerMenuVisible && 
    manualMode;

  if (!shouldShowControls) {
    return null;
  }

  const containerClasses = [
    styles.container,
    'tv-camera-controls'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Directional arrows container */}
      <div className={styles.arrowsContainer}>
        {/* Top arrow */}
        <DirectionalArrow 
          direction={TV_CAMERA_DIRECTIONS.UP}
          isActive={activeDirection === TV_CAMERA_DIRECTIONS.UP}
          className={styles.arrowTop}
        />
        
        {/* Middle row with left and right arrows */}
        <div className={styles.arrowsMiddleRow}>
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.LEFT}
            isActive={activeDirection === TV_CAMERA_DIRECTIONS.LEFT}
            className={styles.arrowLeft}
          />
          
          {/* Center space for visual balance */}
          <div className={styles.arrowsCenter} />
          
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.RIGHT}
            isActive={activeDirection === TV_CAMERA_DIRECTIONS.RIGHT}
            className={styles.arrowRight}
          />
        </div>
        
        {/* Bottom arrow */}
        <DirectionalArrow 
          direction={TV_CAMERA_DIRECTIONS.DOWN}
          isActive={activeDirection === TV_CAMERA_DIRECTIONS.DOWN}
          className={styles.arrowBottom}
        />
      </div>

      {/* Zoom instruction text */}
      <ZoomInstructionText 
        zoomMode={zoomMode}
        isZooming={isZooming}
      />
    </div>
  );
};

export default TVCameraControls;