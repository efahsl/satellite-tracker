import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TVCameraControlsContainer } from '../TVCameraControlsContainer';
import { useDevice } from '../../../../state/DeviceContext';
import { useUI } from '../../../../state/UIContext';
import { useISS } from '../../../../state/ISSContext';
import { DIRECTIONAL_INPUTS, ZOOM_MODES } from '../../../../utils/tvCameraConfig';

// Mock the context hooks
vi.mock('../../../../state/DeviceContext');
vi.mock('../../../../state/UIContext');
vi.mock('../../../../state/ISSContext');

const mockUseDevice = vi.mocked(useDevice);
const mockUseUI = vi.mocked(useUI);
const mockUseISS = vi.mocked(useISS);

describe('TVCameraControlsContainer', () => {
  const mockSetTVCameraControlsVisible = vi.fn();
  const mockOnDirectionalInput = vi.fn();
  const mockOnZoomStart = vi.fn();
  const mockOnZoomEnd = vi.fn();

  const defaultProps = {
    activeDirections: new Set([DIRECTIONAL_INPUTS.UP]),
    onDirectionalInput: mockOnDirectionalInput,
    onZoomStart: mockOnZoomStart,
    onZoomEnd: mockOnZoomEnd
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

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mocks
    mockUseDevice.mockReturnValue(defaultDeviceState as any);
    mockUseUI.mockReturnValue(defaultUIState as any);
    mockUseISS.mockReturnValue(defaultISSState as any);
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

    it('calls setTVCameraControlsVisible with false when not TV profile', () => {
      mockUseDevice.mockReturnValue({
        ...defaultDeviceState,
        isTVProfile: false
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Hamburger Menu Visibility Logic', () => {
    it('hides controls when hamburger menu is visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: true,
          tvCameraControlsVisible: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      // Controls should not be rendered when visible is false
      expect(screen.queryByTestId('tv-camera-controls')).not.toBeInTheDocument();
    });

    it('shows controls when hamburger menu is hidden', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: false,
          tvCameraControlsVisible: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      // Controls should be rendered when visible is true
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });

    it('calls setTVCameraControlsVisible with false when menu is visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Manual Mode Requirement', () => {
    it('hides controls when following ISS', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: true,
          earthRotateMode: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('hides controls when in Earth rotate mode', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: false,
          earthRotateMode: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('hides controls when both ISS follow and Earth rotate are active', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: true,
          earthRotateMode: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('shows controls when in manual mode (neither ISS follow nor Earth rotate)', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: false,
          earthRotateMode: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('Combined Visibility Logic', () => {
    it('shows controls when all conditions are met', () => {
      // TV profile + menu hidden + manual mode
      mockUseDevice.mockReturnValue({
        isTVProfile: true
      } as any);
      
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: false,
          tvCameraControlsVisible: true
        }
      } as any);
      
      mockUseISS.mockReturnValue({
        state: {
          followISS: false,
          earthRotateMode: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });

    it('hides controls when any condition fails - not TV profile', () => {
      mockUseDevice.mockReturnValue({
        isTVProfile: false
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
      expect(screen.queryByTestId('tv-camera-controls')).not.toBeInTheDocument();
    });

    it('hides controls when any condition fails - menu visible', () => {
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: true
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('hides controls when any condition fails - not manual mode', () => {
      mockUseISS.mockReturnValue({
        state: {
          followISS: true,
          earthRotateMode: false
        }
      } as any);

      render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Props Forwarding', () => {
    it('forwards all props to TVCameraControls component', () => {
      const activeDirections = new Set([DIRECTIONAL_INPUTS.UP, DIRECTIONAL_INPUTS.RIGHT]);
      
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          zoomMode: ZOOM_MODES.OUT,
          isZooming: true,
          tvCameraControlsVisible: true
        }
      } as any);

      render(
        <TVCameraControlsContainer 
          activeDirections={activeDirections}
          onDirectionalInput={mockOnDirectionalInput}
          onZoomStart={mockOnZoomStart}
          onZoomEnd={mockOnZoomEnd}
        />
      );
      
      const controls = screen.getByTestId('tv-camera-controls');
      expect(controls).toBeInTheDocument();
      
      // Check that zoom mode is forwarded
      const zoomInstructions = screen.getByTestId('zoom-instructions');
      expect(zoomInstructions).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
      expect(zoomInstructions).toHaveAttribute('data-is-zooming', 'true');
      
      // Check that active directions are forwarded
      expect(screen.getByTestId('directional-arrow-up')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('directional-arrow-right')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('directional-arrow-down')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-left')).toHaveAttribute('data-active', 'false');
    });

    it('handles undefined activeDirections gracefully', () => {
      render(
        <TVCameraControlsContainer 
          onDirectionalInput={mockOnDirectionalInput}
          onZoomStart={mockOnZoomStart}
          onZoomEnd={mockOnZoomEnd}
        />
      );
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
      
      // All arrows should be inactive
      expect(screen.getByTestId('directional-arrow-up')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-down')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-left')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-right')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('State Updates', () => {
    it('updates visibility when device profile changes', () => {
      const { rerender } = render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
      
      // Change to non-TV profile
      mockUseDevice.mockReturnValue({
        isTVProfile: false
      } as any);
      
      rerender(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('updates visibility when hamburger menu state changes', () => {
      const { rerender } = render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
      
      // Show hamburger menu
      mockUseUI.mockReturnValue({
        ...defaultUIState,
        state: {
          ...defaultUIState.state,
          hamburgerMenuVisible: true
        }
      } as any);
      
      rerender(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });

    it('updates visibility when ISS mode changes', () => {
      const { rerender } = render(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(true);
      
      // Enable ISS follow mode
      mockUseISS.mockReturnValue({
        state: {
          followISS: true,
          earthRotateMode: false
        }
      } as any);
      
      rerender(<TVCameraControlsContainer {...defaultProps} />);
      
      expect(mockSetTVCameraControlsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Callback Handling', () => {
    it('does not call callbacks when not provided', () => {
      render(
        <TVCameraControlsContainer 
          activeDirections={new Set([DIRECTIONAL_INPUTS.UP])}
        />
      );
      
      // Should not throw error
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });
  });
});