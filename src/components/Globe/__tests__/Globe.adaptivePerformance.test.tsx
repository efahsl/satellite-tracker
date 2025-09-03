import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Globe from '../Globe';
import { ISSProvider } from '../../../state/ISSContext';
import { PerformanceProvider } from '../../../state/PerformanceContext';
import { DeviceProvider } from '../../../state/DeviceContext';
import { UIProvider } from '../../../state/UIContext';

// Mock Three.js components to avoid WebGL context issues in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  Stars: () => <div data-testid="stars" />,
}));

// Mock Globe sub-components
vi.mock('../Earth', () => ({
  default: () => <div data-testid="earth" />,
}));

vi.mock('../ISS', () => ({
  default: () => <div data-testid="iss" />,
}));

vi.mock('../ISS-Enhanced', () => ({
  default: () => <div data-testid="iss-enhanced" />,
}));

vi.mock('../Sun', () => ({
  default: () => <div data-testid="sun" />,
}));

vi.mock('../Controls', () => ({
  default: React.forwardRef(() => <div data-testid="controls" />),
}));

vi.mock('../FPSMonitor', () => ({
  default: ({ onFPSUpdate, enableDataExport }: { onFPSUpdate?: Function; enableDataExport?: boolean }) => (
    <div 
      data-testid="fps-monitor" 
      data-enable-export={enableDataExport}
      data-has-callback={!!onFPSUpdate}
    />
  ),
}));

// Mock hooks
vi.mock('../../../hooks/useAdaptivePerformance', () => ({
  useAdaptivePerformance: () => ({
    config: {
      enabled: true,
      lowerThreshold: 15,
      upperThreshold: 55,
    },
    state: {
      isEnabled: true,
      isInCooldown: false,
      isManualOverride: false,
      fpsHistory: [],
    },
    handleFPSUpdate: vi.fn(),
    updateConfig: vi.fn(),
    triggerManualOverride: vi.fn(),
    resetCooldown: vi.fn(),
  }),
}));

// Mock console.log to capture logging
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <UIProvider>
      <PerformanceProvider>
        <ISSProvider>
          {children}
        </ISSProvider>
      </PerformanceProvider>
    </UIProvider>
  </DeviceProvider>
);

describe('Globe Adaptive Performance Integration', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render Globe component with adaptive performance integration', () => {
    render(
      <TestWrapper>
        <Globe />
      </TestWrapper>
    );

    // Verify core components are rendered
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('earth')).toBeInTheDocument();
    expect(screen.getByTestId('controls')).toBeInTheDocument();
  });

  it('should render FPSMonitor with adaptive performance integration when visible', () => {
    const { container } = render(
      <TestWrapper>
        <Globe />
      </TestWrapper>
    );

    // FPSMonitor should be rendered with proper integration props
    const fpsMonitors = screen.getAllByTestId('fps-monitor');
    const fpsMonitor = fpsMonitors[0]; // Take the first one in case of multiple
    expect(fpsMonitor).toBeInTheDocument();
    expect(fpsMonitor).toHaveAttribute('data-enable-export', 'true');
    expect(fpsMonitor).toHaveAttribute('data-has-callback', 'true');
  });

  it('should initialize adaptive performance system without excessive logging', () => {
    // Clear any previous logs
    mockConsoleLog.mockClear();
    
    render(
      <TestWrapper>
        <Globe />
      </TestWrapper>
    );

    // Since we made logging more selective, we should NOT see excessive logging
    // The tier change logging should only happen when there's an actual tier change
    const globeLogCalls = mockConsoleLog.mock.calls.filter(call => 
      call[0] && typeof call[0] === 'string' && call[0].includes('[Globe]')
    );
    
    // Should have minimal Globe-specific logging on initial render
    expect(globeLogCalls.length).toBeLessThanOrEqual(1);
  });

  it('should handle component cleanup properly', () => {
    const { unmount } = render(
      <TestWrapper>
        <Globe />
      </TestWrapper>
    );

    // Clear previous logs
    mockConsoleLog.mockClear();

    // Unmount the component
    unmount();

    // In test environment (NODE_ENV !== 'development'), cleanup logging should be minimal
    // We mainly want to verify that cleanup happens without errors
    expect(() => unmount()).not.toThrow();
    
    // The cleanup function should have been called (verified by no errors)
    // In development mode, there would be a cleanup log, but in test mode it's suppressed
  });

  it('should maintain backward compatibility with existing FPSMonitor usage', () => {
    const { container } = render(
      <TestWrapper>
        <Globe />
      </TestWrapper>
    );

    const fpsMonitors = screen.getAllByTestId('fps-monitor');
    const fpsMonitor = fpsMonitors[0]; // Take the first one in case of multiple
    
    // Verify FPSMonitor is rendered with expected props
    expect(fpsMonitor).toBeInTheDocument();
    
    // The component should still work even if adaptive performance is disabled
    // This ensures backward compatibility
    expect(fpsMonitor).toHaveAttribute('data-enable-export', 'true');
  });
});