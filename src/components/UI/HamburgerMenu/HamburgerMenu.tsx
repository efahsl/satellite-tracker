import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ISSFollowControls, PerformanceControls, DisplayControls } from '../../Controls';
import { useDevice } from '../../../state/DeviceContext';
import { useTVFocusManager, findFocusableElements } from '../../../hooks/useTVFocusManager';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const { isMobile, isTVProfile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Auto-open menu when TV profile is detected
  useEffect(() => {
    if (isTVProfile) {
      setIsOpen(true);
    }
  }, [isTVProfile]);

  // Update focusable elements when menu opens/closes or content changes
  useEffect(() => {
    if (isTVProfile && isOpen && menuContentRef.current) {
      const elements = findFocusableElements(menuContentRef.current);
      setFocusableElements(elements);
    } else {
      setFocusableElements([]);
    }
  }, [isTVProfile, isOpen]);

  // TV focus manager for keyboard navigation
  const { currentFocusIndex, focusElement } = useTVFocusManager({
    isEnabled: isTVProfile && isOpen,
    focusableElements,
    onEscape: () => {
      // In TV mode, escape key should not close the menu since it's persistent
      // This is handled by the global back/escape key listener for menu reopening
    },
    initialFocusIndex: 0
  });

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

  // Focus first element when menu opens in TV mode
  useEffect(() => {
    if (isTVProfile && isOpen && focusableElements.length > 0) {
      // Small delay to ensure elements are rendered and focusable
      const timeoutId = setTimeout(() => {
        focusElement(0);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isTVProfile, isOpen, focusableElements.length, focusElement]);

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
        ref={menuContentRef}
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
