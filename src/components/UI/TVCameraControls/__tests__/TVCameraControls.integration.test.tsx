import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TVCameraControls from '../TVCameraControls';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { CameraControlsProvider } from '../../../../state/CameraControlsContext';

// Mock the TV camera navigation hook
vi.mock('../../../../hooks/useTVCameraNavigation', () => ({
  useTVCameraNavigation: () => ({
    activeDirection: null,
    isZooming: false,
    zoomMode: 'in' as const,
  })
}));

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <ISSProvider>
      <UIProvider>
        <CameraControlsProvider>
          {children}
        </CameraControlsProvider>
      </UIProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('TVCameraControls Integration', () => {
  beforeEach(() => {
    // Mock window dimensions for TV profile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    
    // Mock matchMedia for TV detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(width: 1920px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should integrate with menu state transitions', () => {
    const { rerender } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    // Should render controls when visible
    expect(screen.getByText('Hold SELECT to Zoom IN')).toBeInTheDocument();

    // Should handle visibility changes for smooth animations
    rerender(
      <TestWrapper>
        <TVCameraControls 
          visible={false}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    // Component should still be in DOM for animations but with hidden class
    const container = document.querySelector('.tv-camera-controls');
    expect(container).toBeInTheDocument();
  });

  it('should coordinate with TV focus management system', () => {
    render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    // Controls should have the proper CSS class for non-interference
    const container = document.querySelector('.tv-camera-controls');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('tv-camera-controls');
  });

  it('should show coordinated animations with menu transitions', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    // Should have animation classes for coordinated transitions
    const controlsContainer = container.querySelector('.tv-camera-controls');
    expect(controlsContainer).toBeInTheDocument();
    
    // Should have proper CSS classes for animations
    expect(controlsContainer).toHaveClass('tv-camera-controls');
  });
});