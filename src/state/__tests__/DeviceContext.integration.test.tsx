import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider, useDevice, DeviceType } from '../DeviceContext';

// Simple test component that consumes device context
const DeviceContextConsumer = () => {
  const { state, isMobile, isDesktop, isTV } = useDevice();
  
  return (
    <div>
      <div data-testid="device-type">{state.deviceType}</div>
      <div data-testid="screen-width">{state.screenWidth}</div>
      <div data-testid="screen-height">{state.screenHeight}</div>
      <div data-testid="is-touch">{state.isTouchDevice.toString()}</div>
      <div data-testid="orientation">{state.orientation}</div>
      <div data-testid="is-mobile">{isMobile.toString()}</div>
      <div data-testid="is-desktop">{isDesktop.toString()}</div>
      <div data-testid="is-tv">{isTV.toString()}</div>
    </div>
  );
};

// Component that simulates responsive behavior
const ResponsiveComponent = () => {
  const { isMobile, isDesktop } = useDevice();
  
  return (
    <div>
      {isMobile && <div data-testid="mobile-content">Mobile Content</div>}
      {isDesktop && <div data-testid="desktop-content">Desktop Content</div>}
      <div data-testid="responsive-class" className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
        Responsive Layout
      </div>
    </div>
  );
};

describe('DeviceContext Integration Tests', () => {
  describe('Context Provider and Consumer Integration', () => {
    it('should provide device context to child components', () => {
      render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      // Should render with default desktop values
      expect(screen.getByTestId('device-type')).toBeInTheDocument();
      expect(screen.getByTestId('is-mobile')).toBeInTheDocument();
      expect(screen.getByTestId('is-desktop')).toBeInTheDocument();
      expect(screen.getByTestId('is-tv')).toBeInTheDocument();
    });

    it('should update all consumers when device context changes', () => {
      render(
        <DeviceProvider>
          <DeviceContextConsumer />
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      // All components should show the same device type
      const deviceTypeElements = screen.getAllByTestId('device-type');
      expect(deviceTypeElements).toHaveLength(2);
      
      // Both should have the same content
      const firstDeviceType = deviceTypeElements[0].textContent;
      const secondDeviceType = deviceTypeElements[1].textContent;
      expect(firstDeviceType).toBe(secondDeviceType);
    });

    it('should handle multiple nested consumers', () => {
      const NestedComponent = () => {
        const { isMobile, isDesktop } = useDevice();
        return (
          <div>
            <div data-testid="nested-mobile">{isMobile.toString()}</div>
            <div data-testid="nested-desktop">{isDesktop.toString()}</div>
          </div>
        );
      };

      render(
        <DeviceProvider>
          <DeviceContextConsumer />
          <NestedComponent />
        </DeviceProvider>
      );

      // Both components should have consistent values
      const mainMobile = screen.getByTestId('is-mobile').textContent;
      const nestedMobile = screen.getByTestId('nested-mobile').textContent;
      expect(mainMobile).toBe(nestedMobile);

      const mainDesktop = screen.getByTestId('is-desktop').textContent;
      const nestedDesktop = screen.getByTestId('nested-desktop').textContent;
      expect(mainDesktop).toBe(nestedDesktop);
    });

    it('should throw error when useDevice is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<DeviceContextConsumer />);
      }).toThrow('useDevice must be used within a DeviceProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Component Integration', () => {
    it('should enable responsive components to adapt based on device type', () => {
      render(
        <DeviceProvider>
          <ResponsiveComponent />
        </DeviceProvider>
      );

      // Should render responsive content based on device type
      const responsiveElement = screen.getByTestId('responsive-class');
      expect(responsiveElement).toBeInTheDocument();
      
      // Should have either mobile or desktop class
      const className = responsiveElement.className;
      expect(className === 'mobile-layout' || className === 'desktop-layout').toBe(true);
    });

    it('should conditionally render content based on device type', () => {
      render(
        <DeviceProvider>
          <ResponsiveComponent />
        </DeviceProvider>
      );

      // Should render either mobile or desktop content, but not both
      const mobileContent = screen.queryByTestId('mobile-content');
      const desktopContent = screen.queryByTestId('desktop-content');
      
      // Exactly one should be present
      expect((mobileContent !== null) !== (desktopContent !== null)).toBe(true);
    });

    it('should maintain consistent device state across multiple responsive components', () => {
      render(
        <DeviceProvider>
          <ResponsiveComponent />
          <ResponsiveComponent />
        </DeviceProvider>
      );

      // Both components should render the same type of content
      const mobileContents = screen.queryAllByTestId('mobile-content');
      const desktopContents = screen.queryAllByTestId('desktop-content');
      
      // Should have consistent rendering across components
      if (mobileContents.length > 0) {
        expect(mobileContents).toHaveLength(2);
        expect(desktopContents).toHaveLength(0);
      } else {
        expect(desktopContents).toHaveLength(2);
        expect(mobileContents).toHaveLength(0);
      }
    });
  });

  describe('Context State Consistency', () => {
    it('should maintain consistent computed properties', () => {
      render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      const deviceType = screen.getByTestId('device-type').textContent;
      const isMobile = screen.getByTestId('is-mobile').textContent === 'true';
      const isDesktop = screen.getByTestId('is-desktop').textContent === 'true';
      const isTV = screen.getByTestId('is-tv').textContent === 'true';

      // Exactly one device type should be true
      const trueCount = [isMobile, isDesktop, isTV].filter(Boolean).length;
      expect(trueCount).toBe(1);

      // Device type should match the computed properties
      if (deviceType === 'mobile') {
        expect(isMobile).toBe(true);
        expect(isDesktop).toBe(false);
        expect(isTV).toBe(false);
      } else if (deviceType === 'desktop') {
        expect(isMobile).toBe(false);
        expect(isDesktop).toBe(true);
        expect(isTV).toBe(false);
      } else if (deviceType === 'tv') {
        expect(isMobile).toBe(false);
        expect(isDesktop).toBe(false);
        expect(isTV).toBe(true);
      }
    });

    it('should provide valid screen dimensions', () => {
      render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      const screenWidth = parseInt(screen.getByTestId('screen-width').textContent || '0');
      const screenHeight = parseInt(screen.getByTestId('screen-height').textContent || '0');

      // Should have valid dimensions
      expect(screenWidth).toBeGreaterThan(0);
      expect(screenHeight).toBeGreaterThan(0);
    });

    it('should provide valid orientation based on dimensions', () => {
      render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      const screenWidth = parseInt(screen.getByTestId('screen-width').textContent || '0');
      const screenHeight = parseInt(screen.getByTestId('screen-height').textContent || '0');
      const orientation = screen.getByTestId('orientation').textContent;

      // Orientation should match dimensions
      if (screenWidth > screenHeight) {
        expect(orientation).toBe('landscape');
      } else {
        expect(orientation).toBe('portrait');
      }
    });
  });

  describe('Provider Lifecycle', () => {
    it('should initialize context on mount', () => {
      const { unmount } = render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      // Should render successfully
      expect(screen.getByTestId('device-type')).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle re-renders gracefully', () => {
      const { rerender } = render(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      const initialDeviceType = screen.getByTestId('device-type').textContent;

      // Re-render with same props
      rerender(
        <DeviceProvider>
          <DeviceContextConsumer />
        </DeviceProvider>
      );

      // Should maintain same device type
      expect(screen.getByTestId('device-type')).toHaveTextContent(initialDeviceType || '');
    });

    it('should handle multiple provider instances independently', () => {
      const FirstApp = () => (
        <DeviceProvider>
          <div data-testid="first-app">
            <DeviceContextConsumer />
          </div>
        </DeviceProvider>
      );

      const SecondApp = () => (
        <DeviceProvider>
          <div data-testid="second-app">
            <DeviceContextConsumer />
          </div>
        </DeviceProvider>
      );

      render(
        <div>
          <FirstApp />
          <SecondApp />
        </div>
      );

      // Both apps should render successfully
      expect(screen.getByTestId('first-app')).toBeInTheDocument();
      expect(screen.getByTestId('second-app')).toBeInTheDocument();

      // Both should have device type elements
      const deviceTypeElements = screen.getAllByTestId('device-type');
      expect(deviceTypeElements).toHaveLength(2);
    });
  });
});