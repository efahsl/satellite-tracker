import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TVCameraControls } from '../TVCameraControls';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { CameraControlsProvider } from '../../../../state/CameraControlsContext';

// Mock the TV camera navigation hook
vi.mock('../../../../hooks/useTVCameraNavigation', () => ({
  useTVCameraNavigation: vi.fn(() => ({
    activeDirection: null,
    pressedDirection: null,
    isZooming: false,
    zoomMode: 'in',
    isControlsEnabled: true,
    directionalInput: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }))
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <UIProvider>
      <ISSProvider>
        <CameraControlsProvider>
          {children}
        </CameraControlsProvider>
      </ISSProvider>
    </UIProvider>
  </DeviceProvider>
);

describe('TVCameraControls Visual Feedback', () => {
  beforeEach(() => {
    // Mock TV profile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    
    // Mock requestAnimationFrame for tests
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
    
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should apply active state styling to directional arrows', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="up"
          pressedDirection={null}
        />
      </TestWrapper>
    );

    const upArrow = container.querySelector('[aria-label="Navigate up"]');
    expect(upArrow?.className).toContain('arrow--active');
    
    const downArrow = container.querySelector('[aria-label="Navigate down"]');
    expect(downArrow?.className).not.toContain('arrow--active');
  });

  it('should apply pressed state styling to directional arrows', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection={null}
          pressedDirection="left"
        />
      </TestWrapper>
    );

    const leftArrow = container.querySelector('[aria-label="Navigate left"]');
    expect(leftArrow?.className).toContain('arrow--pressed');
    
    const rightArrow = container.querySelector('[aria-label="Navigate right"]');
    expect(rightArrow?.className).not.toContain('arrow--pressed');
  });

  it('should apply both active and pressed states simultaneously', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="right"
          pressedDirection="right"
        />
      </TestWrapper>
    );

    const rightArrow = container.querySelector('[aria-label="Navigate right"]');
    expect(rightArrow?.className).toContain('arrow--active');
    expect(rightArrow?.className).toContain('arrow--pressed');
  });

  it('should apply directional-specific active styling', () => {
    const directions = ['up', 'down', 'left', 'right'] as const;
    
    directions.forEach(direction => {
      const { container, unmount } = render(
        <TestWrapper>
          <TVCameraControls 
            visible={true}
            activeDirection={direction}
            pressedDirection={null}
          />
        </TestWrapper>
      );

      const arrow = container.querySelector(`[aria-label="Navigate ${direction}"]`);
      expect(arrow?.className).toContain('arrow--active');
      expect(arrow?.className).toContain(`arrow--${direction}`);
      
      unmount();
    });
  });

  it('should set aria-pressed attribute correctly', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="down"
          pressedDirection={null}
        />
      </TestWrapper>
    );

    const downArrow = container.querySelector('[aria-label="Navigate down"]');
    expect(downArrow).toHaveAttribute('aria-pressed', 'true');
    
    const upArrow = container.querySelector('[aria-label="Navigate up"]');
    expect(upArrow).toHaveAttribute('aria-pressed', 'false');
  });

  it('should handle rapid state changes without visual glitches', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection={null}
          pressedDirection={null}
        />
      </TestWrapper>
    );

    // Simulate rapid key press and release
    rerender(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="up"
          pressedDirection="up"
        />
      </TestWrapper>
    );

    const upArrow = container.querySelector('[aria-label="Navigate up"]');
    expect(upArrow?.className).toContain('arrow--active');
    expect(upArrow?.className).toContain('arrow--pressed');

    // Simulate key release (pressed state cleared, but still active)
    rerender(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="up"
          pressedDirection={null}
        />
      </TestWrapper>
    );

    expect(upArrow?.className).toContain('arrow--active');
    expect(upArrow?.className).not.toContain('arrow--pressed');

    // Simulate complete release
    rerender(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection={null}
          pressedDirection={null}
        />
      </TestWrapper>
    );

    expect(upArrow?.className).not.toContain('arrow--active');
    expect(upArrow?.className).not.toContain('arrow--pressed');
  });

  it('should maintain visual consistency across all arrow directions', () => {
    const directions = ['up', 'down', 'left', 'right'] as const;
    
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="up"
          pressedDirection="left"
        />
      </TestWrapper>
    );

    directions.forEach(direction => {
      const arrow = container.querySelector(`[aria-label="Navigate ${direction}"]`);
      
      // Check that all arrows have consistent base classes
      expect(arrow?.className).toContain('arrow');
      expect(arrow?.className).toContain(`arrow--${direction}`);
      
      // Check specific states
      if (direction === 'up') {
        expect(arrow?.className).toContain('arrow--active');
        expect(arrow?.className).not.toContain('arrow--pressed');
      } else if (direction === 'left') {
        expect(arrow?.className).not.toContain('arrow--active');
        expect(arrow?.className).toContain('arrow--pressed');
      } else {
        expect(arrow?.className).not.toContain('arrow--active');
        expect(arrow?.className).not.toContain('arrow--pressed');
      }
    });
  });

  it('should handle edge case of all directions being active simultaneously', () => {
    // This shouldn't happen in normal usage, but test robustness
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          activeDirection="up" // Only one can be active at a time
          pressedDirection="down" // But pressed can be different
        />
      </TestWrapper>
    );

    const upArrow = container.querySelector('[aria-label="Navigate up"]');
    const downArrow = container.querySelector('[aria-label="Navigate down"]');
    
    expect(upArrow?.className).toContain('arrow--active');
    expect(upArrow?.className).not.toContain('arrow--pressed');
    
    expect(downArrow?.className).not.toContain('arrow--active');
    expect(downArrow?.className).toContain('arrow--pressed');
  });
});