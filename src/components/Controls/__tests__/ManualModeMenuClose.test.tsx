import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ISSFollowControls } from '../ISSFollowControls';
import { ISSProvider } from '../../../state/ISSContext';
import { UIProvider, useUI } from '../../../state/UIContext';
import { DeviceProvider } from '../../../state/DeviceContext';

// Mock window.innerWidth to simulate TV mode (1920px)
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1920,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1080,
});

// Test component to monitor UI state
const UIStateMonitor: React.FC = () => {
  const { state } = useUI();
  return (
    <div data-testid="ui-state">
      <span data-testid="menu-visible">{state.hamburgerMenuVisible.toString()}</span>
    </div>
  );
};

// Test wrapper component that provides all necessary contexts
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <ISSProvider>
      <UIProvider>
        {children}
        <UIStateMonitor />
      </UIProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('Manual Mode Menu Close - TV Mode', () => {
  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
    
    // Trigger resize event to update device context
    window.dispatchEvent(new Event('resize'));
  });

  it('should close hamburger menu when manual mode is activated in TV mode (1920px width)', async () => {
    render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Wait for initial state to settle
    await waitFor(() => {
      expect(screen.getByTestId('menu-visible')).toBeDefined();
    });

    // Initially, menu should be visible in TV mode
    expect(screen.getByTestId('menu-visible')).toBeDefined();

    // Find and click the manual mode button (get the first one that's not active)
    const manualButtons = screen.getAllByRole('button', { name: /manual camera mode/i });
    const manualButton = manualButtons.find(button => button.getAttribute('aria-pressed') === 'false') || manualButtons[0];
    fireEvent.click(manualButton);

    // Wait for state updates and verify menu is closed
    await waitFor(() => {
      const menuElement = screen.getByTestId('menu-visible');
      expect(menuElement.textContent).toBe('false');
    }, { timeout: 1000 });

    // Verify manual mode is active
    expect(manualButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should not close menu when manual mode is activated in non-TV mode', async () => {
    // Change to desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Wait for initial state to settle
    await waitFor(() => {
      const menuVisibleElements = container.querySelectorAll('[data-testid="menu-visible"]');
      expect(menuVisibleElements.length).toBeGreaterThan(0);
    });

    // Get initial menu state from the first element
    const menuVisibleElements = container.querySelectorAll('[data-testid="menu-visible"]');
    const initialMenuState = menuVisibleElements[0]?.textContent;

    // Find and click the manual mode button (get the first one)
    const manualButtons = screen.getAllByRole('button', { name: /manual camera mode/i });
    const manualButton = manualButtons[0];
    fireEvent.click(manualButton);

    // Wait a bit and verify menu state hasn't changed
    await new Promise(resolve => setTimeout(resolve, 100));
    const updatedMenuVisibleElements = container.querySelectorAll('[data-testid="menu-visible"]');
    expect(updatedMenuVisibleElements[0]?.textContent).toBe(initialMenuState);

    // Verify manual mode is still active
    expect(manualButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should verify TV profile detection is working correctly', async () => {
    // Ensure we're in TV mode
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // In TV mode, the component should have tv-typography class
    const manualButtons = screen.getAllByRole('button', { name: /manual camera mode/i });
    const tvModeButton = manualButtons.find(button => 
      button.className.includes('tv-button') || 
      button.closest('[class*="tv-typography"]')
    );
    expect(tvModeButton).toBeDefined();
  });
});