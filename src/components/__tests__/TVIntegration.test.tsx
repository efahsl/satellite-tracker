import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DeviceProvider } from '../../state/DeviceContext';
import MainLayout from '../../layouts/MainLayout';
import { BrowserRouter } from 'react-router-dom';
import { ISSProvider } from '../../state/ISSContext';
import { UIProvider } from '../../state/UIContext';
import { PerformanceProvider } from '../../state/PerformanceContext';

// Mock window dimensions
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

// Test wrapper with all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <DeviceProvider>
        <UIProvider>
          <ISSProvider>
            <PerformanceProvider>
              {children}
            </PerformanceProvider>
          </ISSProvider>
        </UIProvider>
      </DeviceProvider>
    </BrowserRouter>
  );
};

describe('TV Interface Integration Tests', () => {
  beforeEach(() => {
    // Reset to desktop dimensions
    mockWindowDimensions(1024, 768);
  });

  afterEach(() => {
    // Clean up
    mockWindowDimensions(1024, 768);
  });

  it('should apply TV styling when screen width is exactly 1920px', async () => {
    // Set TV dimensions
    mockWindowDimensions(1920, 1080);
    
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );

    // Trigger resize event to update DeviceContext
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for the component to re-render with TV profile
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Check that TV classes are applied to the main layout
    const mainContainer = document.querySelector('.tv-safe-zone');
    expect(mainContainer).toBeInTheDocument();
    
    const typographyContainer = document.querySelector('.tv-typography');
    expect(typographyContainer).toBeInTheDocument();
    
    const highContrastContainer = document.querySelector('.tv-high-contrast');
    expect(highContrastContainer).toBeInTheDocument();
  });

  it('should not apply TV styling when screen width is not 1920px', async () => {
    // Set non-TV dimensions
    mockWindowDimensions(1366, 768);
    
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Check that TV classes are NOT applied
    const mainContainer = document.querySelector('.tv-safe-zone');
    expect(mainContainer).not.toBeInTheDocument();
  });

  it('should apply TV button styling to navigation links in TV mode', async () => {
    mockWindowDimensions(1920, 1080);
    
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Check navigation links have TV button classes
    const homeLink = screen.getByRole('link', { name: /home/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });
    
    expect(homeLink).toHaveClass('tv-button');
    expect(homeLink).toHaveClass('tv-focus-indicator');
    expect(aboutLink).toHaveClass('tv-button');
    expect(aboutLink).toHaveClass('tv-focus-indicator');
  });

  it('should apply TV typography classes in TV mode', async () => {
    mockWindowDimensions(1920, 1080);
    
    render(
      <TestWrapper>
        <MainLayout />
      </TestWrapper>
    );

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Check that the main title has TV typography class
    const title = screen.getByText('ISS Live Tracker');
    expect(title).toHaveClass('tv-typography');
    
    // Check that TV typography classes are applied to the layout
    const typographyElements = document.querySelectorAll('.tv-typography');
    expect(typographyElements.length).toBeGreaterThan(0);
  });
});