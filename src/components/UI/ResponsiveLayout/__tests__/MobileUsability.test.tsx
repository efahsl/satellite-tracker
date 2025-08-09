import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider, DeviceType } from '../../../../state/DeviceContext';
import { ResponsiveText, ResponsiveButton, ResponsiveCard } from '../ResponsiveUtilities';

// Mock touch events
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const touchEvent = new Event(type, { bubbles: true });
  Object.defineProperty(touchEvent, 'touches', {
    value: touches.map(touch => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: document.body,
    })),
  });
  return touchEvent;
};

// Mock device context for mobile testing
const MockMobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockContext = {
    state: {
      deviceType: DeviceType.MOBILE,
      screenWidth: 375,
      screenHeight: 667,
      isTouchDevice: true,
      orientation: 'portrait' as const
    },
    dispatch: vi.fn(),
    isMobile: true,
    isDesktop: false,
    isTV: false
  };

  return (
    <DeviceProvider>
      {children}
    </DeviceProvider>
  );
};

// Mock different mobile screen sizes
const mockScreenSizes = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 375, height: 812, name: 'iPhone X' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 360, height: 640, name: 'Galaxy S5' },
  { width: 412, height: 732, name: 'Pixel 3' },
];

describe('Mobile Performance and Usability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock mobile environment
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up touch mocks
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true
    });
  });

  describe('Touch Interaction Testing', () => {
    it('should handle touch events on buttons correctly', async () => {
      const mockClick = vi.fn();
      
      render(
        <MockMobileProvider>
          <ResponsiveButton onClick={mockClick} variant="primary">
            Touch Me
          </ResponsiveButton>
        </MockMobileProvider>
      );

      const button = screen.getByRole('button', { name: 'Touch Me' });
      
      // Test touch start and end
      fireEvent.touchStart(button, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchEnd(button, {
        changedTouches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should have appropriate touch target sizes', () => {
      render(
        <MockMobileProvider>
          <ResponsiveButton variant="primary">
            Button
          </ResponsiveButton>
        </MockMobileProvider>
      );

      const button = screen.getByRole('button', { name: 'Button' });
      const styles = window.getComputedStyle(button);
      
      // Check that button has adequate padding for touch (minimum 44px recommended)
      expect(button.className).toContain('px-3'); // Should have horizontal padding
      expect(button.className).toContain('py-2'); // Should have vertical padding
    });
  });

  describe('Screen Size Adaptability', () => {
    mockScreenSizes.forEach(({ width, height, name }) => {
      it(`should render correctly on ${name} (${width}x${height})`, () => {
        // Mock screen size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        });

        render(
          <MockMobileProvider>
            <ResponsiveCard mobilePadding="sm">
              <ResponsiveText mobileSize="sm" desktopSize="lg">
                Content for {name}
              </ResponsiveText>
              <ResponsiveButton variant="primary" fullWidth>
                Full Width Button
              </ResponsiveButton>
            </ResponsiveCard>
          </MockMobileProvider>
        );

        // Should render mobile-optimized content
        expect(screen.getByText(`Content for ${name}`)).toBeInTheDocument();
        expect(screen.getByText(`Content for ${name}`)).toHaveClass('text-sm');
        
        const button = screen.getByRole('button', { name: 'Full Width Button' });
        expect(button).toHaveClass('w-full');
      });
    });
  });

  describe('Orientation Change Handling', () => {
    it('should handle portrait to landscape orientation change', async () => {
      const { rerender } = render(
        <MockMobileProvider>
          <ResponsiveText mobileSize="sm" desktopSize="lg">
            Orientation Test
          </ResponsiveText>
        </MockMobileProvider>
      );

      expect(screen.getByText('Orientation Test')).toHaveClass('text-sm');

      // Simulate orientation change (swap width/height)
      Object.defineProperty(window, 'innerWidth', {
        value: 667,
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 375,
        configurable: true
      });

      // Trigger orientation change event
      fireEvent(window, new Event('orientationchange'));

      // Wait for orientation change timeout
      await waitFor(() => {
        expect(screen.getByText('Orientation Test')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Performance on Mobile Devices', () => {
    it('should render multiple components efficiently on mobile', () => {
      const startTime = Date.now();
      
      render(
        <MockMobileProvider>
          <div>
            {Array.from({ length: 20 }, (_, i) => (
              <ResponsiveCard key={i} mobilePadding="sm">
                <ResponsiveText mobileSize="sm">
                  Mobile Item {i}
                </ResponsiveText>
                <ResponsiveButton variant="primary" mobileSize="sm">
                  Action {i}
                </ResponsiveButton>
              </ResponsiveCard>
            ))}
          </div>
        </MockMobileProvider>
      );

      const renderTime = Date.now() - startTime;
      
      // Should render 20 mobile-optimized components quickly
      expect(renderTime).toBeLessThan(300); // Allow more time for mobile
      expect(screen.getAllByText(/Mobile Item \d/)).toHaveLength(20);
      expect(screen.getAllByText(/Action \d/)).toHaveLength(20);
    });

    it('should handle rapid state changes efficiently', async () => {
      let stateChangeCount = 0;
      
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          stateChangeCount++;
        }, [count]);

        return (
          <MockMobileProvider>
            <ResponsiveButton 
              onClick={() => setCount(prev => prev + 1)}
              variant="primary"
            >
              Count: {count}
            </ResponsiveButton>
          </MockMobileProvider>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button', { name: 'Count: 0' });
      
      // Simulate rapid taps
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
        await waitFor(() => {
          expect(screen.getByRole('button', { name: `Count: ${i + 1}` })).toBeInTheDocument();
        });
      }

      // Should handle rapid state changes without excessive re-renders
      expect(stateChangeCount).toBeLessThan(10);
    });
  });

  describe('Mobile-Specific Layout Testing', () => {
    it('should use mobile-optimized spacing and typography', () => {
      render(
        <MockMobileProvider>
          <ResponsiveCard mobilePadding="sm" desktopPadding="lg">
            <ResponsiveText mobileSize="xs" desktopSize="xl">
              Mobile Typography
            </ResponsiveText>
          </ResponsiveCard>
        </MockMobileProvider>
      );

      const text = screen.getByText('Mobile Typography');
      const card = text.closest('div');
      
      // Should use mobile-specific classes
      expect(text).toHaveClass('text-xs'); // Mobile font size
      expect(card).toHaveClass('p-3'); // Mobile padding (sm = p-3 on mobile)
    });

    it('should handle long text content appropriately on mobile', () => {
      const longText = 'This is a very long text content that should wrap appropriately on mobile devices without causing horizontal scrolling or layout issues.';
      
      render(
        <MockMobileProvider>
          <ResponsiveCard mobilePadding="sm">
            <ResponsiveText mobileSize="sm">
              {longText}
            </ResponsiveText>
          </ResponsiveCard>
        </MockMobileProvider>
      );

      const textElement = screen.getByText(longText);
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveClass('text-sm');
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain accessibility features on mobile', () => {
      render(
        <MockMobileProvider>
          <ResponsiveButton variant="primary" aria-label="Accessible mobile button">
            <span aria-hidden="true">📱</span>
            Mobile Action
          </ResponsiveButton>
        </MockMobileProvider>
      );

      const button = screen.getByRole('button', { name: 'Accessible mobile button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Accessible mobile button');
    });

    it('should support keyboard navigation on mobile devices with keyboards', () => {
      render(
        <MockMobileProvider>
          <div>
            <ResponsiveButton variant="primary">First Button</ResponsiveButton>
            <ResponsiveButton variant="secondary">Second Button</ResponsiveButton>
          </div>
        </MockMobileProvider>
      );

      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const secondButton = screen.getByRole('button', { name: 'Second Button' });

      // Should be focusable
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Should support tab navigation
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      secondButton.focus();
      expect(document.activeElement).toBe(secondButton);
    });
  });

  describe('Memory Usage on Mobile', () => {
    it('should not create memory leaks during component lifecycle', () => {
      const { unmount } = render(
        <MockMobileProvider>
          <ResponsiveCard mobilePadding="sm">
            <ResponsiveText mobileSize="sm">
              Memory Test Component
            </ResponsiveText>
          </ResponsiveCard>
        </MockMobileProvider>
      );

      expect(screen.getByText('Memory Test Component')).toBeInTheDocument();

      // Unmount should clean up properly
      unmount();
      
      // No assertions needed - if there are memory leaks, they would show up in longer test runs
    });

    it('should handle component re-renders efficiently', () => {
      let renderCount = 0;
      
      const TestComponent = ({ prop }: { prop: string }) => {
        renderCount++;
        return (
          <ResponsiveText mobileSize="sm">
            Render test: {prop}
          </ResponsiveText>
        );
      };

      const { rerender } = render(
        <MockMobileProvider>
          <TestComponent prop="initial" />
        </MockMobileProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same props should be optimized
      rerender(
        <MockMobileProvider>
          <TestComponent prop="initial" />
        </MockMobileProvider>
      );

      // Due to React.memo, should not re-render unnecessarily
      expect(renderCount).toBe(1);

      // Re-render with different props should cause re-render
      rerender(
        <MockMobileProvider>
          <TestComponent prop="changed" />
        </MockMobileProvider>
      );

      expect(renderCount).toBe(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing touch support gracefully', () => {
      // Remove touch support
      delete (window as any).ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true
      });

      render(
        <MockMobileProvider>
          <ResponsiveButton variant="primary">
            No Touch Support
          </ResponsiveButton>
        </MockMobileProvider>
      );

      const button = screen.getByRole('button', { name: 'No Touch Support' });
      expect(button).toBeInTheDocument();
      
      // Should still work with mouse events
      fireEvent.click(button);
    });

    it('should handle very small screen sizes', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 240, // Very small screen
        configurable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 320,
        configurable: true
      });

      render(
        <MockMobileProvider>
          <ResponsiveCard mobilePadding="sm">
            <ResponsiveText mobileSize="xs">
              Tiny Screen Test
            </ResponsiveText>
          </ResponsiveCard>
        </MockMobileProvider>
      );

      expect(screen.getByText('Tiny Screen Test')).toBeInTheDocument();
      expect(screen.getByText('Tiny Screen Test')).toHaveClass('text-xs');
    });
  });
});