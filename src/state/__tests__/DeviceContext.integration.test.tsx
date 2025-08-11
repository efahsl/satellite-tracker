import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeviceProvider, useDevice } from '../DeviceContext';

// Integration test component that uses the DeviceContext
const IntegrationTestComponent: React.FC = () => {
  const { isTVProfile, state } = useDevice();
  
  return (
    <div>
      <div data-testid="integration-tv-profile">{isTVProfile ? 'TV Profile Active' : 'TV Profile Inactive'}</div>
      <div data-testid="integration-width">{state.screenWidth}</div>
    </div>
  );
};

// Mock window dimensions helper
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('DeviceContext Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should provide isTVProfile property through useDevice hook', () => {
    mockWindowDimensions(1920, 1080);
    
    render(
      <DeviceProvider>
        <IntegrationTestComponent />
      </DeviceProvider>
    );

    expect(screen.getByTestId('integration-tv-profile')).toHaveTextContent('TV Profile Active');
    expect(screen.getByTestId('integration-width')).toHaveTextContent('1920');
  });

  it('should work correctly with non-TV profile dimensions', () => {
    mockWindowDimensions(1366, 768);
    
    render(
      <DeviceProvider>
        <IntegrationTestComponent />
      </DeviceProvider>
    );

    expect(screen.getByTestId('integration-tv-profile')).toHaveTextContent('TV Profile Inactive');
    expect(screen.getByTestId('integration-width')).toHaveTextContent('1366');
  });

  it('should handle edge case of exactly 1920px width with different heights', () => {
    const testHeights = [720, 1080, 1440];
    
    testHeights.forEach(height => {
      mockWindowDimensions(1920, height);
      
      const { unmount } = render(
        <DeviceProvider>
          <IntegrationTestComponent />
        </DeviceProvider>
      );

      expect(screen.getByTestId('integration-tv-profile')).toHaveTextContent('TV Profile Active');
      expect(screen.getByTestId('integration-width')).toHaveTextContent('1920');
      
      unmount();
    });
  });
});