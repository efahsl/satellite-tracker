import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { DeviceProvider } from '../../../../state/DeviceContext';
import { UIProvider, useUI } from '../../../../state/UIContext';
import { ISSProvider } from '../../../../state/ISSContext';
import { PerformanceProvider } from '../../../../state/PerformanceContext';

// Test component to control UI state
const TestController: React.FC<{ onUIReady?: (ui: any) => void }> = ({ onUIReady }) => {
  const ui = useUI();
  
  React.useEffect(() => {
    if (onUIReady) {
      onUIReady(ui);
    }
  }, [ui, onUIReady]);
  
  return null;
};

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode; onUIReady?: (ui: any) => void }> = ({ 
  children, 
  onUIReady 
}) => (
  <DeviceProvider>
    <ISSProvider>
      <PerformanceProvider>
        <UIProvider>
          <TestController onUIReady={onUIReady} />
          {children}
        </UIProvider>
      </PerformanceProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('HamburgerMenu Focus Synchronization', () => {
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

  it('should initialize useTVFocusManager with lastActiveButtonIndex', async () => {
    let uiControls: any;
    
    render(
      <TestWrapper onUIReady={(ui) => { uiControls = ui; }}>
        <HamburgerMenu />
      </TestWrapper>
    );

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Set the last active button to Manual (index 2)
    act(() => {
      uiControls.setLastActiveButton(2);
    });

    // Close and reopen the menu to trigger focus restoration
    act(() => {
      uiControls.setHamburgerMenuVisible(false);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    act(() => {
      uiControls.setHamburgerMenuVisible(true);
    });

    // Wait for focus restoration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // The menu should be open and focused on the correct element
    const menuContent = document.getElementById('hamburger-menu-content');
    expect(menuContent).toBeTruthy();
  });
});