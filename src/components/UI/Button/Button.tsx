import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  iconOnly = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const getButtonClasses = () => {
    const baseClass = styles.button;
    const variantClass = styles[`button--${variant}`];
    const sizeClass = size !== 'md' ? styles[`button--${size}`] : '';
    const stateClass = disabled ? styles['button--disabled'] : '';
    const loadingClass = loading ? styles['button--loading'] : '';
    const iconOnlyClass = iconOnly ? styles['button--icon-only'] : '';
    
    return [
      baseClass,
      variantClass,
      sizeClass,
      stateClass,
      loadingClass,
      iconOnlyClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {children}
    </button>
  );
};

export default Button;
