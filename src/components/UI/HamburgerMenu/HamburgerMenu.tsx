import React, { useState, useCallback, useEffect } from 'react';
import { ISSFollowControls, PerformanceControls, DisplayControls } from '../../Controls';
import { useDevice } from '../../../state/DeviceContext';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const { isMobile, isTVProfile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open menu when TV profile is detected
  useEffect(() => {
    if (isTVProfile) {
      setIsOpen(true);
    }
  }, [isTVProfile]);

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

  // Close menu when clicking on a control (better UX on mobile, but keep open on TV)
  const handleControlInteraction = useCallback(() => {
    if (isMobile && !isTVProfile) {
      setIsOpen(false);
    }
  }, [isMobile, isTVProfile]);

  return (
    <div className={`${styles.hamburgerMenu} ${className}`} onKeyDown={handleKeyDown}>
      {/* Hamburger Button - Hidden in TV mode */}
      {!isTVProfile && (
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
      )}

      {/* Menu Content */}
      <div 
        id="hamburger-menu-content"
        className={`${styles.content} ${(isOpen || isTVProfile) ? styles.contentOpen : ''} ${
          isTVProfile ? styles.contentTV : 
          isMobile ? styles.contentMobile : ''
        }`}
        aria-hidden={!isOpen && !isTVProfile}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={`${styles.controls} ${isTVProfile ? 'tv-menu-controls' : ''}`} onClick={handleControlInteraction}>
          <ISSFollowControls />
          <PerformanceControls />
          <DisplayControls />
        </div>
      </div>

      {/* Backdrop - Only show for mobile/desktop, not TV */}
      {isOpen && !isTVProfile && (
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
