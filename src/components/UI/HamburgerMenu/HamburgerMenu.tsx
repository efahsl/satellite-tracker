import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ISSFollowControls, PerformanceControls, DisplayControls } from '../../Controls';
import { useDevice } from '../../../state/DeviceContext';
import { useUI } from '../../../state/UIContext';
import { useTVFocusManager, findFocusableElements } from '../../../hooks/useTVFocusManager';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const { isMobile, isTVProfile } = useDevice();
  const { state: uiState, setHamburgerMenuVisible } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Sync local state with UIContext for TV mode and auto-open menu
  useEffect(() => {
    if (isTVProfile) {
      setIsOpen(uiState.hamburgerMenuVisible);
      // Auto-open menu when TV profile is first detected
      if (uiState.hamburgerMenuVisible === false) {
        setHamburgerMenuVisible(true);
      }
    }
  }, [isTVProfile, uiState.hamburgerMenuVisible, setHamburgerMenuVisible]);

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
    
    if (isAnimating) return; // Prevent interaction during animation
    
    if (isTVProfile) {
      // In TV mode, use UIContext to manage state
      setHamburgerMenuVisible(!uiState.hamburgerMenuVisible);
    } else {
      // In mobile/desktop mode, use local state
      setIsOpen(prev => !prev);
    }
  }, [isOpen, isAnimating, isTVProfile, uiState.hamburgerMenuVisible, setHamburgerMenuVisible]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    if (isAnimating) return; // Prevent interaction during animation
    
    if (isTVProfile) {
      setHamburgerMenuVisible(false);
    } else {
      setIsOpen(false);
    }
  }, [isAnimating, isTVProfile, setHamburgerMenuVisible]);

  // Close menu when clicking on a control (better UX on mobile, but keep open on TV)
  const handleControlInteraction = useCallback(() => {
    if (isAnimating) return; // Prevent interaction during animation
    
    if (isMobile && !isTVProfile) {
      setIsOpen(false);
    }
  }, [isMobile, isTVProfile, isAnimating]);

  // Animation event handlers
  const handleAnimationStart = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Let useTVFocusManager handle all focus management
  // No manual focus management needed here since useTVFocusManager handles initialization

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
        } ${isAnimating ? styles.animating : ''}`}
        aria-hidden={!isOpen && !isTVProfile}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
        onTransitionStart={handleAnimationStart}
        onTransitionEnd={handleAnimationEnd}
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
