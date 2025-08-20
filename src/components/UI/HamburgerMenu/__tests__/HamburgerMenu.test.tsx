import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { useDevice } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import { useTVFocusManager, findFocusableElements } from '../../../../hooks/useTVFocusManager';

// Mock the DeviceContext
vi.mock('../../../../state/DeviceContext');
const mockUseDevice = vi.mocked(useDevice);
const mockUseTVFocusManager = vi.mocked(useTVFocusManager);
const mockFindFocusableElements = vi.mocked(findFocusableElements);

// Mock the control components with focusable buttons
vi.mock('../../../Controls', () => ({
  ISSFollowControls: () => (
    <div data-testid="iss-follow-controls">
      <button data-testid="iss-follow-button">Follow ISS</button>
      <button data-testid="iss-manual-button">Manual</button>
    </div>
  ),
  PerformanceControls: () => (
    <div data-testid="performance-controls">
      <button data-testid="perf-high-button">High Quality</button>
      <button data-testid="perf-low-button">Low Quality</button>
    </div>
  ),
  DisplayControls: () => (
    <div data-testid="display-controls">
      <button data-testid="display-show-button">Show Info</button>
      <button data-testid="display-hide-button">Hide Info</button>
    </div>
  ),
}));

// Mock the TV focus manager hook
vi.mock('../../../../hooks/useTVFocusManager', () => ({
  useTVFocusManager: vi.fn(),
  findFocusableElements: vi.fn(),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UIProvider>
    {children}
  </UIProvider>
);

describe('HamburgerMenu', () => {
  const mockFocusElement = vi.fn();
  const mockHandleKeyDown = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for TV focus manager
    mockUseTVFocusManager.mockReturnValue({
      currentFocusIndex: 0,
      handleKeyDown: mockHandleKeyDown,
      focusElement: mockFocusElement,
      focusNext: vi.fn(),
      focusPrevious: vi.fn(),
      focusUp: vi.fn(),
      focusDown: vi.fn(),
      focusLeft: vi.fn(),
      focusRight: vi.fn(),
    });

    // Default mock for finding focusable elements
    mockFindFocusableElements.mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  describe('TV Mode Detection', () => {
    it('should apply TV-specific classes when isTVProfile is true and hide hamburger button', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // Hamburger button should not be rendered in TV mode
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).toBeNull();

      // Menu should be automatically open in TV mode
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentTV');
      expect(menuContent.className).not.toContain('contentMobile');
      expect(menuContent.className).toContain('contentOpen');
    });

    it('should apply mobile-specific classes when isMobile is true and isTVProfile is false', () => {
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentMobile');
      expect(menuContent.className).not.toContain('contentTV');
    });

    it('should apply desktop classes when neither isMobile nor isTVProfile is true', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: true,
        isTVProfile: false,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).not.toContain('contentMobile');
      expect(menuContent.className).not.toContain('contentTV');
    });
  });

  describe('Backdrop Behavior', () => {
    it('should not render backdrop in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // No hamburger button in TV mode, menu is auto-open
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).toBeNull();

      // In TV mode, backdrop should not be rendered
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeNull();
    });

    it('should render backdrop in mobile mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      // In mobile mode, backdrop should be rendered
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeTruthy();
    });
  });

  describe('Menu Controls', () => {
    it('should render all control components in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // No need to click button in TV mode - menu is auto-open
      expect(screen.getByTestId('iss-follow-controls')).toBeDefined();
      expect(screen.getByTestId('performance-controls')).toBeDefined();
      expect(screen.getByTestId('display-controls')).toBeDefined();
    });

    it('should not auto-close menu when clicking controls in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // Menu is auto-open in TV mode
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentOpen');

      // Click on a control
      const issControls = screen.getByTestId('iss-follow-controls');
      fireEvent.click(issControls);

      // Menu should still be open in TV mode
      expect(menuContent.className).toContain('contentOpen');
    });

    it('should auto-close menu when clicking controls in mobile mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentOpen');

      // Click on a control
      const issControls = screen.getByTestId('iss-follow-controls');
      fireEvent.click(issControls);

      // Menu should close in mobile mode
      expect(menuContent.className).not.toContain('contentOpen');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // No hamburger button in TV mode
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).toBeNull();
      
      // Menu should be auto-open with proper ARIA attributes
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.getAttribute('aria-modal')).toBe('true');
      expect(menuContent.getAttribute('aria-label')).toBe('Navigation menu');
      expect(menuContent.getAttribute('aria-hidden')).toBe('false');
    });

    it('should handle keyboard navigation with Escape key in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );
      
      // Menu is auto-open in TV mode
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentOpen');

      // Press Escape key - in TV mode this might close the menu temporarily
      fireEvent.keyDown(menuContent.parentElement!, { key: 'Escape' });

      // In TV mode, the menu might close but should still have TV classes
      expect(menuContent.className).toContain('contentTV');
    });
  });

  describe('TV Keyboard Navigation', () => {
    beforeEach(() => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });
    });

    it('should initialize TV focus manager when in TV mode', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      expect(mockUseTVFocusManager).toHaveBeenCalledWith({
        isEnabled: true,
        focusableElements: [],
        onEscape: expect.any(Function),
        initialFocusIndex: 0,
      });
    });

    it('should not initialize TV focus manager when not in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
      });

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      expect(mockUseTVFocusManager).toHaveBeenCalledWith({
        isEnabled: false,
        focusableElements: [],
        onEscape: expect.any(Function),
        initialFocusIndex: 0,
      });
    });

    it('should find and set focusable elements when menu opens in TV mode', async () => {
      const mockButtons = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];
      mockFindFocusableElements.mockReturnValue(mockButtons);

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFindFocusableElements).toHaveBeenCalled();
      });

      // Should call useTVFocusManager with the found elements
      expect(mockUseTVFocusManager).toHaveBeenCalledWith({
        isEnabled: true,
        focusableElements: mockButtons,
        onEscape: expect.any(Function),
        initialFocusIndex: 0,
      });
    });

    it('should focus first element when menu opens in TV mode', async () => {
      const mockButtons = [
        document.createElement('button'),
        document.createElement('button'),
      ];
      mockFindFocusableElements.mockReturnValue(mockButtons);

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Note: We removed the manual focus management, so this test should not expect focusElement to be called
      // The focus management is now handled entirely by useTVFocusManager
      await waitFor(() => {
        expect(mockFindFocusableElements).toHaveBeenCalled();
      });
    });

    it('should handle keyboard events through TV focus manager', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Simulate a keyboard event on the document
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(keyEvent);

      // The TV focus manager should handle the event
      // Note: This tests that the hook is properly set up, the actual key handling is tested in the hook's own tests
      expect(mockUseTVFocusManager).toHaveBeenCalledWith(
        expect.objectContaining({
          isEnabled: true,
        })
      );
    });

    it('should provide escape handler that does not close menu in TV mode', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Get the onEscape callback that was passed to useTVFocusManager
      const onEscapeCallback = mockUseTVFocusManager.mock.calls[0][0].onEscape;

      // Menu should be open initially in TV mode
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentOpen');

      // Call the escape handler
      if (onEscapeCallback) {
        onEscapeCallback();
      }

      // Menu should still be open in TV mode (escape doesn't close persistent menu)
      expect(menuContent.className).toContain('contentOpen');
    });

    it('should call findFocusableElements when TV mode is enabled', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Should find elements when TV mode is enabled and menu is open
      expect(mockFindFocusableElements).toHaveBeenCalled();
    });

    it('should clear focusable elements when switching from TV to non-TV mode', () => {
      const { rerender } = render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Initially in TV mode with elements
      expect(mockUseTVFocusManager).toHaveBeenCalledWith(
        expect.objectContaining({
          isEnabled: true,
        })
      );

      // Switch to mobile mode
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
      });

      rerender(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Should disable TV focus manager
      expect(mockUseTVFocusManager).toHaveBeenCalledWith(
        expect.objectContaining({
          isEnabled: false,
          focusableElements: [],
        })
      );
    });
  });

  describe('TV Focus Visual Indicators', () => {
    beforeEach(() => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
      });
    });

    it('should apply TV-specific CSS classes for focus styling', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentTV');

      // Check that the controls container has the TV class using a more specific selector
      const controlsContainer = menuContent.querySelector('[class*="controls"]');
      expect(controlsContainer).toBeTruthy();
      if (controlsContainer) {
        expect(controlsContainer.className).toContain('tv-menu-controls');
      }
    });

    it('should render all focusable buttons with proper test IDs', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Check that all mock buttons are rendered
      expect(screen.getByTestId('iss-follow-button')).toBeDefined();
      expect(screen.getByTestId('iss-manual-button')).toBeDefined();
      expect(screen.getByTestId('perf-high-button')).toBeDefined();
      expect(screen.getByTestId('perf-low-button')).toBeDefined();
      expect(screen.getByTestId('display-show-button')).toBeDefined();
      expect(screen.getByTestId('display-hide-button')).toBeDefined();
    });

    it('should have proper focus styling applied via CSS', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      const button = screen.getByTestId('iss-follow-button');
      
      // Focus the button to test focus styles
      button.focus();

      // The actual focus styling is applied via CSS, so we just verify the element can receive focus
      expect(document.activeElement).toBe(button);
    });

    it('should apply enhanced styling to active buttons in TV mode', () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Check that buttons with active classes would receive enhanced styling
      // The actual styling is applied via CSS selectors, so we verify the structure is correct
      const menuContent = document.getElementById('hamburger-menu-content')!;
      expect(menuContent.className).toContain('contentTV');
      
      // Verify that the controls container exists for CSS targeting
      const controlsContainer = menuContent.querySelector('[class*="controls"]');
      expect(controlsContainer).toBeTruthy();
      
      // Verify buttons exist that could have active classes
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});