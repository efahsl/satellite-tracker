import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CameraControls from '../CameraControls';

// Mock the device hook
vi.mock('../../../../state/DeviceContext', () => ({
  useDevice: vi.fn(),
}));

// Mock the UI hook  
vi.mock('../../../../state/UIContext', () => ({
  useUI: vi.fn(),
}));

// Import the mocked hooks
import { useDevice } from '../../../../state/DeviceContext';
import { useUI } from '../../../../state/UIContext';

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
    
    // Setup default mocks
    (useDevice as any).mockReturnValue({
      isMobile: false,
      isDesktop: false,
      isTVProfile: true,
      screenWidth: 1920,
      screenHeight: 1080,
      deviceType: 'tv',
    });

    (useUI as any).mockReturnValue({
      state: {
        cameraControlsVisible: true,
        isZoomingIn: true,
      },
    });
  });

  it('renders camera controls when visible in TV mode', () => {
    render(<CameraControls {...mockProps} />);

    // Check for directional labels
    expect(screen.getByText('NORTH')).toBeInTheDocument();
    expect(screen.getByText('EAST')).toBeInTheDocument();
    expect(screen.getByText('SOUTH')).toBeInTheDocument();
    expect(screen.getByText('WEST')).toBeInTheDocument();

    // Check for zoom instructions
    expect(screen.getByText('Hold SELECT to Zoom IN')).toBeInTheDocument();
    expect(screen.getByText('SELECT')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    const { container } = render(<CameraControls {...mockProps} isVisible={false} />);

    // Component should return null and not render anything
    expect(container.firstChild).toBeNull();
  });

  it('does not render when not in TV mode', () => {
    (useDevice as any).mockReturnValue({
      isMobile: false,
      isDesktop: true,
      isTVProfile: false,
      screenWidth: 1024,
      screenHeight: 768,
      deviceType: 'desktop',
    });

    const { container } = render(<CameraControls {...mockProps} />);

    // Component should return null when not in TV mode
    expect(container.firstChild).toBeNull();
  });

  it('shows correct zoom text based on zoom mode', () => {
    const { rerender } = render(<CameraControls {...mockProps} isZoomingIn={true} />);

    expect(screen.getAllByText('Hold SELECT to Zoom IN')[0]).toBeInTheDocument();

    rerender(<CameraControls {...mockProps} isZoomingIn={false} />);

    expect(screen.getByText('Hold SELECT to Zoom OUT')).toBeInTheDocument();
  });
});