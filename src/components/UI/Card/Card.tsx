import React, { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children?: ReactNode;
  variant?: 'default' | 'elevated' | 'transparent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export interface CardSubtitleProps {
  children: ReactNode;
  className?: string;
}

export interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

// Main Card Component
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
}) => {
  const getCardClasses = () => {
    const baseClass = styles.card;
    const variantClass = variant !== 'default' ? styles[`card--${variant}`] : '';
    const sizeClass = size !== 'md' ? styles[`card--${size}`] : '';
    
    return [
      baseClass,
      variantClass,
      sizeClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div 
      className={getCardClasses()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

// Card Header Component
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`${styles.card__header} ${className}`}>
    {children}
  </div>
);

// Card Body Component
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`${styles.card__body} ${className}`}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`${styles.card__footer} ${className}`}>
    {children}
  </div>
);

// Card Title Component
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`${styles.card__title} ${className}`}>
    {children}
  </h3>
);

// Card Subtitle Component
export const CardSubtitle: React.FC<CardSubtitleProps> = ({ children, className = '' }) => (
  <p className={`${styles.card__subtitle} ${className}`}>
    {children}
  </p>
);

// Card Actions Component
export const CardActions: React.FC<CardActionsProps> = ({ children, className = '' }) => (
  <div className={`${styles.card__actions} ${className}`}>
    {children}
  </div>
);

// Compound Card Component
export const CompoundCard = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Actions: CardActions,
});

export default CompoundCard;
