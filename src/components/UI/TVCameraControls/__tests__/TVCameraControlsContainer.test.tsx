import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TVCameraControlsContainer } from '../TVCameraControlsContainer';
import { useDevice } from '../../../../state/DeviceContext';
import { useUI } from '../../../../state/UIContext';
import { useISS } from '../../../../state/ISSContext';
import { useTVCameraNavigation } from '../../../../hooks/useTVCameraNavigation';
import { DIRECTIONAL_INPUTS, ZOOM_MODES } from '../../../../utils/tvCameraConfig';

// Mock the context hooks and navigation hook
vi.mock('../../../../state/DeviceContext');
vi.mock('../../../../state/UIContext');
vi.mock('../../../../state/ISSContext');
vi.mock('../../../../hooks/useTVCameraNavigation');

const mockUseDevice = vi.mocked(useDevice);
const mockUseUI = vi.mocked(useUI);
const mockUseISS = vi.mocked(useISS);
const mockUseTVCameraNavigation = vi.mocked(useTVCameraNavigation);

describe('TVCameraControlsContainer', () => {
  const mockSetTVCameraControlsVisible = vi.fn();
  const mockOnDirectionalInput = vi.fn();
  const mockOnZoomStart = vi.fn();
  const mockOnZoomEnd = vi.fn();
  const mockOnZoomModeChange = vi.fn();

  // Mock navigation hook callbacks
  const mockNavigationCallbacks = {
    onDirectionalInput: vi.fn(),
    onZoomStart: vi.fn(),
    onZoomEnd: vi.fn(),
    onZoomModeChange: vi.fn()
  };

  const defaultProps = {
    onDirectionalInput: mockOnDirectionalInput,
    onZoomStart: mockOnZoomStart,
    onZoomEnd: mockOnZoomEnd,
    onZoomModeChange: mockOnZoomModeChange
  };

  // Default mock values
  const defaultDeviceState = {
    isTVProfile: true
  };

  const defaultUIState = {
    state: {
      hamburgerMenuVisible: false,
      tvCameraControlsVisible: true,
      zoomMode: ZOOM_MODES.IN as const,
      isZooming: false
    },
    setTVCameraControlsVisible: mockSetTVCameraControlsVisible
  };

  const defaultISSState = {
    state: {
      followISS: false,
      earthRotateMode: false
    }
  };

  const defaultNavigationState = {
    state: {
      activeDirections: new Set([DIRECTIONAL_INPUTS.UP]),
      isZooming: false,
      zoomMode: ZOOM_MODES.IN as const,
      isEnabled: true
    },
    callbacks: mockNavigationCallbacks,
    keyAcceleration: {},
    clearAllInputs: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mocks
    mockUseDevice.mockReturnValue(defaultDeviceState as any);
    mockUseUI.mockReturnValue(defaultUIState as any);
    mockUseISS.mockReturnValue(defaultISSState as any);
    mockUseTVCameraNavigation.mockReturnValue(defaultNavigationState as any);
  });

  afterEach(() => {
    cleanup();
  });

  describe('TV Profile Detection', () => {
    it('renders controls when in TV profile', () => {
      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });

    it('does not render when not in TV profile', () => {
      mockUseDevice.mockReturnValue({
        ...defaultDeviceState,
        isTVProfile: false
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.queryByTestId('tv-camera-controls')).not.toBeInTheDocument();
    });

    it('calls setTVCameraControlsVisible based on navigation hook state', () => {
      mockUseTVCameraNavigation.mockReturnValue({
        ...defaultNavigationState,
        state: {
          ...defaultNavigationState.state,
          isEnabled: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation Hook Integration', () => {
    it('uses navigation hook state for visibility', () => {
      mockUseTVCameraNavigation.mockReturnValue({
        ...defaultNavigationState,
        state: {
          ...defaultNavigationState.state,
          isEnabled: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('passes external callbacks to navigation hook', () => {
      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockUseTVCameraNavigation).toHaveBeenCalledWith({
        onDirectionalInput: mockOnDirectionalInput,
        onZoomStart: mockOnZoomStart,
        onZoomEnd: mockOnZoomEnd,
        onZoomModeChange: mockOnZoomModeChange
      });
    });

    it('uses navigation hook callbacks for TVCameraControls', () => {
      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
      // The component should use the navigation hook's callbacks, not the external ones directly
    });
  });

  describe('Visibility Management', () => {
    it('shows controls when navigation hook is enabled', () => {
      mockUseTVCameraNavigation.mockReturnValue({
        ...defaultNavigationState,
        state: {
          ...defaultNavigationState.state,
          isEnabled: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
    });

    it('hides controls when navigation hook is disabled', () => {
      mockUseTVCameraNavigation.mockReturnValue({
        ...defaultNavigationState,
        state: {
          ...defaultNavigationState.state,
          isEnabled: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards navigation hook state to TVCameraControls component', () => {
      const activeDirections = new Set([DIRECTIONAL_INPUTS.UP, DIRECTIONAL_INPUTS.RIGHT]);
      
      mockUseTVCameraNavigation.mockReturnValue({
        ...defaultNavigationState,
        state: {
          activeDirections,
          isZooming: true,
          zoomMode: ZOOM_MODES.OUT,
          isEnabled: true
        }
      } as any);

      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          tvCameraControlsVisible: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      const controls = screen.getByTestId('tv-camera-controls');
      expect(controls).toBeInTheDocument();
      
      // Check that zoom mode is forwarded from navigation hook
      const zoomInstructions = screen.getByTestId('zoom-instructions');
      expect(zoomInstructions).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
      expect(zoomInstructions).toHaveAttribute('data-is-zooming', 'true');
      
      // Check that active directions are forwarded from navigation hook
      expect(screen.getByTestId('directional-arrow-up')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('directional-arrow-right')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('directional-arrow-down')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-left')).toHaveAttribute('data-active', 'false');
    });

    it('forwards navigation hook callbacks to TVCameraControls', () => {
      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
      
      // The navigation hook callbacks should be used, not the external props directly
      expect(mockUseTVCameraNavigation).toHaveBeenCalledWith({
        onDirectionalInput: mockOnDirectionalInput,
        onZoomStart: mockOnZoomStart,
        onZoomEnd: mockOnZoomEnd,
        onZoomModeChange: mockOnZoomModeChange
      });
    });
  });

  describe('Rendering', () => {
    it('renders controls when visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          tvCameraControlsVisible: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });

    it('does not render controls when not visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          tvCameraControlsVisible: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(screen.queryByTestId('tv-camera-controls')).not.toBeInTheDocument();
    });
  });
});