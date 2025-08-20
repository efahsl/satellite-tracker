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

  it('should show "Hold SELECT to Zoom IN" when not zooming and mode is IN', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Hold SELECT to Zoom IN');
  });

  it('should show "Hold SELECT to Zoom OUT" when not zooming and mode is OUT', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="out"
          isZooming={false}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Hold SELECT to Zoom OUT');
  });

  it('should show "Zooming IN..." when actively zooming and mode is OUT (meaning we are zooming in)', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="out" // Mode gets toggled when zoom starts, so OUT means we're zooming IN
          isZooming={true}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Zooming IN...');
  });

  it('should show "Zooming OUT..." when actively zooming and mode is IN (meaning we are zooming out)', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in" // Mode gets toggled when zoom starts, so IN means we're zooming OUT
          isZooming={true}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.textContent).toBe('Zooming OUT...');
  });

  it('should apply active styling when zooming', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="out"
          isZooming={true}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.className).toContain('zoomInstructionActive');
  });

  it('should not apply active styling when not zooming', () => {
    const { container } = render(
      <TestWrapper>
        <TVCameraControls 
          visible={true}
          zoomMode="in"
          isZooming={false}
        />
      </TestWrapper>
    );

    const zoomText = container.querySelector('.tv-camera-controls .zoomInstruction, [class*="zoomInstruction"]');
    expect(zoomText?.className).not.toContain('zoomInstructionActive');
  });
});