import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DirectionalArrow } from '../DirectionalArrow';
import { DIRECTIONAL_INPUTS } from '../../../../utils/tvCameraConfig';

describe('DirectionalArrow', () => {
  const defaultProps = {
    direction: DIRECTIONAL_INPUTS.UP as const,
    isActive: false,
    onClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders arrow button with correct symbol', () => {
      render(<DirectionalArrow {...defaultProps} direction={DIRECTIONAL_INPUTS.UP} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('↑');
    });

    it('renders correct symbols for each direction', () => {
      const directions = [
        { direction: DIRECTIONAL_INPUTS.UP, symbol: '↑', testId: 'directional-arrow-up' },
        { direction: DIRECTIONAL_INPUTS.DOWN, symbol: '↓', testId: 'directional-arrow-down' },
        { direction: DIRECTIONAL_INPUTS.LEFT, symbol: '←', testId: 'directional-arrow-left' },
        { direction: DIRECTIONAL_INPUTS.RIGHT, symbol: '→', testId: 'directional-arrow-right' }
      ];

      directions.forEach(({ direction, symbol, testId }) => {
        const { unmount } = render(
          <DirectionalArrow {...defaultProps} direction={direction} />
        );
        
        const button = screen.getByTestId(testId);
        expect(button).toHaveTextContent(symbol);
        
        unmount();
      });
    });

    it('applies custom className when provided', () => {
      render(
        <DirectionalArrow 
          {...defaultProps} 
          className="custom-class" 
        />
      );
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button).toHaveClass('custom-class');
    });

    it('returns null for invalid direction', () => {
      render(
        <DirectionalArrow 
          {...defaultProps} 
          direction={'invalid' as any}
        />
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('applies active class when isActive is true', () => {
      render(<DirectionalArrow {...defaultProps} isActive={true} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button.className).toContain('active');
      expect(button).toHaveAttribute('data-active', 'true');
    });

    it('does not apply active class when isActive is false', () => {
      render(<DirectionalArrow {...defaultProps} isActive={false} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button).not.toHaveClass('active');
      expect(button).toHaveAttribute('data-active', 'false');
    });

    it('defaults to inactive when isActive is not provided', () => {
      render(<DirectionalArrow direction={DIRECTIONAL_INPUTS.UP} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button).not.toHaveClass('active');
      expect(button).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when button is clicked', () => {
      const onClick = vi.fn();
      render(<DirectionalArrow {...defaultProps} onClick={onClick} />);
      
      fireEvent.click(screen.getByTestId('directional-arrow-up'));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw error when onClick is not provided', () => {
      render(<DirectionalArrow {...defaultProps} onClick={undefined} />);
      
      // Should not throw error
      fireEvent.click(screen.getByTestId('directional-arrow-up'));
    });

    it('calls onClick when Enter key is pressed', () => {
      const onClick = vi.fn();
      render(<DirectionalArrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', () => {
      const onClick = vi.fn();
      render(<DirectionalArrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for other keys', () => {
      const onClick = vi.fn();
      render(<DirectionalArrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events properly', () => {
      const onClick = vi.fn();
      render(<DirectionalArrow {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      
      // Test that keyboard events trigger onClick
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for each direction', () => {
      const directions = [
        { direction: DIRECTIONAL_INPUTS.UP, label: 'Navigate North' },
        { direction: DIRECTIONAL_INPUTS.DOWN, label: 'Navigate South' },
        { direction: DIRECTIONAL_INPUTS.LEFT, label: 'Navigate West' },
        { direction: DIRECTIONAL_INPUTS.RIGHT, label: 'Navigate East' }
      ];

      directions.forEach(({ direction, label }) => {
        const { unmount } = render(
          <DirectionalArrow {...defaultProps} direction={direction} />
        );
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', label);
        
        unmount();
      });
    });

    it('has proper data attributes for testing and styling', () => {
      render(<DirectionalArrow {...defaultProps} direction={DIRECTIONAL_INPUTS.UP} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button).toHaveAttribute('data-direction', DIRECTIONAL_INPUTS.UP);
      expect(button).toHaveAttribute('data-active', 'false');
    });

    it('marks symbol as aria-hidden', () => {
      render(<DirectionalArrow {...defaultProps} />);
      
      const symbol = screen.getByText('↑');
      expect(symbol).toHaveAttribute('aria-hidden', 'true');
    });

    it('is focusable and has button role', () => {
      render(<DirectionalArrow {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('CSS Classes', () => {
    it('applies base arrow class', () => {
      render(<DirectionalArrow {...defaultProps} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button.className).toContain('arrow');
    });

    it('applies active class when active', () => {
      render(<DirectionalArrow {...defaultProps} isActive={true} />);
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button.className).toContain('arrow');
      expect(button.className).toContain('active');
    });

    it('applies custom className along with base classes', () => {
      render(
        <DirectionalArrow 
          {...defaultProps} 
          isActive={true}
          className="custom-arrow"
        />
      );
      
      const button = screen.getByTestId('directional-arrow-up');
      expect(button.className).toContain('arrow');
      expect(button.className).toContain('active');
      expect(button.className).toContain('custom-arrow');
    });

    it('symbol has proper CSS class', () => {
      render(<DirectionalArrow {...defaultProps} />);
      
      const symbol = screen.getByText('↑');
      expect(symbol.className).toContain('symbol');
    });
  });
});