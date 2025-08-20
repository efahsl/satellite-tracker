import React from 'react';
import styles from './TVCameraControls.module.css';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useISS } from '../../../state/ISSContext';
import { useTVCameraNavigation } from '../../../hooks/useTVCameraNavigation';
import { TV_CAMERA_DIRECTIONS, TV_CAMERA_ZOOM_MODES } from '../../../utils/tvConstants';

export interface TVCameraControlsProps {
  visible?: boolean;
  zoomMode?: 'in' | 'out';
  isZooming?: boolean;
  activeDirection?: string | null;
  pressedDirection?: string | null;
  onDirectionalInput?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

interface DirectionalArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  isActive?: boolean;
  isPressed?: boolean;
  className?: string;
}

const DirectionalArrow: React.FC<DirectionalArrowProps> = ({ 
  direction, 
  isActive = false,
  isPressed = false,
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
    isPressed ? styles['arrow--pressed'] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={arrowClasses}
      role="button"
      tabIndex={-1}
      aria-label={`Navigate ${direction}`}
      aria-pressed={isActive}
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
      // When actively zooming, show what's currently happening
      // Since the mode gets toggled when zoom starts, we need to show the opposite of current mode
      return zoomMode === TV_CAMERA_ZOOM_MODES.IN 
        ? 'Zooming OUT...' 
        : 'Zooming IN...';
    }
    
    // When not zooming, show what will happen when SELECT is pressed
    return zoomMode === TV_CAMERA_ZOOM_MODES.IN 
      ? 'Hold SELECT to Zoom IN' 
      : 'Hold SELECT to Zoom OUT';
  };

  const textClasses = [
    styles.zoomInstruction,
    isZooming ? styles.zoomInstructionActive : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.zoomText}>
      <span className={textClasses}>
        {getZoomText()}
      </span>
    </div>
  );
};

export const TVCameraControls: React.FC<TVCameraControlsProps> = ({
  visible = true,
  zoomMode: propZoomMode,
  isZooming: propIsZooming,
  activeDirection: propActiveDirection,
  pressedDirection: propPressedDirection,
  onDirectionalInput,
  onZoomStart,
  onZoomEnd
}) => {
  const { isTVProfile } = useDevice();
  const { state: uiState } = useUI();
  const { state } = useISS();

  // Use the TV camera navigation hook for input handling
  const {
    activeDirection: hookActiveDirection,
    pressedDirection: hookPressedDirection,
    isZooming: hookIsZooming,
    zoomMode: hookZoomMode
  } = useTVCameraNavigation({
    isEnabled: true,
    onDirectionalInput,
    onZoomStart,
    onZoomEnd
  });

  // Manual mode is when neither followISS nor earthRotateMode is active
  const manualMode = !state.followISS && !state.earthRotateMode;

  // Determine if controls should be visible based on all conditions
  const shouldShowControls = visible && 
    isTVProfile && 
    !uiState.hamburgerMenuVisible && 
    manualMode;

  // Use hook values if props are not provided (hook takes precedence for state management)
  const activeDirection = propActiveDirection !== undefined ? propActiveDirection : hookActiveDirection;
  const pressedDirection = propPressedDirection !== undefined ? propPressedDirection : hookPressedDirection;
  const isZooming = propIsZooming !== undefined ? propIsZooming : hookIsZooming;
  const zoomMode = propZoomMode !== undefined ? propZoomMode : hookZoomMode;

  // Always render the component but control visibility with CSS classes for smooth animations
  const containerClasses = [
    styles.container,
    'tv-camera-controls',
    shouldShowControls ? styles.visible : styles.hidden
  ].filter(Boolean).join(' ');

  // Only render in TV mode to avoid unnecessary DOM elements
  if (!isTVProfile) {
    return null;
  }

  return (
    <div className={containerClasses}>
      {/* Directional arrows container */}
      <div className={styles.arrowsContainer}>
        {/* Top arrow */}
        <DirectionalArrow 
          direction={TV_CAMERA_DIRECTIONS.UP}
          isActive={activeDirection === TV_CAMERA_DIRECTIONS.UP}
          isPressed={pressedDirection === TV_CAMERA_DIRECTIONS.UP}
          className={styles.arrowTop}
        />
        
        {/* Middle row with left and right arrows */}
        <div className={styles.arrowsMiddleRow}>
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.LEFT}
            isActive={activeDirection === TV_CAMERA_DIRECTIONS.LEFT}
            isPressed={pressedDirection === TV_CAMERA_DIRECTIONS.LEFT}
            className={styles.arrowLeft}
          />
          
          {/* Center space for visual balance */}
          <div className={styles.arrowsCenter} />
          
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.RIGHT}
            isActive={activeDirection === TV_CAMERA_DIRECTIONS.RIGHT}
            isPressed={pressedDirection === TV_CAMERA_DIRECTIONS.RIGHT}
            className={styles.arrowRight}
          />
        </div>
        
        {/* Bottom arrow */}
        <DirectionalArrow 
          direction={TV_CAMERA_DIRECTIONS.DOWN}
          isActive={activeDirection === TV_CAMERA_DIRECTIONS.DOWN}
          isPressed={pressedDirection === TV_CAMERA_DIRECTIONS.DOWN}
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