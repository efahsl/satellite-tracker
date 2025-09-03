import { useState, useCallback, useRef, useEffect } from 'react';
import { usePerformance, PerformanceTier } from '../state/PerformanceContext';

interface AdaptivePerformanceConfig {
  enabled: boolean;
  lowerThreshold: number; // 15 FPS
  upperThreshold: number; // 55 FPS
  analysisWindow: number; // 5000ms
  cooldownPeriod: number; // 10000ms
  manualOverrideDuration: number; // 30000ms
}

interface AdaptivePerformanceState {
  isEnabled: boolean;
  isInCooldown: boolean;
  isManualOverride: boolean;
  fpsHistory: number[];
  lastAdjustmentTime: number;
  lastManualOverrideTime: number;
}

interface UseAdaptivePerformanceReturn {
  config: AdaptivePerformanceConfig;
  state: AdaptivePerformanceState;
  updateConfig: (config: Partial<AdaptivePerformanceConfig>) => void;
  triggerManualOverride: () => void;
  resetCooldown: () => void;
  handleFPSUpdate: (fps: number, avgFps: number, fpsHistory: number[]) => void;
}

const DEFAULT_CONFIG: AdaptivePerformanceConfig = {
  enabled: true,
  lowerThreshold: 15,
  upperThreshold: 55,
  analysisWindow: 5000,
  cooldownPeriod: 10000,
  manualOverrideDuration: 30000,
};

const TIER_ORDER: PerformanceTier[] = ['low', 'medium', 'high'];

export function useAdaptivePerformance(
  initialConfig: Partial<AdaptivePerformanceConfig> = {}
): UseAdaptivePerformanceReturn {
  const { state: performanceState, setTier } = usePerformance();
  
  const [config, setConfig] = useState<AdaptivePerformanceConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [state, setState] = useState<AdaptivePerformanceState>({
    isEnabled: config.enabled,
    isInCooldown: false,
    isManualOverride: false,
    fpsHistory: [],
    lastAdjustmentTime: 0,
    lastManualOverrideTime: 0,
  });

  // Track the last known tier to detect manual changes
  const lastKnownTier = useRef<PerformanceTier>(performanceState.tier);

  // Detect manual tier changes and synchronize state
  useEffect(() => {
    if (lastKnownTier.current !== performanceState.tier) {
      // Check if this change was initiated by the adaptive system
      const now = Date.now();
      const timeSinceLastAdjustment = now - state.lastAdjustmentTime;
      
      // If the tier changed but it wasn't from our recent adjustment (within 100ms),
      // then it's likely a manual change
      if (timeSinceLastAdjustment > 100 || state.lastAdjustmentTime === 0) {
        triggerManualOverride();
      }
      
      lastKnownTier.current = performanceState.tier;
    }
  }, [performanceState.tier, state.lastAdjustmentTime]);

  // Clear manual override after duration
  useEffect(() => {
    if (state.isManualOverride && state.lastManualOverrideTime > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isManualOverride: false,
        }));
      }, config.manualOverrideDuration);

      return () => clearTimeout(timer);
    }
  }, [state.isManualOverride, state.lastManualOverrideTime, config.manualOverrideDuration]);

  // Clear cooldown after period
  useEffect(() => {
    if (state.isInCooldown && state.lastAdjustmentTime > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isInCooldown: false,
        }));
      }, config.cooldownPeriod);

      return () => clearTimeout(timer);
    }
  }, [state.isInCooldown, state.lastAdjustmentTime, config.cooldownPeriod]);

  const analyzeFPSData = useCallback((fpsHistory: number[]): 'lower' | 'raise' | 'maintain' => {
    // Need at least 8 data points (2 seconds at 250ms intervals)
    if (fpsHistory.length < 8) {
      return 'maintain';
    }

    // Use only the last 5 seconds of data (20 samples at 250ms intervals)
    const maxSamples = 20; // 5 seconds * 4 samples per second
    const recentFPS = fpsHistory.slice(-maxSamples);
    
    // Filter out invalid FPS values (negative or extremely high)
    const validFPS = recentFPS.filter(fps => fps > 0 && fps <= 200);
    if (validFPS.length < 6) {
      return 'maintain';
    }

    const avgFPS = validFPS.reduce((a, b) => a + b, 0) / validFPS.length;

    // Implement hysteresis logic - different thresholds based on current tier
    const currentTierIndex = TIER_ORDER.indexOf(performanceState.tier);
    
    // For lowering tier: be more aggressive when performance is poor
    if (avgFPS < config.lowerThreshold) {
      // Additional check: ensure consistently low performance in recent window
      const lowFPSCount = validFPS.filter(fps => fps < config.lowerThreshold).length;
      const lowFPSRatio = lowFPSCount / validFPS.length;
      

      
      // At least 60% of recent samples should be below threshold
      if (lowFPSRatio >= 0.6 && currentTierIndex > 0) {
        return 'lower';
      }
    }
    
    // For raising tier: be more conservative, require higher performance
    if (avgFPS > config.upperThreshold) {
      // Additional check: ensure consistently high performance in recent window
      const highFPSCount = validFPS.filter(fps => fps > config.upperThreshold).length;
      const highFPSRatio = highFPSCount / validFPS.length;
      

      
      // At least 70% of recent samples should be above threshold
      // Also ensure we're not at the highest tier already
      if (highFPSRatio >= 0.7 && currentTierIndex < TIER_ORDER.length - 1) {
        return 'raise';
      }
    }
    
    return 'maintain';
  }, [config.lowerThreshold, config.upperThreshold, performanceState.tier]);

  const shouldAdjustTier = useCallback((): boolean => {
    return (
      state.isEnabled &&
      !state.isInCooldown &&
      !state.isManualOverride
    );
  }, [state.isEnabled, state.isInCooldown, state.isManualOverride]);

  const handleTierAdjustment = useCallback((decision: 'lower' | 'raise') => {
    const currentTierIndex = TIER_ORDER.indexOf(performanceState.tier);
    
    // Boundary checking - prevent adjusting beyond min/max tiers
    if (decision === 'lower' && currentTierIndex <= 0) {
      // Only log in development mode for boundary conditions
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AdaptivePerformance] Already at minimum tier (${performanceState.tier})`);
      }
      return;
    }
    
    if (decision === 'raise' && currentTierIndex >= TIER_ORDER.length - 1) {
      // Only log in development mode for boundary conditions
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AdaptivePerformance] Already at maximum tier (${performanceState.tier})`);
      }
      return;
    }

    // Single-tier-level adjustment constraint - only move one level at a time
    let newTierIndex = currentTierIndex;
    if (decision === 'lower') {
      newTierIndex = currentTierIndex - 1;
    } else if (decision === 'raise') {
      newTierIndex = currentTierIndex + 1;
    }

    const newTier = TIER_ORDER[newTierIndex];
    
    try {
      // Execute tier change using existing setTier method
      setTier(newTier);
      
      // Update our tracking reference immediately to prevent false manual override detection
      lastKnownTier.current = newTier;
      
      // Update state to reflect the adjustment and enter cooldown
      const adjustmentTime = Date.now();
      setState(prev => ({
        ...prev,
        isInCooldown: true,
        lastAdjustmentTime: adjustmentTime,
      }));

      // Log tier adjustments (always important to know)
      console.log(`[AdaptivePerformance] ${performanceState.tier} → ${newTier} (${decision})`);
    } catch (error) {
      console.error('[AdaptivePerformance] Failed to adjust tier:', error);
      // Reset state on error to prevent inconsistent state
      setState(prev => ({
        ...prev,
        isInCooldown: false,
        lastAdjustmentTime: 0,
      }));
    }
  }, [performanceState.tier, setTier]);

  const handleFPSUpdate = useCallback((fps: number, avgFps: number, fpsHistory: number[]) => {
    // Update FPS history in state for debugging and monitoring
    setState(prev => ({
      ...prev,
      fpsHistory: [...fpsHistory],
    }));

    // Early return if adaptive performance is disabled or in restricted state
    if (!shouldAdjustTier()) {
      return;
    }

    // Analyze the FPS data to determine if tier adjustment is needed
    const decision = analyzeFPSData(fpsHistory);
    
    // Only log when a tier adjustment decision is made
    if (decision !== 'maintain' && process.env.NODE_ENV === 'development') {
      console.log(`[AdaptivePerformance] ${decision} tier (avg FPS: ${avgFps})`);
    }
    
    if (decision !== 'maintain') {
      handleTierAdjustment(decision);
    }
  }, [shouldAdjustTier, analyzeFPSData, handleTierAdjustment, state.isEnabled, state.isInCooldown, state.isManualOverride, config.lowerThreshold, config.upperThreshold]);

  const updateConfig = useCallback((newConfig: Partial<AdaptivePerformanceConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setState(prev => ({
      ...prev,
      isEnabled: newConfig.enabled !== undefined ? newConfig.enabled : prev.isEnabled,
    }));
  }, []);

  const triggerManualOverride = useCallback(() => {
    setState(prev => ({
      ...prev,
      isManualOverride: true,
      lastManualOverrideTime: Date.now(),
    }));
  }, []);

  const resetCooldown = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInCooldown: false,
      lastAdjustmentTime: 0,
    }));
  }, []);

  return {
    config,
    state,
    updateConfig,
    triggerManualOverride,
    resetCooldown,
    handleFPSUpdate,
  };
}