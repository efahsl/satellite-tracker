import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { DeviceProvider } from '../../state/DeviceContext';
import { ISSProvider } from '../../state/ISSContext';
import { PerformanceProvider } from '../../state/PerformanceContext';

// Mock the Globe component since it uses Three.js
vi.mock('../../components/Globe/Globe', () => ({
  default: ({ width, height }: { width: string; height: string }) => (
    <div data-testid="globe" style={{ width, height }}>
      Globe Component
    </div>
  )
}));

// Mock the FPSMonitor component
vi.mock('../../components/Globe/FPSMonitor', () => ({
  default: ({ position }: { position: string }) => (
    <div data-testid="fps-monitor" data-position={position}>
      FPS Monitor
    </div>
  )
}));

// Mock the FloatingInfoPanel component
vi.mock('../../components/UI/FloatingInfoPanel/FloatingInfoPanel', () => ({
  default: () => (
    <div data-testid="floating-info-panel">
      Floating Info Panel
    </div>
  )
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <DeviceProvider>
        <ISSProvider>
          <PerformanceProvider>
            {component}
          </PerformanceProvider>
        </ISSProvider>
      </DeviceProvider>
    </BrowserRouter>
  );
};

describe('Home', () => {
  it('renders all main components', () => {
    const { getByTestId } = renderWithProviders(<Home />);
    
    expect(getByTestId('globe')).toBeInTheDocument();
    expect(getByTestId('fps-monitor')).toBeInTheDocument();
    expect(getByTestId('floating-info-panel')).toBeInTheDocument();
  });

  it('applies proper styling for full screen layout', () => {
    const { container } = renderWithProviders(<Home />);
    const mainContainer = container.firstChild as HTMLElement;
    
    expect(mainContainer).toHaveClass('relative', 'w-full', 'h-screen', 'bg-space-black', 'overflow-hidden');
    expect(mainContainer).toHaveStyle({
      minHeight: '100vh',
      height: '100vh',
      width: '100vw',
      position: 'relative'
    });
  });

  it('positions Globe component correctly', () => {
    const { getByTestId } = renderWithProviders(<Home />);
    const globe = getByTestId('globe');
    
    expect(globe).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('positions FPS Monitor with correct position prop', () => {
    const { getByTestId } = renderWithProviders(<Home />);
    const fpsMonitor = getByTestId('fps-monitor');
    
    expect(fpsMonitor).toHaveAttribute('data-position', 'top-right');
  });

  it('has proper z-index layering', () => {
    const { getByTestId } = renderWithProviders(<Home />);
    const fpsMonitor = getByTestId('fps-monitor').parentElement;
    const floatingInfoPanel = getByTestId('floating-info-panel').parentElement;
    
    // Both should have z-10 class for proper layering above the globe
    expect(fpsMonitor).toHaveClass('z-10');
    expect(floatingInfoPanel).toHaveClass('z-10');
  });

  it('applies touch optimization styles', () => {
    const { container } = renderWithProviders(<Home />);
    const mainContainer = container.firstChild as HTMLElement;
    
    // Should have user-select: none for better touch experience
    expect(mainContainer).toHaveStyle({ userSelect: 'none' });
  });

  it('uses absolute positioning for UI components', () => {
    const { getByTestId } = renderWithProviders(<Home />);
    const fpsMonitor = getByTestId('fps-monitor').parentElement;
    const floatingInfoPanel = getByTestId('floating-info-panel').parentElement;
    
    expect(fpsMonitor).toHaveClass('absolute');
    expect(floatingInfoPanel).toHaveClass('absolute');
  });
});