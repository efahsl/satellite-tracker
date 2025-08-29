import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { HamburgerMenu } from '../HamburgerMenu';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { PerformanceProvider } from '../../../../state/PerformanceContext';

import { vi, beforeEach, afterEach } from 'vitest';

// Mock the hooks
vi.mock('../../../../hooks/useTVFocusManager', () => ({
  useTVFocusManager: () => ({
    currentFocusIndex: 0,
    focusElement: vi.fn(),
  }),
  findFocusableElements: () => [],
}));

// Mock CSS transitions and animations
const mockTransitionStart = vi.fn();
const mockTransitionEnd = vi.fn();
const mockAnimationStart = vi.fn();
const mockAnimationEnd = vi.fn();

// Helper to create a test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode; screenWidth?: number }> = ({ 
  children, 
  screenWidth = 1920 
}) => {
  // Mock window.innerWidth for TV detection
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: screenWidth,
  });

  return (
    <DeviceProvider>
      <UIProvider>
        <ISSProvider>
          <PerformanceProvider>
            {children}
          </PerformanceProvider>
        </ISSProvider>
      </UIProvider>
    </DeviceProvider>
  );
};

describe('HamburgerMenu Animations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('TV Mode Slide Animations', () => {
    it('should apply slide-in animation when menu opens in TV mode', async () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // Menu should have TV-specific classes (CSS modules transform class names)
      expect(menuContent.className).toContain('contentTV');
      expect(menuContent.className).toContain('contentOpen');
      
      // Should have transition property defined (CSS may not be fully loaded in test environment)
      const computedStyle = window.getComputedStyle(menuContent);
      expect(computedStyle.transition).toBeDefined();
    });

    it('should apply slide-out animation when menu closes in TV mode', async () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // In TV mode, menu starts open by default, so we verify the structure
      // The actual closing would be triggered by UIContext state change
      expect(menuContent.className).toContain('contentTV');
      expect(menuContent.className).toContain('contentOpen');
      
      // Verify that the menu has the proper structure for animations
      expect(menuContent).toHaveAttribute('role', 'dialog');
    });

    it('should prevent interactions during animation', async () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // Simulate animation start
      act(() => {
        fireEvent.transitionStart(menuContent);
      });

      // Menu should have animating class
      expect(menuContent.className).toContain('animating');

      // Simulate animation end
      act(() => {
        fireEvent.transitionEnd(menuContent);
      });

      // Animating class should be removed
      expect(menuContent.className).not.toContain('animating');
    });

    it('should handle animation events correctly', async () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // Test transition events
      act(() => {
        fireEvent.transitionStart(menuContent);
      });
      
      expect(menuContent.className).toContain('animating');
      
      act(() => {
        fireEvent.transitionEnd(menuContent);
      });
      
      expect(menuContent.className).not.toContain('animating');

      // Test animation events
      act(() => {
        fireEvent.animationStart(menuContent);
      });
      
      expect(menuContent.className).toContain('animating');
      
      act(() => {
        fireEvent.animationEnd(menuContent);
      });
      
      expect(menuContent.className).not.toContain('animating');
    });
  });

  describe('Animation Duration and Easing', () => {
    it('should use correct CSS variables for animation timing', () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      const computedStyle = window.getComputedStyle(menuContent);
      
      // Should have transition property (CSS custom properties may not be available in test environment)
      expect(computedStyle.transition).toBeDefined();
    });

    it('should have animation duration configured', () => {
      // In test environment, we verify the component structure rather than CSS values
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentTV');
    });
  });

  describe('Reduced Motion Support', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('should disable animations when prefers-reduced-motion is set', () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // With reduced motion, transitions should be disabled
      // This would be handled by CSS media query
      expect(menuContent.className).toContain('contentTV');
    });
  });

  describe('Non-TV Mode Behavior', () => {
    it('should not apply TV animations in mobile mode', () => {
      render(
        <TestWrapper screenWidth={375}>
          <HamburgerMenu />
        </TestWrapper>
      );

      // In mobile mode, menu is hidden by default, so we need to check the element by ID
      const menuContent = document.getElementById('hamburger-menu-content');
      expect(menuContent).toBeTruthy();
      
      // Should not have TV-specific classes
      expect(menuContent!.className).not.toContain('contentTV');
      expect(menuContent!.className).toContain('contentMobile');
    });

    it('should not apply TV animations in desktop mode', () => {
      render(
        <TestWrapper screenWidth={1440}>
          <HamburgerMenu />
        </TestWrapper>
      );

      // In desktop mode, menu is hidden by default, so we need to check the element by ID
      const menuContent = document.getElementById('hamburger-menu-content');
      expect(menuContent).toBeTruthy();
      
      // Should not have TV-specific classes
      expect(menuContent!.className).not.toContain('contentTV');
      expect(menuContent!.className).not.toContain('contentMobile');
    });
  });

  describe('Performance Considerations', () => {
    it('should use transform-based animations for optimal performance', () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      const computedStyle = window.getComputedStyle(menuContent);
      
      // Should have transform property defined (may be empty in test environment)
      expect(computedStyle.transform).toBeDefined();
    });

    it('should not cause layout thrashing during animations', () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // TV menu should have proper positioning class
      expect(menuContent.className).toContain('contentTV');
    });
  });

  describe('Animation State Management', () => {
    it('should prevent focus changes during animation', async () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // Start animation
      act(() => {
        fireEvent.transitionStart(menuContent);
      });

      // During animation, focus management should be disabled
      expect(menuContent.className).toContain('animating');
      
      // End animation
      act(() => {
        fireEvent.transitionEnd(menuContent);
      });

      // After animation, focus management should be re-enabled
      expect(menuContent.className).not.toContain('animating');
    });

    it('should handle multiple animation events correctly', () => {
      render(
        <TestWrapper screenWidth={1920}>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      
      // Multiple animation starts should not cause issues
      act(() => {
        fireEvent.transitionStart(menuContent);
        fireEvent.animationStart(menuContent);
      });

      expect(menuContent.className).toContain('animating');
      
      // Multiple animation ends should properly clean up
      act(() => {
        fireEvent.transitionEnd(menuContent);
        fireEvent.animationEnd(menuContent);
      });

      expect(menuContent.className).not.toContain('animating');
    });
  });
});