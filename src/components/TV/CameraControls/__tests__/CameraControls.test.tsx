import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import CameraControls from '../CameraControls';

// Mock the device context to simulate TV mode
const mockDeviceContext = {
  isMobile: false,
  isDesktop: false,
  isTVProfile: true,
  screenWidth: 1920,
  screenHeight: 1080,
  deviceType: 'tv' as const,
};

// Mock the UI context
const mockUIContext = {
  state: {
    cameraControlsVisible: true,
    isZoomingIn: true,
  },
};

// Mock the device hook
vi.mock('../../../../state/DeviceContext', () => ({
  useDevice: () => mockDeviceContext,
  DeviceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the UI hook
vi.mock('../../../../state/UIContext', () => ({
  useUI: () => mockUIContext,
  UIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CameraControls', () => {
  const mockProps = {
    isVisible: true,
    onDirectionalMove: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    isZoomingIn: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders camera controls when visible in TV mode', () => {
    render(
      <DeviceProvider>
        <UIProvider>
          <CameraControls {...mockProps} />
        </UIProvider>
      </DeviceProvider>
    );

    // Check for directional labels
    expect(screen.getByText('NORTH')).toBeDefined();
    expect(screen.getByText('EAST')).toBeDefined();
    expect(screen.getByText('SOUTH')).toBeDefined();
    expect(screen.getByText('WEST')).toBeDefined();

    // Check for zoom instructions
    expect(screen.getByText('Hold SELECT to Zoom IN')).toBeDefined();
    expect(screen.getByText('SELECT')).toBeDefined();
  });

  it('does not render when not visible', () => {
    render(
      <DeviceProvider>
        <UIProvider>
          <CameraControls {...mockProps} isVisible={false} />
        </UIProvider>
      </DeviceProvider>
    );

    expect(screen.queryByText('NORTH')).toBeNull();
  });

  it('shows correct zoom text based on zoom mode', () => {
    const { rerender } = render(
      <DeviceProvider>
        <UIProvider>
          <CameraControls {...mockProps} isZoomingIn={true} />
        </UIProvider>
      </DeviceProvider>
    );

    expect(screen.getByText('Hold SELECT to Zoom IN')).toBeDefined();

    rerender(
      <DeviceProvider>
        <UIProvider>
          <CameraControls {...mockProps} isZoomingIn={false} />
        </UIProvider>
      </DeviceProvider>
    );

    expect(screen.getByText('Hold SELECT to Zoom OUT')).toBeDefined();
  });
});