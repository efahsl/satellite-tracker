import React from 'react';
import styles from './TVCameraControls.module.css';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useISS } from '../../../state/ISSContext';
import { useTVCameraNavigation } from '../../../hooks/useTVCameraNavigation';
import { TV_CAMERA_DIRECTIONS } from '../../../utils/tvConstants';

export interface TVCameraControlsProps {
  visible?: boolean;
  isInZoomMode?: boolean;
  activeZoomDirection?: 'in' | 'out' | null;
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
  isDisabled?: boolean;
  className?: string;
}

const DirectionalArrow: React.FC<DirectionalArrowProps> = ({ 
  direction, 
  isActive = false,
  isPressed = false,
  isDisabled = false,
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
    isDisabled ? styles['arrow--disabled'] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={arrowClasses}
      role="button"
      tabIndex={-1}
      aria-label={`Navigate ${direction}`}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
    >
      <span className={styles.arrowSymbol}>
        {arrowSymbols[direction]}
      </span>
    </div>
  );
};

interface ZoomInstructionTextProps {
  isInZoomMode: boolean;
  activeZoomDirection: 'in' | 'out' | null;
}

const ZoomInstructionText: React.FC<ZoomInstructionTextProps> = ({ 
  isInZoomMode, 
  activeZoomDirection 
}) => {
  const getZoomText = () => {
    if (isInZoomMode) {
      // In zoom mode: show zoom instructions
      // if (activeZoomDirection) {
      //   return activeZoomDirection === 'in' 
      //     ? 'Zooming IN...' 
      //     : 'Zooming OUT...';
      // }
      return 'SELECT=Exit';
    }
    
    // In navigation mode: show how to enter zoom mode
    return 'Press SELECT for Zoom Mode';
  };

  const textClasses = [
    styles.zoomInstruction,
    activeZoomDirection ? styles.zoomInstructionActive : ''
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
  isInZoomMode: propIsInZoomMode,
  activeZoomDirection: propActiveZoomDirection,
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
    isInZoomMode: hookIsInZoomMode,
    activeZoomDirection: hookActiveZoomDirection
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
  const isInZoomMode = propIsInZoomMode !== undefined ? propIsInZoomMode : hookIsInZoomMode;
  const activeZoomDirection = propActiveZoomDirection !== undefined ? propActiveZoomDirection : hookActiveZoomDirection;

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
          isActive={!isInZoomMode && activeDirection === TV_CAMERA_DIRECTIONS.UP}
          isPressed={!isInZoomMode && pressedDirection === TV_CAMERA_DIRECTIONS.UP}
          isDisabled={false} // UP arrow works in both modes
          className={styles.arrowTop}
        />
        
        {/* Middle row with left and right arrows */}
        <div className={styles.arrowsMiddleRow}>
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.LEFT}
            isActive={!isInZoomMode && activeDirection === TV_CAMERA_DIRECTIONS.LEFT}
            isPressed={!isInZoomMode && pressedDirection === TV_CAMERA_DIRECTIONS.LEFT}
            isDisabled={isInZoomMode} // LEFT arrow disabled in zoom mode
            className={styles.arrowLeft}
          />
          
          {/* Center space for visual balance */}
          <div className={styles.arrowsCenter} />
          
          <DirectionalArrow 
            direction={TV_CAMERA_DIRECTIONS.RIGHT}
            isActive={!isInZoomMode && activeDirection === TV_CAMERA_DIRECTIONS.RIGHT}
            isPressed={!isInZoomMode && pressedDirection === TV_CAMERA_DIRECTIONS.RIGHT}
            isDisabled={isInZoomMode} // RIGHT arrow disabled in zoom mode
            className={styles.arrowRight}
          />
        </div>
        
        {/* Bottom arrow */}
        <DirectionalArrow 
          direction={TV_CAMERA_DIRECTIONS.DOWN}
          isActive={!isInZoomMode && activeDirection === TV_CAMERA_DIRECTIONS.DOWN}
          isPressed={!isInZoomMode && pressedDirection === TV_CAMERA_DIRECTIONS.DOWN}
          isDisabled={false} // DOWN arrow works in both modes
          className={styles.arrowBottom}
        />
      </div>

      {/* Zoom instruction text */}
      <ZoomInstructionText 
        isInZoomMode={isInZoomMode}
        activeZoomDirection={activeZoomDirection}
      />
    </div>
  );
};

export default TVCameraControls;