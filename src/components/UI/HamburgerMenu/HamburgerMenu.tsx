import React, { useState, useCallback } from 'react';
import { ISSFollowControls } from '../../Controls/ISSFollowControls';
import { PerformanceControls } from '../../Controls/PerformanceControls';
import { useDevice } from '../../../state/DeviceContext';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDevice();

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

  // Close menu when clicking on a control (better UX on mobile)
  const handleControlInteraction = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <div className={`${styles.hamburgerMenu} ${className}`} onKeyDown={handleKeyDown}>
      {/* Hamburger Button */}
      <button
        className={`${styles.button} ${isOpen ? styles.buttonActive : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="hamburger-menu-content"
        type="button"
      >
        <span className={styles.icon}>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </span>
      </button>

      {/* Menu Content */}
      <div 
        id="hamburger-menu-content"
        className={`${styles.content} ${isOpen ? styles.contentOpen : ''} ${isMobile ? styles.contentMobile : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.controls} onClick={handleControlInteraction}>
          <ISSFollowControls />
          <PerformanceControls />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default HamburgerMenu;
