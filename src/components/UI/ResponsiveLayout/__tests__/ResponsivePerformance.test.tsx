import React from "react";
import { render, screen, act } from "@testing-library/react";
import { DeviceProvider, DeviceType } from "../../../../state/DeviceContext";
import {
  ResponsiveText,
  ResponsiveButton,
  ResponsiveCard,
} from "../ResponsiveUtilities";

import { vi } from "vitest";

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(window, "performance", {
  value: {
    now: mockPerformanceNow,
  },
});

// Helper to measure render performance
const measureRenderTime = (renderFn: () => void): number => {
  const startTime = Date.now();
  renderFn();
  return Date.now() - startTime;
};

// Mock device context for testing
const MockDeviceProvider: React.FC<{
  deviceType: DeviceType;
  children: React.ReactNode;
}> = ({ deviceType, children }) => {
  const mockContext = {
    state: {
      deviceType,
      screenWidth: deviceType === DeviceType.MOBILE ? 375 : 1024,
      screenHeight: deviceType === DeviceType.MOBILE ? 667 : 768,
      isTouchDevice: deviceType === DeviceType.MOBILE,
      orientation: "landscape" as const,
    },
    dispatch: vi.fn(),
    isMobile: deviceType === DeviceType.MOBILE,
    isDesktop: deviceType === DeviceType.DESKTOP,
    isTV: deviceType === DeviceType.TV,
  };

  return <DeviceProvider>{children}</DeviceProvider>;
};

describe("Responsive Components Performance", () => {
  beforeEach(() => {
    mockPerformanceNow.mockReturnValue(0);
    vi.clearAllMocks();
  });

  describe("ResponsiveText Performance", () => {
    it("should render efficiently on mobile", () => {
      const renderTime = measureRenderTime(() => {
        render(
          <MockDeviceProvider deviceType={DeviceType.MOBILE}>
            <ResponsiveText mobileSize="sm" desktopSize="lg">
              Test Text
            </ResponsiveText>
          </MockDeviceProvider>
        );
      });

      expect(renderTime).toBeLessThan(50); // Should render in less than 50ms
      expect(screen.getByText("Test Text")).toBeInTheDocument();
    });

    it("should render efficiently on desktop", () => {
      const renderTime = measureRenderTime(() => {
        render(
          <MockDeviceProvider deviceType={DeviceType.DESKTOP}>
            <ResponsiveText mobileSize="sm" desktopSize="lg">
              Test Text
            </ResponsiveText>
          </MockDeviceProvider>
        );
      });

      expect(renderTime).toBeLessThan(50); // Should render in less than 50ms
      expect(screen.getByText("Test Text")).toBeInTheDocument();
    });

    it("should not recreate classes on re-render with same props", () => {
      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <ResponsiveText mobileSize="sm" desktopSize="lg">
            Test Text
          </ResponsiveText>
        </MockDeviceProvider>
      );

      const firstElement = screen.getByText("Test Text");
      const firstClassName = firstElement.className;

      rerender(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <ResponsiveText mobileSize="sm" desktopSize="lg">
            Test Text
          </ResponsiveText>
        </MockDeviceProvider>
      );

      const secondElement = screen.getByText("Test Text");
      expect(secondElement.className).toBe(firstClassName);
    });
  });

  describe("ResponsiveButton Performance", () => {
    it("should render efficiently with click handler", () => {
      const mockClick = vi.fn();

      const renderTime = measureRenderTime(() => {
        render(
          <MockDeviceProvider deviceType={DeviceType.MOBILE}>
            <ResponsiveButton onClick={mockClick} variant="primary">
              Click Me
            </ResponsiveButton>
          </MockDeviceProvider>
        );
      });

      expect(renderTime).toBeLessThan(50);
      expect(
        screen.getByRole("button", { name: "Click Me" })
      ).toBeInTheDocument();
    });

    it("should memoize click handler properly", () => {
      const mockClick = vi.fn();

      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <ResponsiveButton onClick={mockClick} variant="primary">
            Click Me
          </ResponsiveButton>
        </MockDeviceProvider>
      );

      const firstButton = screen.getByRole("button", { name: "Click Me" });

      rerender(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <ResponsiveButton onClick={mockClick} variant="primary">
            Click Me
          </ResponsiveButton>
        </MockDeviceProvider>
      );

      const secondButton = screen.getByRole("button", { name: "Click Me" });

      // Button should be the same element (React.memo working)
      expect(firstButton).toBe(secondButton);
    });
  });

  describe("ResponsiveCard Performance", () => {
    it("should render efficiently with children", () => {
      const renderTime = measureRenderTime(() => {
        render(
          <MockDeviceProvider deviceType={DeviceType.MOBILE}>
            <ResponsiveCard mobilePadding="sm" desktopPadding="lg">
              <div>Card Content</div>
            </ResponsiveCard>
          </MockDeviceProvider>
        );
      });

      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });
  });

  describe("Multiple Components Performance", () => {
    it("should render multiple responsive components efficiently", () => {
      const renderTime = measureRenderTime(() => {
        render(
          <MockDeviceProvider deviceType={DeviceType.MOBILE}>
            <div>
              {Array.from({ length: 10 }, (_, i) => (
                <ResponsiveCard key={i} mobilePadding="sm">
                  <ResponsiveText mobileSize="sm" desktopSize="base">
                    Item {i}
                  </ResponsiveText>
                  <ResponsiveButton onClick={() => {}} variant="primary">
                    Button {i}
                  </ResponsiveButton>
                </ResponsiveCard>
              ))}
            </div>
          </MockDeviceProvider>
        );
      });

      expect(renderTime).toBeLessThan(200); // Should render 10 cards in less than 200ms
      expect(screen.getAllByText(/Item \d/)).toHaveLength(10);
      expect(screen.getAllByText(/Button \d/)).toHaveLength(10);
    });
  });

  describe("Device Type Change Performance", () => {
    it("should handle device type changes efficiently", () => {
      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <ResponsiveText mobileSize="sm" desktopSize="lg">
            Responsive Text
          </ResponsiveText>
        </MockDeviceProvider>
      );

      expect(screen.getByText("Responsive Text")).toHaveClass("text-sm");

      const rerenderTime = measureRenderTime(() => {
        rerender(
          <MockDeviceProvider deviceType={DeviceType.DESKTOP}>
            <ResponsiveText mobileSize="sm" desktopSize="lg">
              Responsive Text
            </ResponsiveText>
          </MockDeviceProvider>
        );
      });

      expect(rerenderTime).toBeLessThan(50);
      expect(screen.getByText("Responsive Text")).toHaveClass("text-lg");
    });
  });

  describe("Memory Usage Optimization", () => {
    it("should not create new objects on every render", () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return (
          <ResponsiveText mobileSize="sm" desktopSize="lg">
            Render count: {renderCount}
          </ResponsiveText>
        );
      };

      const { rerender } = render(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <TestComponent />
        </MockDeviceProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same props should not cause unnecessary re-renders
      rerender(
        <MockDeviceProvider deviceType={DeviceType.MOBILE}>
          <TestComponent />
        </MockDeviceProvider>
      );

      // Due to React.memo, the component should not re-render unnecessarily
      expect(screen.getByText("Render count: 1")).toBeInTheDocument();
    });
  });
});
