import React, { useState, useCallback } from 'react';
import { ISSFollowControls } from '../../Controls/ISSFollowControls';
import { PerformanceControls } from '../../Controls/PerformanceControls';
import './HamburgerMenu.css';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    console.log('Hamburger menu toggle clicked, current state:', isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={`hamburger-menu ${className}`} onKeyDown={handleKeyDown}>
      {/* Hamburger Button */}
      <button
        className={`hamburger-menu__button ${isOpen ? 'hamburger-menu__button--active' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="hamburger-menu-content"
        type="button"
      >
        <span className="hamburger-menu__icon">
          <span className="hamburger-menu__line"></span>
          <span className="hamburger-menu__line"></span>
          <span className="hamburger-menu__line"></span>
        </span>
      </button>

      {/* Menu Content */}
      <div 
        id="hamburger-menu-content"
        className={`hamburger-menu__content ${isOpen ? 'hamburger-menu__content--open' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="hamburger-menu__controls">
          <ISSFollowControls />
          <PerformanceControls />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="hamburger-menu__backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default HamburgerMenu;
