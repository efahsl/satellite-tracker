import { memo } from "react";
import styles from "./ToggleButton.module.css";

export interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  activeText: string;
  inactiveText: string;
  ariaLabel: string;
  isTVMode?: boolean;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = memo(({
  isActive,
  onClick,
  activeText,
  inactiveText,
  ariaLabel,
  isTVMode = false,
  className = ""
}) => (
  <button
    onClick={onClick}
    className={`${styles.button} ${
      isActive ? styles.buttonActive : ""
    } ${isTVMode ? 'tv-button tv-focus-indicator' : ''} ${className}`}
    aria-label={ariaLabel}
    aria-pressed={isActive}
  >
    <span className={styles.buttonLabel}>
      {isActive ? activeText : inactiveText}
    </span>
    {isActive && (
      <span className={styles.buttonIndicator}>✓</span>
    )}
  </button>
));

ToggleButton.displayName = 'ToggleButton';