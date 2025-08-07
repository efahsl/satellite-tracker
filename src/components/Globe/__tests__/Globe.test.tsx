import React from 'react';
import { render } from '@testing-library/react';
import Globe from '../Globe';
import { ISSProvider } from '../../../state/ISSContext';
import { PerformanceProvider } from '../../../state/PerformanceContext';
import { vi } from 'vitest';

// Mock the Canvas component to avoid WebGL issues in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

// Mock the Controls component to verify props are passed
vi.mock('../Controls', () => ({
  default: function MockControls(props: any) {
    return <div data-testid="controls" data-earth-rotate-mode={props.earthRotateMode} />;
  },
}));

// Mock other Three.js components
vi.mock('@react-three/drei', () => ({
  Stars: () => <div data-testid="stars" />,
}));

// Mock other Globe components
vi.mock('../Earth', () => ({
  default: () => <div data-testid="earth" />,
}));
vi.mock('../ISS-Enhanced', () => ({
  default: () => <div data-testid="iss" />,
}));
vi.mock('../Sun', () => ({
  default: () => <div data-testid="sun" />,
}));
vi.mock('../SolarLighting', () => ({
  default: () => <div data-testid="solar-lighting" />,
}));
vi.mock('../FPSMonitor', () => ({
  default: () => <div data-testid="fps-monitor" />,
}));

describe('Globe Component Earth Rotate Integration', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <PerformanceProvider>
        <ISSProvider>
          {component}
        </ISSProvider>
      </PerformanceProvider>
    );
  };

  it('should render without crashing', () => {
    expect(() => {
      renderWithProviders(<Globe />);
    }).not.toThrow();
  });

  it('should pass earthRotateMode prop to Controls component', () => {
    const { getByTestId } = renderWithProviders(<Globe />);
    
    const controlsElement = getByTestId('controls');
    expect(controlsElement).toHaveAttribute('data-earth-rotate-mode');
  });

  it('should consume ISS context and pass earthRotateMode to Controls', () => {
    const { getByTestId } = renderWithProviders(<Globe />);
    
    const controlsElement = getByTestId('controls');
    // Initially earthRotateMode should be false
    expect(controlsElement).toHaveAttribute('data-earth-rotate-mode', 'false');
  });

  it('should render all expected components', () => {
    const { getByTestId } = renderWithProviders(<Globe />);
    
    expect(getByTestId('canvas')).toBeInTheDocument();
    expect(getByTestId('controls')).toBeInTheDocument();
    expect(getByTestId('earth')).toBeInTheDocument();
    expect(getByTestId('iss')).toBeInTheDocument();
    expect(getByTestId('sun')).toBeInTheDocument();
    expect(getByTestId('solar-lighting')).toBeInTheDocument();
    expect(getByTestId('fps-monitor')).toBeInTheDocument();
    expect(getByTestId('stars')).toBeInTheDocument();
  });
});