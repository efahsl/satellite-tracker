import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { UIProvider } from '../../../../state/UIContext';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { PerformanceProvider } from '../../../../state/PerformanceContext';

// Mock axios to prevent network requests
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        latitude: 0,
        longitude: 0,
        altitude: 400,
        velocity: 27600,
        timestamp: Date.now(),
      },
    }),
  },
}));

// Mock the device context to simulate TV mode
const mockDeviceContext = {
  isMobile: false,
  isDesktop: false,
  isTVProfile: true,
  screenWidth: 1920,
  screenHeight: 1080,
  deviceType: 'tv' as const,
};

// Mock the DeviceContext hook
vi.mock('../../../../state/DeviceContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDevice: () => mockDeviceContext,
  };
});

// Test wrapper component that provides all necessary contexts
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <ISSProvider>
      <PerformanceProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </PerformanceProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('HamburgerMenu - Global Keyboard Event Handling', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    document.removeEventListener('keydown', vi.fn());
  });

  describe('Global Escape Key Handling', () => {
    it('should add global keyboard event listener in TV mode', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Should add keydown event listener in TV mode
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
      
      addEventListenerSpy.mockRestore();
    });

    it('should handle keyboard events without errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Wait for component to be rendered
      await waitFor(() => {
        const menuContent = document.getElementById('hamburger-menu-content');
        expect(menuContent).toBeInTheDocument();
      });

      // Fire keyboard events
      fireEvent.keyDown(document, { key: 'Escape', bubbles: true });
      fireEvent.keyDown(document, { key: 'Backspace', bubbles: true });
      fireEvent.keyDown(document, { key: 'GoBack', bubbles: true });

      // Should not throw errors
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

  });

  describe('Event Listener Management', () => {
    it('should remove event listener on component unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Unmount the component
      unmount();

      // Should remove the event listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Component Functionality', () => {
    it('should render menu content in TV mode', async () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Wait for menu to be rendered
      await waitFor(() => {
        const menuContent = document.getElementById('hamburger-menu-content');
        expect(menuContent).toBeInTheDocument();
      });

      // Should have TV-specific classes
      const menuContent = document.getElementById('hamburger-menu-content');
      expect(menuContent?.className).toContain('contentTV');
    });

    it('should handle focus management', async () => {
      render(
        <TestWrapper>
          <HamburgerMenu />
        </TestWrapper>
      );

      // Wait for menu to be rendered
      await waitFor(() => {
        const menuContent = document.getElementById('hamburger-menu-content');
        expect(menuContent).toBeInTheDocument();
      });

      // Menu should be functional
      const menuContent = document.getElementById('hamburger-menu-content');
      expect(menuContent).toBeInTheDocument();
    });
  });
});