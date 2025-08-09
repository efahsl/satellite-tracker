import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceType } from '../../../../state/DeviceContext';
import {
  MobileOnly,
  DesktopOnly,
  TVOnly,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveContainer,
  DeviceStyle,
  ResponsiveSpacing
} from '../ResponsiveLayout';

// Mock the useDevice hook for testing
const mockDeviceContext = {
  state: {
    deviceType: DeviceType.DESKTOP,
    screenWidth: 1024,
    screenHeight: 768,
    isTouchDevice: false,
    orientation: 'landscape' as const
  },
  dispatch: vi.fn(),
  isMobile: false,
  isDesktop: true,
  isTV: false
};

vi.mock('../../../../state/DeviceContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDevice: () => mockDeviceContext
  };
});

describe('ResponsiveLayout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MobileOnly', () => {
    it('should render children when device is mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <MobileOnly>
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileOnly>
      );
      
      expect(screen.getByTestId('mobile-content')).toBeInTheDocument();
    });

    it('should not render children when device is not mobile', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <MobileOnly>
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileOnly>
      );
      
      expect(screen.queryByTestId('mobile-content')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <MobileOnly className="custom-class">
          <div data-testid="mobile-content">Mobile Content</div>
        </MobileOnly>
      );
      
      const container = screen.getByTestId('mobile-content').parentElement;
      expect(container).toHaveClass('mobile-only', 'custom-class');
    });
  });

  describe('DesktopOnly', () => {
    it('should render children when device is desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <DesktopOnly>
          <div data-testid="desktop-content">Desktop Content</div>
        </DesktopOnly>
      );
      
      expect(screen.getByTestId('desktop-content')).toBeInTheDocument();
    });

    it('should not render children when device is not desktop', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <DesktopOnly>
          <div data-testid="desktop-content">Desktop Content</div>
        </DesktopOnly>
      );
      
      expect(screen.queryByTestId('desktop-content')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <DesktopOnly className="custom-class">
          <div data-testid="desktop-content">Desktop Content</div>
        </DesktopOnly>
      );
      
      const container = screen.getByTestId('desktop-content').parentElement;
      expect(container).toHaveClass('desktop-only', 'custom-class');
    });
  });

  describe('TVOnly', () => {
    it('should render children when device is TV', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = false;
      mockDeviceContext.isTV = true;
      
      render(
        <TVOnly>
          <div data-testid="tv-content">TV Content</div>
        </TVOnly>
      );
      
      expect(screen.getByTestId('tv-content')).toBeInTheDocument();
    });

    it('should not render children when device is not TV', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      mockDeviceContext.isTV = false;
      
      render(
        <TVOnly>
          <div data-testid="tv-content">TV Content</div>
        </TVOnly>
      );
      
      expect(screen.queryByTestId('tv-content')).not.toBeInTheDocument();
    });
  });

  describe('ResponsiveGrid', () => {
    it('should apply mobile grid classes when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveGrid mobileColumns={1} desktopColumns={2}>
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-1', 'gap-4');
    });

    it('should apply desktop grid classes when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveGrid mobileColumns={1} desktopColumns={2}>
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-4');
    });

    it('should apply custom gap', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveGrid gap="lg">
          <div data-testid="grid-content">Grid Content</div>
        </ResponsiveGrid>
      );
      
      const container = screen.getByTestId('grid-content').parentElement;
      expect(container).toHaveClass('gap-6');
    });
  });

  describe('ResponsiveFlex', () => {
    it('should apply mobile flex classes when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveFlex mobileDirection="col" desktopDirection="row">
          <div data-testid="flex-content">Flex Content</div>
        </ResponsiveFlex>
      );
      
      const container = screen.getByTestId('flex-content').parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'items-start', 'justify-start', 'gap-4');
    });

    it('should apply desktop flex classes when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveFlex mobileDirection="col" desktopDirection="row">
          <div data-testid="flex-content">Flex Content</div>
        </ResponsiveFlex>
      );
      
      const container = screen.getByTestId('flex-content').parentElement;
      expect(container).toHaveClass('flex', 'flex-row', 'items-start', 'justify-start', 'gap-4');
    });

    it('should apply custom alignment and justification', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveFlex align="center" justify="between">
          <div data-testid="flex-content">Flex Content</div>
        </ResponsiveFlex>
      );
      
      const container = screen.getByTestId('flex-content').parentElement;
      expect(container).toHaveClass('items-center', 'justify-between');
    });
  });

  describe('ResponsiveContainer', () => {
    it('should apply responsive container classes', () => {
      render(
        <ResponsiveContainer maxWidth="lg" padding="md">
          <div data-testid="container-content">Container Content</div>
        </ResponsiveContainer>
      );
      
      const container = screen.getByTestId('container-content').parentElement;
      expect(container).toHaveClass('w-full', 'mx-auto', 'max-w-4xl');
    });

    it('should apply mobile padding when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveContainer padding="md">
          <div data-testid="container-content">Container Content</div>
        </ResponsiveContainer>
      );
      
      const container = screen.getByTestId('container-content').parentElement;
      expect(container).toHaveClass('px-3');
    });

    it('should apply desktop padding when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveContainer padding="md">
          <div data-testid="container-content">Container Content</div>
        </ResponsiveContainer>
      );
      
      const container = screen.getByTestId('container-content').parentElement;
      expect(container).toHaveClass('px-6');
    });
  });

  describe('DeviceStyle', () => {
    it('should apply mobile classes when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      mockDeviceContext.isTV = false;
      
      render(
        <DeviceStyle
          baseClassName="base-class"
          mobileClassName="mobile-class"
          desktopClassName="desktop-class"
        >
          <div data-testid="device-content">Device Content</div>
        </DeviceStyle>
      );
      
      const container = screen.getByTestId('device-content').parentElement;
      expect(container).toHaveClass('base-class', 'mobile-class');
      expect(container).not.toHaveClass('desktop-class');
    });

    it('should apply desktop classes when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      mockDeviceContext.isTV = false;
      
      render(
        <DeviceStyle
          baseClassName="base-class"
          mobileClassName="mobile-class"
          desktopClassName="desktop-class"
        >
          <div data-testid="device-content">Device Content</div>
        </DeviceStyle>
      );
      
      const container = screen.getByTestId('device-content').parentElement;
      expect(container).toHaveClass('base-class', 'desktop-class');
      expect(container).not.toHaveClass('mobile-class');
    });

    it('should apply TV classes when on TV', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = false;
      mockDeviceContext.isTV = true;
      
      render(
        <DeviceStyle
          baseClassName="base-class"
          mobileClassName="mobile-class"
          desktopClassName="desktop-class"
          tvClassName="tv-class"
        >
          <div data-testid="device-content">Device Content</div>
        </DeviceStyle>
      );
      
      const container = screen.getByTestId('device-content').parentElement;
      expect(container).toHaveClass('base-class', 'tv-class');
      expect(container).not.toHaveClass('mobile-class', 'desktop-class');
    });
  });

  describe('ResponsiveSpacing', () => {
    it('should apply mobile spacing when on mobile', () => {
      mockDeviceContext.isMobile = true;
      mockDeviceContext.isDesktop = false;
      
      render(
        <ResponsiveSpacing
          mobilePadding="p-2"
          desktopPadding="p-4"
          mobileMargin="m-1"
          desktopMargin="m-2"
        >
          <div data-testid="spacing-content">Spacing Content</div>
        </ResponsiveSpacing>
      );
      
      const container = screen.getByTestId('spacing-content').parentElement;
      expect(container).toHaveClass('p-2', 'm-1');
      expect(container).not.toHaveClass('p-4', 'm-2');
    });

    it('should apply desktop spacing when on desktop', () => {
      mockDeviceContext.isMobile = false;
      mockDeviceContext.isDesktop = true;
      
      render(
        <ResponsiveSpacing
          mobilePadding="p-2"
          desktopPadding="p-4"
          mobileMargin="m-1"
          desktopMargin="m-2"
        >
          <div data-testid="spacing-content">Spacing Content</div>
        </ResponsiveSpacing>
      );
      
      const container = screen.getByTestId('spacing-content').parentElement;
      expect(container).toHaveClass('p-4', 'm-2');
      expect(container).not.toHaveClass('p-2', 'm-1');
    });
  });
});