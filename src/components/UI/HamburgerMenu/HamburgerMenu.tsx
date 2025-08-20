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
  const tvMenuInitialized = useRef(false);

  // Sync local state with UIContext for TV mode
  useEffect(() => {
    if (isTVProfile) {
      console.log('HamburgerMenu: Syncing state, hamburgerMenuVisible:', uiState.hamburgerMenuVisible, 'isOpen will be set to:', uiState.hamburgerMenuVisible);
      setIsOpen(uiState.hamburgerMenuVisible);
    }
  }, [isTVProfile, uiState.hamburgerMenuVisible]);

  // Debug: Log when isOpen changes
  useEffect(() => {
    console.log('HamburgerMenu: isOpen state changed to:', isOpen);
  }, [isOpen]);

  // Global keyboard event listener for back/escape key menu reopening in TV mode
  useEffect(() => {
    if (!isTVProfile) return; // Only add listener in TV mode

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Handle back button (Android TV) and Escape key
      if (event.key === 'Escape' || event.key === 'Backspace' || event.key === 'GoBack') {
        // Only reopen menu if it's currently closed
        if (!uiState.hamburgerMenuVisible) {
          console.log('Global key pressed to reopen menu:', event.key);
          event.preventDefault();
          event.stopPropagation();
          setHamburgerMenuVisible(true);
        }
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleGlobalKeyDown, true);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [isTVProfile, uiState.hamburgerMenuVisible, setHamburgerMenuVisible]);

  // Auto-open menu when TV profile is first detected (only once)
  useEffect(() => {
    if (isTVProfile && !tvMenuInitialized.current) {
      tvMenuInitialized.current = true;
      if (uiState.hamburgerMenuVisible === false) {
        setHamburgerMenuVisible(true);
      }
    }
  }, [isTVProfile, setHamburgerMenuVisible, uiState.hamburgerMenuVisible]);

  // Update focusable elements when menu opens/closes or content changes
  useEffect(() => {
    if (isTVProfile && isOpen && menuContentRef.current) {
      const elements = findFocusableElements(menuContentRef.current);
      setFocusableElements(elements);
      
      // When menu reopens, focus the last active button or first button as fallback
      if (elements.length > 0) {
        setTimeout(() => {
          // Use lastActiveButtonIndex if it's valid, otherwise use first element
          const targetIndex = (uiState.lastActiveButtonIndex >= 0 && uiState.lastActiveButtonIndex < elements.length) 
            ? uiState.lastActiveButtonIndex 
            : 0;
          console.log('HamburgerMenu: Focusing element at index', targetIndex, 'after menu reopen (lastActive:', uiState.lastActiveButtonIndex, ')');
          // Use focusElement from useTVFocusManager to ensure internal state is updated
          focusElement(targetIndex);
        }, 100); // Small delay to ensure menu is visible
      }
    } else {
      setFocusableElements([]);
    }
  }, [isTVProfile, isOpen, uiState.lastActiveButtonIndex]);

  // TV focus manager for keyboard navigation
  const { currentFocusIndex, focusElement } = useTVFocusManager({
    isEnabled: isTVProfile && isOpen,
    focusableElements,
    onEscape: () => {
      // In TV mode, escape key should not close the menu since it's persistent
      // This is handled by the global back/escape key listener for menu reopening
    },
    initialFocusIndex: uiState.lastActiveButtonIndex >= 0 ? uiState.lastActiveButtonIndex : 0
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
        className={`${styles.content} ${isOpen ? styles.contentOpen : ''} ${
          isTVProfile ? styles.contentTV : 
          isMobile ? styles.contentMobile : ''
        } ${isAnimating ? styles.animating : ''}`}
        aria-hidden={!isOpen}
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
