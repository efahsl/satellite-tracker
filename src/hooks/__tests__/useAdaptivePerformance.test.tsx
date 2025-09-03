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

    // Create history with invalid values (negative and extremely high) and insufficient valid data
    const invalidFPSHistory = [
      ...Array(10).fill(-5), // Invalid negative values
      ...Array(10).fill(300), // Invalid extremely high values
      ...Array(5).fill(10), // Only 5 valid low values (less than required 6)
    ];
    
    act(() => {
      result.current.handleFPSUpdate(10, 10, invalidFPSHistory);
    });

    // Should not trigger adjustment due to insufficient valid data (5 < 6 required)
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

  it('should implement hysteresis logic for tier lowering', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Create FPS history where only 60% of samples are below threshold (should not trigger)
    const inconsistentLowFPSHistory = [
      ...Array(15).fill(10), // 60% below threshold
      ...Array(10).fill(30), // 40% above threshold
    ];
    
    act(() => {
      result.current.handleFPSUpdate(18, 18, inconsistentLowFPSHistory);
    });

    // Should not trigger adjustment due to insufficient consistency
    expect(result.current.state.isInCooldown).toBe(false);

    // Now test with 80% of samples below threshold in the rolling window (should trigger)
    // Create 25 samples, but only the last 20 will be analyzed
    const consistentLowFPSHistory = [
      ...Array(5).fill(60),  // These will be outside the rolling window
      ...Array(16).fill(10), // 80% of the rolling window (16/20)
      ...Array(4).fill(30),  // 20% of the rolling window (4/20)
    ];
    
    act(() => {
      result.current.handleFPSUpdate(14, 14, consistentLowFPSHistory);
    });

    // Should trigger adjustment due to sufficient consistency
    expect(result.current.state.isInCooldown).toBe(true);
  });

  it('should implement hysteresis logic for tier raising', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // First lower the tier from high to medium
    const lowFPSHistory = Array(25).fill(10);
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory);
    });

    // Wait for cooldown
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Now test with consistent high FPS that should trigger tier raising
    // Use values well above the 55 FPS threshold with low variance
    const consistentHighFPSHistory = Array(25).fill(60); // All samples above threshold
    
    act(() => {
      result.current.handleFPSUpdate(60, 60, consistentHighFPSHistory);
    });

    // Should trigger adjustment from medium back to high
    expect(result.current.state.isInCooldown).toBe(true);
  });

  it('should prevent tier adjustment beyond boundaries', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Start at high tier, try to raise further
    const veryHighFPSHistory = Array(25).fill(100);
    
    act(() => {
      result.current.handleFPSUpdate(100, 100, veryHighFPSHistory);
    });

    // Should not trigger adjustment as we're already at max tier
    expect(result.current.state.isInCooldown).toBe(false);

    // Lower to minimum tier first
    const lowFPSHistory1 = Array(25).fill(10);
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory1);
    });

    // Wait for cooldown
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Lower again
    const lowFPSHistory2 = Array(25).fill(10);
    act(() => {
      result.current.handleFPSUpdate(10, 10, lowFPSHistory2);
    });

    // Wait for cooldown
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Try to lower further when already at minimum
    const veryLowFPSHistory = Array(25).fill(5);
    const lastAdjustmentTime = result.current.state.lastAdjustmentTime;
    
    act(() => {
      result.current.handleFPSUpdate(5, 5, veryLowFPSHistory);
    });

    // Should not trigger adjustment as we're already at min tier
    expect(result.current.state.lastAdjustmentTime).toBe(lastAdjustmentTime);
  });

  it('should handle standard deviation-based stability checking', () => {
    const { result } = renderHook(() => useAdaptivePerformance(), {
      wrapper: TestWrapper,
    });

    // Create FPS history with high standard deviation (alternating between very low and moderate values)
    const highStdDevHistory = [
      5, 25, 5, 25, 5, 25, 5, 25, 5, 25,  // High variance pattern
      5, 25, 5, 25, 5, 25, 5, 25, 5, 25,  // Continues pattern
      5, 25, 5, 25, 5  // Complete the 25 samples
    ];
    
    // Average will be 15, but standard deviation will be high due to alternating pattern
    act(() => {
      result.current.handleFPSUpdate(15, 15, highStdDevHistory);
    });

    // Should not trigger adjustment due to high standard deviation (instability)
    expect(result.current.state.isInCooldown).toBe(false);
  });
});