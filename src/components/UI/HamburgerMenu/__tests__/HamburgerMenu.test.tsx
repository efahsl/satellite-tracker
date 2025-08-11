import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { useDevice } from '../../../../state/DeviceContext';

// Mock the DeviceContext
vi.mock('../../../../state/DeviceContext');
const mockUseDevice = vi.mocked(useDevice);

// Mock the control components
vi.mock('../../../Controls', () => ({
  ISSFollowControls: () => <div data-testid="iss-follow-controls">ISS Follow Controls</div>,
  PerformanceControls: () => <div data-testid="performance-controls">Performance Controls</div>,
  DisplayControls: () => <div data-testid="display-controls">Display Controls</div>,
}));

describe('HamburgerMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TV Mode Detection', () => {
    it('should apply TV-specific classes when isTVProfile is true and hide hamburger button', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
      // Hamburger button should not be rendered in TV mode
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).toBeNull();

      // Menu should be automatically open in TV mode
      const menuContent = screen.getByRole('dialog');
      expect(menuContent.className).toContain('contentTV');
      expect(menuContent.className).not.toContain('contentMobile');
      expect(menuContent.className).toContain('contentOpen');
    });

    it('should apply mobile-specific classes when isMobile is true and isTVProfile is false', () => {
      mockUseDevice.mockReturnValue({
        isMobile: true,
        isDesktop: false,
        isTVProfile: false,
        screenWidth: 375,
        screenHeight: 667,
      });

      render(<HamburgerMenu />);
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = screen.getByRole('dialog');
      expect(menuContent.className).toContain('contentMobile');
      expect(menuContent.className).not.toContain('contentTV');
    });

    it('should apply desktop classes when neither isMobile nor isTVProfile is true', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: true,
        isTVProfile: false,
        screenWidth: 1440,
        screenHeight: 900,
      });

      render(<HamburgerMenu />);
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = screen.getByRole('dialog');
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
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
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
        screenWidth: 375,
        screenHeight: 667,
      });

      render(<HamburgerMenu />);
      
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
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
      // No need to click button in TV mode - menu is auto-open
      expect(screen.getByTestId('iss-follow-controls')).toBeInTheDocument();
      expect(screen.getByTestId('performance-controls')).toBeInTheDocument();
      expect(screen.getByTestId('display-controls')).toBeInTheDocument();
    });

    it('should not auto-close menu when clicking controls in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
      // Menu is auto-open in TV mode
      const menuContent = screen.getByRole('dialog');
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
        screenWidth: 375,
        screenHeight: 667,
      });

      render(<HamburgerMenu />);
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      const menuContent = screen.getByRole('dialog');
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
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
      // No hamburger button in TV mode
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      expect(menuButton).toBeNull();
      
      // Menu should be auto-open with proper ARIA attributes
      const menuContent = screen.getByRole('dialog');
      expect(menuContent).toHaveAttribute('aria-modal', 'true');
      expect(menuContent).toHaveAttribute('aria-label', 'Navigation menu');
      expect(menuContent).toHaveAttribute('aria-hidden', 'false');
    });

    it('should handle keyboard navigation with Escape key in TV mode', () => {
      mockUseDevice.mockReturnValue({
        isMobile: false,
        isDesktop: false,
        isTVProfile: true,
        screenWidth: 1920,
        screenHeight: 1080,
      });

      render(<HamburgerMenu />);
      
      // Menu is auto-open in TV mode
      const menuContent = screen.getByRole('dialog');
      expect(menuContent.className).toContain('contentOpen');

      // Press Escape key - in TV mode this might close the menu temporarily
      fireEvent.keyDown(menuContent.parentElement!, { key: 'Escape' });

      // In TV mode, the menu might close but should still have TV classes
      expect(menuContent.className).toContain('contentTV');
    });
  });
});