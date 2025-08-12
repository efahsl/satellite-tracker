import React from 'react';
import { Button } from './Button';

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
  activeText: string;
  inactiveText: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  activeText,
  inactiveText,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  return (
    <Button
      onClick={onToggle}
      variant={isActive ? 'primary' : 'secondary'}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel || `${isActive ? 'Disable' : 'Enable'} ${activeText.replace(' ON', '')}`}
      aria-pressed={isActive}
    >
      <span className="button-label">
        {isActive ? activeText : inactiveText}
      </span>
      {isActive && (
        <span className="button-indicator" aria-hidden="true">
          ✓
        </span>
      )}
    </Button>
  );
};