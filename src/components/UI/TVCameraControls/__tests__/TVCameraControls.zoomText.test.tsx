import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
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

describe('TVCameraControls Zoom Text', () => {
  beforeEach(() => {
    // Mock TV profile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
  });

  it('should show "Press SELECT for Zoom Mode" when not in zoom mode', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={false}
          activeZoomDirection={null}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Press SELECT for Zoom Mode');
  });

  it('should show "Zoom Mode: UP=In, DOWN=Out, SELECT=Exit" when in zoom mode', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={true}
          activeZoomDirection={null}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Zoom Mode: UP=In, DOWN=Out, SELECT=Exit');
  });

  it('should show "Zooming IN..." when actively zooming in', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={true}
          activeZoomDirection="in"
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Zooming IN...');
  });

  it('should show "Zooming OUT..." when actively zooming out', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={true}
          activeZoomDirection="out"
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Zooming OUT...');
  });

  it('should apply active styling when actively zooming', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={true}
          activeZoomDirection="in"
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.className).toContain('zoomInstructionActive');
  });

  it('should not apply active styling when not actively zooming', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          isInZoomMode={true}
          activeZoomDirection={null}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.className).not.toContain('zoomInstructionActive');
  });
});