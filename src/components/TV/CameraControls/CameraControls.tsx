import React from 'react';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import DirectionalArrows from './DirectionalArrows';
import ZoomInstructions from './ZoomInstructions';
import styles from './CameraControls.module.css';

interface CameraControlsProps {
  isVisible: boolean;
  onDirectionalMove: (direction: 'north' | 'east' | 'south' | 'west') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isZoomingIn: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isVisible,
  onDirectionalMove,
  onZoomIn,
  onZoomOut,
  isZoomingIn,
}) => {
  const { isTVProfile } = useDevice();

  // Only render in TV mode
  if (!isTVProfile || !isVisible) {
    return null;
  }

  return (
    <div className={styles.cameraControls}>
      <DirectionalArrows onDirectionalMove={onDirectionalMove} />
      <ZoomInstructions 
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        isZoomingIn={isZoomingIn}
      />
    </div>
  );
};

export default CameraControls;