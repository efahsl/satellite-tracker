import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAdaptivePerformance } from '../useAdaptivePerformance';
import { PerformanceProvider } from '../../state/PerformanceContext';
import React from 'react';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PerformanceProvider>{children}</PerformanceProvider>
);

describe('useAdaptivePerformance Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should integrate with FPSMonitor data export pattern', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Simulate the pattern that FPSMonitor would use
    const simulateFPSMonitorUpdate = (fps: number, avgFps: number, fpsHistory: number[]) => {
      // This simulates what FPSMonitor does when enableDataExport is true
      if (result.current.config.enabled) {
        result.current.handleFPSUpdate(fps, avgFps, fpsHistory);
      }
    };

    // Test scenario: Performance starts good, then degrades
    const goodFPSHistory = Array(25).fill(60);
    
    act(() => {
      simulateFPSMonitorUpdate(60, 60, goodFPSHistory);
    });

    // Should not trigger adjustment (already at high tier)
    expect(result.current.state.isInCooldown).toBe(false);

    // Now simulate performance degradation
    const badFPSHistory = Array(25).fill(10);
    
    act(() => {
      simulateFPSMonitorUpdate(10, 10, badFPSHistory);
    });

    // Should trigger tier lowering and enter cooldown
    expect(result.current.state.isInCooldown).toBe(true);
    expect(result.current.state.lastAdjustmentTime).toBeGreaterThan(0);

    // Simulate trying to update again during cooldown
    const anotherBadFPSHistory = Array(25).fill(5);
    const initialAdjustmentTime = result.current.state.lastAdjustmentTime;
    
    act(() => {
      simulateFPSMonitorUpdate(5, 5, anotherBadFPSHistory);
    });

    // Should not trigger another adjustment due to cooldown
    expect(result.current.state.lastAdjustmentTime).toBe(initialAdjustmentTime);

    // Wait for cooldown to end
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.state.isInCooldown).toBe(false);

    // Now performance improves
    const improvedFPSHistory = Array(25).fill(60);
    
    act(() => {
      simulateFPSMonitorUpdate(60, 60, improvedFPSHistory);
    });

    // Should trigger tier raising
    expect(result.current.state.isInCooldown).toBe(true);
  });

  it('should handle the complete FPS monitoring lifecycle', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Simulate building up FPS history gradually (like FPSMonitor does)
    const fpsHistory: number[] = [];
    
    // Add data points one by one (simulating 250ms intervals)
    for (let i = 0; i < 15; i++) {
      fpsHistory.push(30); // Stable FPS
      
      act(() => {
        result.current.handleFPSUpdate(30, 30, [...fpsHistory]);
      });
    }

    // Should not trigger adjustment with insufficient data
    expect(result.current.state.isInCooldown).toBe(false);

    // Add more data points with consistently low FPS to reach the threshold
    for (let i = 15; i < 25; i++) {
      fpsHistory.push(10); // Low FPS
    }

    // Calculate the actual average for the final update
    const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
    
    act(() => {
      result.current.handleFPSUpdate(10, avgFPS, [...fpsHistory]);
    });

    // Should trigger adjustment only if average is below threshold
    if (avgFPS < 15) {
      expect(result.current.state.isInCooldown).toBe(true);
    } else {
      // If average is not low enough, create a history with all low FPS
      const allLowFPSHistory = Array(25).fill(10);
      act(() => {
        result.current.handleFPSUpdate(10, 10, allLowFPSHistory);
      });
      expect(result.current.state.isInCooldown).toBe(true);
    }
  });

  it('should respect manual override from external tier changes', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Simulate manual tier change (this would happen when user changes tier manually)
    act(() => {
      result.current.triggerManualOverride();
    });

    expect(result.current.state.isManualOverride).toBe(true);

    // Try to trigger automatic adjustment
    const lowFPSHistory = Array(25).fill(10);
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    // Should not trigger adjustment due to manual override
    expect(result.current.state.isInCooldown).toBe(false);

    // Wait for manual override to expire
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.state.isManualOverride).toBe(false);

    // Now automatic adjustment should work again
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    expect(result.current.state.isInCooldown).toBe(true);
  });
});