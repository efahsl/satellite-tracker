import React from 'react';
import { ZOOM_MODES, type ZoomMode } from '../../../utils/tvCameraConfig';
import styles from './ZoomInstructions.module.css';

export interface ZoomInstructionsProps {
  zoomMode: ZoomMode;
  isZooming: boolean;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

const ZOOM_INSTRUCTIONS = {
  [ZOOM_MODES.IN]: 'Hold SELECT to Zoom IN',
  [ZOOM_MODES.OUT]: 'Hold SELECT to Zoom OUT'
} as const;

export const ZoomInstructions: React.FC<ZoomInstructionsProps> = ({
  zoomMode,
  isZooming,
  onZoomStart,
  onZoomEnd
}) => {
  const instructionText = ZOOM_INSTRUCTIONS[zoomMode];

  const handleClick = () => {
    if (isZooming) {
      onZoomEnd?.();
    } else {
      onZoomStart?.();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isZooming) {
        onZoomEnd?.();
      } else {
        onZoomStart?.();
      }
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.instructions} ${isZooming ? styles.zooming : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={instructionText}
        data-testid="zoom-instructions"
        data-zoom-mode={zoomMode}
        data-is-zooming={isZooming}
      >
        <span className={styles.text}>
          {instructionText}
        </span>
        {isZooming && (
          <span className={styles.indicator} aria-hidden="true">
            ●
          </span>
        )}
      </button>
    </div>
  );
};

export default ZoomInstructions;