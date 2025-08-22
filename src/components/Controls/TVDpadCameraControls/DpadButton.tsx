import React from 'react';
import styles from './TVDpadCameraControls.module.css';

interface DpadButtonProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onClick: () => void;
  className?: string;
}

export const DpadButton: React.FC<DpadButtonProps> = ({
  direction,
  onClick,
  className = ''
}) => {
  const getArrowSymbol = () => {
    switch (direction) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      case 'left':
        return '◀';
      case 'right':
        return '▶';
      default:
        return '';
    }
  };

  const getAriaLabel = () => {
    switch (direction) {
      case 'up':
        return 'Rotate camera to North';
      case 'down':
        return 'Rotate camera to South';
      case 'left':
        return 'Rotate camera to West';
      case 'right':
        return 'Rotate camera to East';
      default:
        return '';
    }
  };

  return (
    <button
      className={`${styles.dpadButton} ${styles[direction]} ${className}`}
      onClick={onClick}
      aria-label={getAriaLabel()}
      type="button"
    >
      <span className={styles.arrowSymbol}>
        {getArrowSymbol()}
      </span>
    </button>
  );
};
