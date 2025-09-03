import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAdaptivePerformance } from '../useAdaptivePerformance';
import { PerformanceProvider } from '../../state/PerformanceContext';
import React from 'react';

// Mock console.log to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PerformanceProvider>{children}</PerformanceProvider>
);

describe('useAdaptivePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default config and state', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    expect(result.current.config.enabled).toBe(true);
    expect(result.current.config.lowerThreshold).toBe(15);
    expect(result.current.config.upperThreshold).toBe(55);
    expect(result.current.state.isEnabled).toBe(true);
    expect(result.current.state.isInCooldown).toBe(false);
    expect(result.current.state.isManualOverride).toBe(false);
  });

  it('should handle FPS updates with insufficient data', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Simulate FPS update with insufficient data (less than 20 points)
    const shortHistory = Array(10).fill(30);
    
    act(() => {
      result.current.handleFPSUpdate(30, 30, shortHistory);
    });

    // Should not trigger any tier changes
    expect(result.current.state.fpsHistory).toEqual(shortHistory);
    expect(result.current.state.isInCooldown).toBe(false);
  });

  it('should handle FPS updates with sufficient data for tier lowering', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Simulate FPS update with low FPS (below 15 threshold)
    const lowFPSHistory = Array(25).fill(10);
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    // Should trigger cooldown after tier adjustment
    expect(result.current.state.isInCooldown).toBe(true);
    expect(result.current.state.lastAdjustmentTime).toBeGreaterThan(0);
  });

  it('should handle FPS updates with sufficient data for tier raising', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // First lower the tier so we can test raising it
    const lowFPSHistory = Array(25).fill(10);
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    // Wait for cooldown to end
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Now simulate FPS update with high FPS (above 55 threshold)
    const highFPSHistory = Array(25).fill(60);
    
    act(() => {
      result.current.handleFPSUpdate(60, 60, highFPSHistory);
    });

    // Should trigger cooldown after tier adjustment
    expect(result.current.state.isInCooldown).toBe(true);
    expect(result.current.state.lastAdjustmentTime).toBeGreaterThan(0);
  });

  it('should not adjust tier when in cooldown', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // First, trigger a tier adjustment to enter cooldown
    const lowFPSHistory = Array(25).fill(10);
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    expect(result.current.state.isInCooldown).toBe(true);

    // Try to trigger another adjustment while in cooldown
    const anotherLowFPSHistory = Array(25).fill(5);
    const initialAdjustmentTime = result.current.state.lastAdjustmentTime;
    
    act(() => {
      result.current.handleFPSUpdate(5, 5, anotherLowFPSHistory);
    });

    // Should not trigger another adjustment
    expect(result.current.state.lastAdjustmentTime).toBe(initialAdjustmentTime);
  });

  it('should trigger manual override', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.triggerManualOverride();
    });

    expect(result.current.state.isManualOverride).toBe(true);
    expect(result.current.state.lastManualOverrideTime).toBeGreaterThan(0);
  });

  it('should not adjust tier when manual override is active', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Trigger manual override
    act(() => {
      result.current.triggerManualOverride();
    });

    // Try to trigger tier adjustment
    const lowFPSHistory = Array(25).fill(10);
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    // Should not trigger adjustment due to manual override
    expect(result.current.state.isInCooldown).toBe(false);
    expect(result.current.state.lastAdjustmentTime).toBe(0);
  });

  it('should update config correctly', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.updateConfig({
        enabled: false,
        lowerThreshold: 20,
        upperThreshold: 50,
      });
    });

    expect(result.current.config.enabled).toBe(false);
    expect(result.current.config.lowerThreshold).toBe(20);
    expect(result.current.config.upperThreshold).toBe(50);
    expect(result.current.state.isEnabled).toBe(false);
  });

  it('should reset cooldown', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // First trigger cooldown
    const lowFPSHistory = Array(25).fill(10);
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    expect(result.current.state.isInCooldown).toBe(true);

    // Reset cooldown
    act(() => {
      result.current.resetCooldown();
    });

    expect(result.current.state.isInCooldown).toBe(false);
    expect(result.current.state.lastAdjustmentTime).toBe(0);
  });

  it('should filter out invalid FPS values', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Create history with invalid values (negative and extremely high)
    const invalidFPSHistory = [
      ...Array(10).fill(-5), // Invalid negative values
      ...Array(10).fill(300), // Invalid extremely high values
      ...Array(10).fill(10), // Valid low values
    ];
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, invalidFPSHistory);
    });

    // Should not trigger adjustment due to insufficient valid data
    expect(result.current.state.isInCooldown).toBe(false);
  });

  it('should handle high variance FPS data conservatively', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Create history with high variance (mix of very low and high FPS)
    const highVarianceFPSHistory = [
      ...Array(12).fill(5),  // Very low FPS
      ...Array(13).fill(50), // High FPS
    ];
    
    act(() => {
      result.current.handleFPSUpdate(25, 25, highVarianceFPSHistory);
    });

    // Should not trigger adjustment due to high variance
    expect(result.current.state.isInCooldown).toBe(false);
  });
});