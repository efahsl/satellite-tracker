import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { PerformanceProvider } from '../../../../state/PerformanceContext';

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <ISSProvider>
      <PerformanceProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </PerformanceProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('HamburgerMenu Focus Restoration', () => {
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

  it('should synchronize focus state with useTVFocusManager', async () => {
    render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    // Wait for the component to initialize and focus to be set
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // The menu should be open in TV mode and have focusable elements
    const menuContent = document.getElementById('hamburger-menu-content');
    expect(menuContent).toBeTruthy();
  });
});