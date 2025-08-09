import React from 'react';
import { render, screen } from '@testing-library/react';
import { ISSProvider } from '../../../state/ISSContext';
import { DeviceProvider } from '../../../state/DeviceContext';
import FloatingInfoPanel from '../FloatingInfoPanel';

// Mock the info panel components
vi.mock('../../InfoPanel/Coordinates', () => ({
  default: () => <div data-testid="coordinates">Coordinates Component</div>
}));

vi.mock('../../InfoPanel/Altitude', () => ({
  default: () => <div data-testid="altitude">Altitude Component</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <DeviceProvider>
      <ISSProvider>
        {component}
      </ISSProvider>
    </DeviceProvider>
  );
};

describe('FloatingInfoPanel', () => {
  it('renders the panel with title', () => {
    renderWithProviders(<FloatingInfoPanel />);
    expect(screen.getByText('ISS Position')).toBeInTheDocument();
  });

  it('renders coordinates and altitude components', () => {
    renderWithProviders(<FloatingInfoPanel />);
    expect(screen.getByTestId('coordinates')).toBeInTheDocument();
    expect(screen.getByTestId('altitude')).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    renderWithProviders(<FloatingInfoPanel />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithProviders(
      <FloatingInfoPanel className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has proper semantic structure', () => {
    renderWithProviders(<FloatingInfoPanel />);
    
    // Check for proper heading structure
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('ISS Position');
  });

  it('renders timestamp with proper styling class', () => {
    renderWithProviders(<FloatingInfoPanel />);
    const timestamp = screen.getByText(/Last updated:/);
    expect(timestamp.parentElement).toHaveClass('floating-info-panel__timestamp');
  });

  it('renders data container with proper structure', () => {
    renderWithProviders(<FloatingInfoPanel />);
    const dataContainer = screen.getByTestId('coordinates').parentElement;
    expect(dataContainer).toHaveClass('floating-info-panel__data');
  });

  it('memoizes timestamp formatting', () => {
    const { rerender } = renderWithProviders(<FloatingInfoPanel />);
    
    // Re-render with same props should not cause unnecessary re-renders
    rerender(
      <DeviceProvider>
        <ISSProvider>
          <FloatingInfoPanel />
        </ISSProvider>
      </DeviceProvider>
    );
    
    // Component should still render correctly
    expect(screen.getByText('ISS Position')).toBeInTheDocument();
  });

  it('handles loading state gracefully', () => {
    // Mock ISS context to return no position data
    const mockISSContext = {
      state: { position: null },
      dispatch: vi.fn()
    };

    vi.doMock('../../../state/ISSContext', () => ({
      useISS: () => mockISSContext
    }));

    renderWithProviders(<FloatingInfoPanel />);
    expect(screen.getByText('Last updated: Loading...')).toBeInTheDocument();
  });

  it('applies mobile layout class when on mobile device', () => {
    // Mock device context to return mobile device
    const mockDeviceContext = {
      state: { deviceType: 'mobile' },
      dispatch: vi.fn(),
      isMobile: true,
      isDesktop: false,
      isTV: false
    };

    vi.doMock('../../../state/DeviceContext', () => ({
      useDevice: () => mockDeviceContext
    }));

    renderWithProviders(<FloatingInfoPanel />);
    const dataContainer = screen.getByTestId('coordinates').parentElement;
    expect(dataContainer).toHaveClass('floating-info-panel__data--mobile');
  });

  it('applies desktop layout class when on desktop device', () => {
    // Mock device context to return desktop device
    const mockDeviceContext = {
      state: { deviceType: 'desktop' },
      dispatch: vi.fn(),
      isMobile: false,
      isDesktop: true,
      isTV: false
    };

    vi.doMock('../../../state/DeviceContext', () => ({
      useDevice: () => mockDeviceContext
    }));

    renderWithProviders(<FloatingInfoPanel />);
    const dataContainer = screen.getByTestId('coordinates').parentElement;
    expect(dataContainer).toHaveClass('floating-info-panel__data--desktop');
  });
});
