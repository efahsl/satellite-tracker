import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import { ISSFollowControls } from '../ISSFollowControls';
import { ISSProvider } from '../../../state/ISSContext';
import { UIProvider, useUI } from '../../../state/UIContext';
import { DeviceProvider } from '../../../state/DeviceContext';

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
    // Clean up any previous renders
    cleanup();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  it('should close hamburger menu when manual mode is activated in TV mode (1920px width)', async () => {
    // Mock window dimensions for TV mode
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
    window.dispatchEvent(new Event('resize'));

    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Wait for initial state to settle
    await waitFor(() => {
      const menuVisible = container.querySelector('[data-testid="menu-visible"]');
      expect(menuVisible).toBeTruthy();
    });

    // Initially, menu should be visible in TV mode
    const menuVisibleElement = container.querySelector('[data-testid="menu-visible"]');
    expect(menuVisibleElement?.textContent).toBe('true');

    // Find and click the manual mode button
    const manualButton = screen.getByRole('button', { name: /manual camera mode/i });
    fireEvent.click(manualButton);

    // Wait for state updates and verify menu is closed
    await waitFor(() => {
      const updatedMenuVisible = container.querySelector('[data-testid="menu-visible"]');
      expect(updatedMenuVisible?.textContent).toBe('false');
    }, { timeout: 1000 });

    // Verify manual mode is active
    expect(manualButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should not close menu when manual mode is activated in non-TV mode', async () => {
    // Mock window dimensions for desktop mode
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Wait for initial state to settle
    await waitFor(() => {
      const menuVisible = container.querySelector('[data-testid="menu-visible"]');
      expect(menuVisible).toBeTruthy();
    });

    // Get initial menu state
    const menuVisibleElement = container.querySelector('[data-testid="menu-visible"]');
    const initialMenuState = menuVisibleElement?.textContent;

    // Find and click the manual mode button
    const manualButton = screen.getByRole('button', { name: /manual camera mode/i });
    fireEvent.click(manualButton);

    // Wait a bit and verify menu state hasn't changed
    await new Promise(resolve => setTimeout(resolve, 100));
    const updatedMenuVisible = container.querySelector('[data-testid="menu-visible"]');
    expect(updatedMenuVisible?.textContent).toBe(initialMenuState);

    // Verify manual mode is still active
    expect(manualButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('should verify TV profile detection is working correctly', async () => {
    // Mock window dimensions for TV mode
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
    window.dispatchEvent(new Event('resize'));

    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Wait for component to render
    await waitFor(() => {
      const manualButton = screen.queryByRole('button', { name: /manual camera mode/i });
      expect(manualButton).toBeTruthy();
    });

    // In TV mode, the component should have tv-typography class
    const issFollowControlsContainer = container.querySelector('[class*="issFollowControls"]');
    expect(issFollowControlsContainer?.className).toContain('tv-typography');
  });
});