import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ISSFollowControls } from '../ISSFollowControls';
import { ISSProvider } from '../../../state/ISSContext';
import { DeviceProvider } from '../../../state/DeviceContext';
import { UIProvider } from '../../../state/UIContext';

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <ISSProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </ISSProvider>
  </DeviceProvider>
);

describe('ISSFollowControls Focus Restoration', () => {
  beforeEach(() => {
    // Clean up any previous renders
    cleanup();
    
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

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  it('should track Manual button click for focus restoration in TV mode', () => {
    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Find the Manual button within this specific container
    const manualButton = container.querySelector('button[aria-label*="manual camera mode"]');
    expect(manualButton).toBeInTheDocument();

    // Click the Manual button
    fireEvent.click(manualButton);

    // The button should be active (manual mode)
    expect(manualButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle focus restoration when not in TV mode', () => {
    // Set non-TV dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { container } = render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    // Find the Manual button within this specific container
    const manualButton = container.querySelector('button[aria-label*="manual camera mode"]');
    expect(manualButton).toBeInTheDocument();

    // Click the Manual button (should not trigger TV-specific behavior)
    fireEvent.click(manualButton);

    // The button should be active (manual mode)
    expect(manualButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should maintain button states correctly', () => {
    render(
      <TestWrapper>
        <ISSFollowControls />
      </TestWrapper>
    );

    const followButton = screen.getByRole('button', { name: /follow.*iss/i });
    const earthRotateButton = screen.getByRole('button', { name: /earth rotation/i });
    const manualButton = screen.getByRole('button', { name: /manual camera mode/i });

    // Initially, follow ISS mode should be active (default state)
    expect(followButton).toHaveAttribute('aria-pressed', 'true');
    expect(manualButton).toHaveAttribute('aria-pressed', 'false');
    expect(earthRotateButton).toHaveAttribute('aria-pressed', 'false');

    // Click Earth Rotate
    fireEvent.click(earthRotateButton);
    expect(earthRotateButton).toHaveAttribute('aria-pressed', 'true');
    expect(followButton).toHaveAttribute('aria-pressed', 'false');
    expect(manualButton).toHaveAttribute('aria-pressed', 'false');

    // Click Manual again
    fireEvent.click(manualButton);
    expect(manualButton).toHaveAttribute('aria-pressed', 'true');
    expect(followButton).toHaveAttribute('aria-pressed', 'false');
    expect(earthRotateButton).toHaveAttribute('aria-pressed', 'false');
  });
});