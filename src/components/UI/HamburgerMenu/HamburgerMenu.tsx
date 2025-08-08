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
        style={{ 
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
          padding: '80px 20px 20px 20px',
          overflowY: 'auto'
        }}
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default HamburgerMenu;
