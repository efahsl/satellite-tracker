import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ZoomInstructions } from '../ZoomInstructions';
import { ZOOM_MODES } from '../../../../utils/tvCameraConfig';

describe('ZoomInstructions', () => {
  const defaultProps = {
    zoomMode: ZOOM_MODES.IN as const,
    isZooming: false,
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
    it('renders zoom instructions button', () => {
      render(<ZoomInstructions {...defaultProps} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('displays correct text for zoom in mode', () => {
      render(<ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.IN} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveTextContent('Hold SELECT to Zoom IN');
    });

    it('displays correct text for zoom out mode', () => {
      render(<ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.OUT} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveTextContent('Hold SELECT to Zoom OUT');
    });

    it('shows zoom indicator when zooming', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={true} />);
      
      const indicator = screen.getByText('●');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not show zoom indicator when not zooming', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={false} />);
      
      const indicator = screen.queryByText('●');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Zoom State', () => {
    it('applies zooming class when isZooming is true', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={true} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button.className).toContain('zooming');
    });

    it('does not apply zooming class when isZooming is false', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={false} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button.className).not.toContain('zooming');
    });

    it('has correct data attributes', () => {
      render(
        <ZoomInstructions 
          {...defaultProps} 
          zoomMode={ZOOM_MODES.OUT}
          isZooming={true}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
      expect(button).toHaveAttribute('data-is-zooming', 'true');
    });
  });

  describe('Click Handling', () => {
    it('calls onZoomStart when not zooming and button is clicked', () => {
      const onZoomStart = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={false}
          onZoomStart={onZoomStart}
        />
      );
      
      fireEvent.click(screen.getByTestId('zoom-instructions'));
      
      expect(onZoomStart).toHaveBeenCalledTimes(1);
    });

    it('calls onZoomEnd when zooming and button is clicked', () => {
      const onZoomEnd = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={true}
          onZoomEnd={onZoomEnd}
        />
      );
      
      fireEvent.click(screen.getByTestId('zoom-instructions'));
      
      expect(onZoomEnd).toHaveBeenCalledTimes(1);
    });

    it('does not call callbacks when they are not provided', () => {
      render(
        <ZoomInstructions 
          zoomMode={ZOOM_MODES.IN}
          isZooming={false}
          onZoomStart={undefined}
          onZoomEnd={undefined}
        />
      );
      
      // Should not throw error
      fireEvent.click(screen.getByTestId('zoom-instructions'));
    });
  });

  describe('Keyboard Handling', () => {
    it('calls onZoomStart when Enter key is pressed and not zooming', () => {
      const onZoomStart = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={false}
          onZoomStart={onZoomStart}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onZoomStart).toHaveBeenCalledTimes(1);
    });

    it('calls onZoomEnd when Enter key is pressed and zooming', () => {
      const onZoomEnd = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={true}
          onZoomEnd={onZoomEnd}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onZoomEnd).toHaveBeenCalledTimes(1);
    });

    it('calls onZoomStart when Space key is pressed and not zooming', () => {
      const onZoomStart = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={false}
          onZoomStart={onZoomStart}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onZoomStart).toHaveBeenCalledTimes(1);
    });

    it('calls onZoomEnd when Space key is pressed and zooming', () => {
      const onZoomEnd = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          isZooming={true}
          onZoomEnd={onZoomEnd}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onZoomEnd).toHaveBeenCalledTimes(1);
    });

    it('does not call callbacks for other keys', () => {
      const onZoomStart = vi.fn();
      const onZoomEnd = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          onZoomStart={onZoomStart}
          onZoomEnd={onZoomEnd}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(onZoomStart).not.toHaveBeenCalled();
      expect(onZoomEnd).not.toHaveBeenCalled();
    });

    it('handles keyboard events properly', () => {
      const onZoomStart = vi.fn();
      const onZoomEnd = vi.fn();
      render(
        <ZoomInstructions 
          {...defaultProps} 
          onZoomStart={onZoomStart}
          onZoomEnd={onZoomEnd}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      
      // Test that keyboard events trigger callbacks
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onZoomStart).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label based on zoom mode', () => {
      const { rerender } = render(
        <ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.IN} />
      );
      
      let button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveAttribute('aria-label', 'Hold SELECT to Zoom IN');
      
      rerender(<ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.OUT} />);
      
      button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveAttribute('aria-label', 'Hold SELECT to Zoom OUT');
    });

    it('is focusable and has button role', () => {
      render(<ZoomInstructions {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('has proper data attributes for testing', () => {
      render(
        <ZoomInstructions 
          {...defaultProps} 
          zoomMode={ZOOM_MODES.OUT}
          isZooming={true}
        />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button).toHaveAttribute('data-zoom-mode', ZOOM_MODES.OUT);
      expect(button).toHaveAttribute('data-is-zooming', 'true');
    });
  });

  describe('CSS Classes', () => {
    it('applies base instructions class', () => {
      render(<ZoomInstructions {...defaultProps} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button.className).toContain('instructions');
    });

    it('applies zooming class when zooming', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={true} />);
      
      const button = screen.getByTestId('zoom-instructions');
      expect(button.className).toContain('instructions');
      expect(button.className).toContain('zooming');
    });

    it('text has proper CSS class', () => {
      render(<ZoomInstructions {...defaultProps} />);
      
      const text = screen.getByText('Hold SELECT to Zoom IN');
      expect(text.className).toContain('text');
    });

    it('indicator has proper CSS class when present', () => {
      render(<ZoomInstructions {...defaultProps} isZooming={true} />);
      
      const indicator = screen.getByText('●');
      expect(indicator.className).toContain('indicator');
    });
  });

  describe('Text Updates', () => {
    it('updates text when zoom mode changes', () => {
      const { rerender } = render(
        <ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.IN} />
      );
      
      expect(screen.getByText('Hold SELECT to Zoom IN')).toBeInTheDocument();
      
      rerender(<ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.OUT} />);
      
      expect(screen.getByText('Hold SELECT to Zoom OUT')).toBeInTheDocument();
      expect(screen.queryByText('Hold SELECT to Zoom IN')).not.toBeInTheDocument();
    });

    it('maintains consistent structure across zoom mode changes', () => {
      const { rerender } = render(
        <ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.IN} />
      );
      
      const button = screen.getByTestId('zoom-instructions');
      const initialClasses = button.className;
      
      rerender(<ZoomInstructions {...defaultProps} zoomMode={ZOOM_MODES.OUT} />);
      
      expect(button.className).toBe(initialClasses);
    });
  });
});