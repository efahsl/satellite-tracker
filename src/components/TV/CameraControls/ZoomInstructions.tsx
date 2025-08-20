import React from 'react';
import styles from './CameraControls.module.css';

interface ZoomInstructionsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  isZoomingIn: boolean;
}

const ZoomInstructions: React.FC<ZoomInstructionsProps> = ({
  onZoomIn,
  onZoomOut,
  isZoomingIn,
}) => {
  const handleZoomAction = () => {
    if (isZoomingIn) {
      onZoomIn();
    } else {
      onZoomOut();
    }
  };

  return (
    <div className={styles.zoomInstructions}>
      <div className={styles.zoomText}>
        Hold SELECT to {isZoomingIn ? 'Zoom IN' : 'Zoom OUT'}
      </div>
      <div className={styles.selectKey}>
        SELECT
      </div>
    </div>
  );
};

export default ZoomInstructions;