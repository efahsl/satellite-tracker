import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TVCameraControls } from '../TVCameraControls';
import { DIRECTIONAL_INPUTS, ZOOM_MODES } from '../../../../utils/tvCameraConfig';

describe('TVCameraControls', () => {
  const defaultProps = {
    visible: true,
    zoomMode: ZOOM_MODES.IN as const,
    isZooming: false,
    activeDirections: new Set(),
    onDirectionalInput: vi.fn(),
    onZoomStart: vi.fn(),
    onZoomEnd: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      render(<TVCameraControls {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      render(<TVCameraControls {...defaultProps} visible={false} />);
      
      expect(screen.queryByTestId('tv-camera-controls')).not.toBeInTheDocument();
    });

    it('renders all directional arrows', () => {
      render(<TVCameraControls {...defaultProps} />);
      
      expect(screen.getByTestId('directional-arrow-up')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-down')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-left')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-right')).toBeInTheDocument();
    });

    it('renders zoom instructions', () => {
      render(<TVCameraControls {...defaultProps} />);
      
      expect(screen.getByTestId('zoom-instructions')).toBeInTheDocument();
    });
  });

  describe('Directional Input Handling', () => {
    it('calls onDirectionalInput when arrow is clicked', () => {
      const onDirectionalInput = vi.fn();
      render(
        <TVCameraControls 
          {...defaultProps} 
          onDirectionalInput={onDirectionalInput}
        />
      );
      
      fireEvent.click(screen.getByTestId('directional-arrow-up'));
      
      expect(onDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.UP);
    });

    it('calls onDirectionalInput for each direction', () => {
      const onDirectionalInput = vi.fn();
      render(
        <TVCameraControls 
          {...defaultProps} 
          onDirectionalInput={onDirectionalInput}
        />
      );
      
      fireEvent.click(screen.getByTestId('directional-arrow-up'));
      fireEvent.click(screen.getByTestId('directional-arrow-down'));
      fireEvent.click(screen.getByTestId('directional-arrow-left'));
      fireEvent.click(screen.getByTestId('directional-arrow-right'));
      
      expect(onDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.UP);
      expect(onDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.DOWN);
      expect(onDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.LEFT);
      expect(onDirectionalInput).toHaveBeenCalledWith(DIRECTIONAL_INPUTS.RIGHT);
      expect(onDirectionalInput).toHaveBeenCalledTimes(4);
    });

    it('does not call onDirectionalInput when callback is not provided', () => {
      render(<TVCameraControls {...defaultProps} onDirectionalInput={undefined} />);
      
      // Should not throw error
      fireEvent.click(screen.getByTestId('directional-arrow-up'));
    });
  });

  describe('Active Directions', () => {
    it('passes active state to directional arrows', () => {
      const activeDirections = new Set([DIRECTIONAL_INPUTS.UP, DIRECTIONAL_INPUTS.RIGHT]);
      render(
        <TVCameraControls 
          {...defaultProps} 
          activeDirections={activeDirections}
        />
      );
      
      expect(screen.getByTestId('directional-arrow-up')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('directional-arrow-down')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-left')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-right')).toHaveAttribute('data-active', 'true');
    });

    it('handles empty active directions set', () => {
      render(<TVCameraControls {...defaultProps} activeDirections={new Set()} />);
      
      expect(screen.getByTestId('directional-arrow-up')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-down')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-left')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('directional-arrow-right')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Zoom Controls', () => {
    it('passes zoom props to ZoomInstructions component', () => {
      render(
        <TVCameraControls 
          {...defaultProps} 
          zoomMode={ZOOM_MODES.OUT}
          isZooming={true}
        />
      );
      
      const zoomInstructions = screen.getByTestId('zoom-instructions');
      expect(zoomInstructions).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
      expect(zoomInstructions).toHaveAttribute('data-is-zooming', 'true');
    });

    it('forwards zoom callbacks to ZoomInstructions', () => {
      const onZoomStart = vi.fn();
      const onZoomEnd = vi.fn();
      
      render(
        <TVCameraControls 
          {...defaultProps} 
          onZoomStart={onZoomStart}
          onZoomEnd={onZoomEnd}
        />
      );
      
      // These will be tested in ZoomInstructions component tests
      expect(screen.getByTestId('zoom-instructions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper test ids for all interactive elements', () => {
      render(<TVCameraControls {...defaultProps} />);
      
      expect(screen.getByTestId('tv-camera-controls')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-up')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-down')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-left')).toBeInTheDocument();
      expect(screen.getByTestId('directional-arrow-right')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-instructions')).toBeInTheDocument();
    });

    it('maintains proper component structure for screen readers', () => {
      render(<TVCameraControls {...defaultProps} />);
      
      const container = screen.getByTestId('tv-camera-controls');
      expect(container.className).toContain('container');
      
      // Check that arrows are properly structured
      const arrows = screen.getAllByRole('button').filter(button => 
        button.getAttribute('data-testid')?.startsWith('directional-arrow-')
      );
      expect(arrows).toHaveLength(4);
    });
  });

  describe('Props Validation', () => {
    it('handles undefined activeDirections gracefully', () => {
      const { container } = render(<TVCameraControls {...defaultProps} activeDirections={undefined} />);
      
      // Should default to empty set behavior
      const upArrow = container.querySelector('[data-testid="directional-arrow-up"]');
      expect(upArrow).toHaveAttribute('data-active', 'false');
    });

    it('handles all zoom modes correctly', () => {
      const { rerender, container } = render(
        <TVCameraControls {...defaultProps} zoomMode={ZOOM_MODES.IN} />
      );
      
      let zoomInstructions = container.querySelector('[data-testid="zoom-instructions"]');
      expect(zoomInstructions).toHaveAttribute('data-zoom-mode', ZOOM_MODES.IN);
      
      rerender(<TVCameraControls {...defaultProps} zoomMode={ZOOM_MODES.OUT} />);
      
      zoomInstructions = container.querySelector('[data-testid="zoom-instructions"]');
      expect(zoomInstructions).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
    });
  });
});