import React from 'react';
import { DIRECTIONAL_INPUTS, type DirectionalInput } from '../../../utils/tvCameraConfig';
import styles from './DirectionalArrow.module.css';

export interface DirectionalArrowProps {
  direction: DirectionalInput;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const ARROW_SYMBOLS = {
  [DIRECTIONAL_INPUTS.UP]: '↑',
  [DIRECTIONAL_INPUTS.DOWN]: '↓',
  [DIRECTIONAL_INPUTS.LEFT]: '←',
  [DIRECTIONAL_INPUTS.RIGHT]: '→'
} as const;

const ARROW_LABELS = {
  [DIRECTIONAL_INPUTS.UP]: 'Navigate North',
  [DIRECTIONAL_INPUTS.DOWN]: 'Navigate South',
  [DIRECTIONAL_INPUTS.LEFT]: 'Navigate West',
  [DIRECTIONAL_INPUTS.RIGHT]: 'Navigate East'
} as const;

export const DirectionalArrow: React.FC<DirectionalArrowProps> = ({
  direction,
  isActive = false,
  onClick,
  className = ''
}) => {
  const symbol = ARROW_SYMBOLS[direction as keyof typeof ARROW_SYMBOLS];
  const label = ARROW_LABELS[direction as keyof typeof ARROW_LABELS];

  if (!symbol) {
    return null;
  }

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.arrow} ${isActive ? styles.active : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      data-testid={`directional-arrow-${direction}`}
      data-direction={direction}
      data-active={isActive}
    >
      <span className={styles.symbol} aria-hidden="true">
        {symbol}
      </span>
    </button>
  );
};

export default DirectionalArrow;