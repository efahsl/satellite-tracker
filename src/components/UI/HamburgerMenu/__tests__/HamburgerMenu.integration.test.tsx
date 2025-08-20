import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HamburgerMenu } from '../HamburgerMenu';
import { useDevice } from '../../../../state/DeviceContext';
import { UIProvider } from '../../../../state/UIContext';

// Mock the DeviceContext
vi.mock('../../../../state/DeviceContext');
const mockUseDevice = vi.mocked(useDevice);

// Mock the control components with real focusable buttons
vi.mock('../../../Controls', () => ({
  ISSFollowControls: () => (
    <div data-testid="iss-follow-controls">
      <button data-testid="iss-follow-button">Follow ISS</button>
      <button data-testid="iss-manual-button">Manual</button>
    </div>
  ),
  PerformanceControls: () => (
    <div data-testid="performance-controls">
      <button data-testid="perf-high-button">High Quality</button>
      <button data-testid="perf-low-button">Low Quality</button>
    </div>
  ),
  DisplayControls: () => (
    <div data-testid="display-controls">
      <button data-testid="display-show-button">Show Info</button>
      <button data-testid="display-hide-button">Hide Info</button>
    </div>
  ),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UIProvider>
    {children}
  </UIProvider>
);

describe('HamburgerMenu TV Keyboard Navigation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up TV mode
    mockUseDevice.mockReturnValue({
      isMobile: false,
      isDesktop: false,
      isTVProfile: true,
      screenWidth: 1920,
      screenHeight: 1080,
    });
  });

  afterEach(() => {
    // Clean up any global event listeners
    vi.clearAllMocks();
    cleanup();
  });

  it('should navigate through buttons with arrow keys in TV mode', async () => {
    render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    // Wait for the menu to be rendered and focusable elements to be found
    await waitFor(() => {
      expect(screen.getByTestId('iss-follow-button')).toBeInTheDocument();
    });

    const buttons = [
      screen.getByTestId('iss-follow-button'),
      screen.getByTestId('iss-manual-button'),
      screen.getByTestId('perf-high-button'),
      screen.getByTestId('perf-low-button'),
      screen.getByTestId('display-show-button'),
      screen.getByTestId('display-hide-button'),
    ];

    // Wait a bit for the focus manager to initialize
    await waitFor(() => {
      // The first button should be focused initially
      expect(document.activeElement).toBe(buttons[0]);
    }, { timeout: 200 });

    // Test arrow down navigation
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[1]);
    });

    // Test arrow down navigation again
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[2]);
    });

    // Test arrow up navigation
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[1]);
    });
  });

  it('should stop at boundaries instead of wrapping in TV mode', async () => {
    render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('iss-follow-button')).toBeInTheDocument();
    });

    const buttons = [
      screen.getByTestId('iss-follow-button'),
      screen.getByTestId('iss-manual-button'),
      screen.getByTestId('perf-high-button'),
      screen.getByTestId('perf-low-button'),
      screen.getByTestId('display-show-button'),
      screen.getByTestId('display-hide-button'),
    ];

    // Wait for initial focus
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[0]);
    }, { timeout: 200 });

    // Test boundary behavior: pressing up at first element should stay at first
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[0]); // Should stay at first element
    });

    // Navigate to last element
    for (let i = 0; i < buttons.length - 1; i++) {
      fireEvent.keyDown(document, { key: 'ArrowDown' });
    }
    
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    });

    // Test boundary behavior: pressing down at last element should stay at last
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(document.activeElement).toBe(buttons[buttons.length - 1]); // Should stay at last element
    });
  });

  it('should activate buttons with Enter and Space keys in TV mode', async () => {
    render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('iss-follow-button')).toBeInTheDocument();
    });

    const followButton = screen.getByTestId('iss-follow-button');
    const clickSpy = vi.fn();
    followButton.addEventListener('click', clickSpy);

    // Wait for initial focus
    await waitFor(() => {
      expect(document.activeElement).toBe(followButton);
    }, { timeout: 200 });

    // Test Enter key activation
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // Navigate to next button
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    const manualButton = screen.getByTestId('iss-manual-button');
    const manualClickSpy = vi.fn();
    manualButton.addEventListener('click', manualClickSpy);

    await waitFor(() => {
      expect(document.activeElement).toBe(manualButton);
    });

    // Test Space key activation
    fireEvent.keyDown(document, { key: ' ' });
    expect(manualClickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not interfere with keyboard navigation in non-TV modes', () => {
    // Set up mobile mode
    mockUseDevice.mockReturnValue({
      isMobile: true,
      isDesktop: false,
      isTVProfile: false,
      screenWidth: 375,
      screenHeight: 667,
    });

    render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    // Open the menu manually in mobile mode
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    const followButton = screen.getByTestId('iss-follow-button');

    // Arrow keys should not affect focus in non-TV mode
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    // Focus should not be automatically managed in non-TV mode
    expect(document.activeElement).not.toBe(followButton);
  });

  it('should handle focus properly when switching between TV and non-TV modes', async () => {
    const { rerender } = render(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('iss-follow-button')).toBeInTheDocument();
    });

    const followButton = screen.getByTestId('iss-follow-button');

    // Wait for initial focus in TV mode
    await waitFor(() => {
      expect(document.activeElement).toBe(followButton);
    }, { timeout: 200 });

    // Verify TV mode styling is applied
    const menuContent = screen.getByRole('dialog');
    expect(menuContent.className).toContain('contentTV');

    // Switch to non-TV mode
    mockUseDevice.mockReturnValue({
      isMobile: true,
      isDesktop: false,
      isTVProfile: false,
      screenWidth: 375,
      screenHeight: 667,
    });

    rerender(
      <TestWrapper>
        <HamburgerMenu />
      </TestWrapper>
    );

    // Wait for the component to update to mobile mode
    await waitFor(() => {
      // In non-TV mode, the menu should have mobile styling instead of TV styling
      const updatedMenuContent = screen.getByRole('dialog');
      expect(updatedMenuContent.className).toContain('contentMobile');
      expect(updatedMenuContent.className).not.toContain('contentTV');
    });

    // Verify hamburger button is now visible in mobile mode
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });
});