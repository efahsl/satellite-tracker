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

  // Detect manual tier changes
  useEffect(() => {
    if (lastKnownTier.current !== performanceState.tier) {
      // Manual tier change detected
      triggerManualOverride();
      lastKnownTier.current = performanceState.tier;
    }
  }, [performanceState.tier]);

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
    // Need at least 20 data points (5 seconds at 250ms intervals)
    if (fpsHistory.length < 20) {
      return 'maintain';
    }

    // Filter out invalid FPS values
    const validFPS = fpsHistory.filter(fps => fps > 0 && fps <= 200);
    if (validFPS.length < 15) {
      return 'maintain';
    }

    const avgFPS = validFPS.reduce((a, b) => a + b, 0) / validFPS.length;
    const variance = Math.max(...validFPS) - Math.min(...validFPS);

    // High variance indicates instability - be conservative
    if (variance > 20) {
      return 'maintain';
    }

    if (avgFPS < config.lowerThreshold) {
      return 'lower';
    }
    if (avgFPS > config.upperThreshold) {
      return 'raise';
    }
    return 'maintain';
  }, [config.lowerThreshold, config.upperThreshold]);

  const shouldAdjustTier = useCallback((): boolean => {
    return (
      state.isEnabled &&
      !state.isInCooldown &&
      !state.isManualOverride
    );
  }, [state.isEnabled, state.isInCooldown, state.isManualOverride]);

  const handleTierAdjustment = useCallback((decision: 'lower' | 'raise') => {
    const currentTierIndex = TIER_ORDER.indexOf(performanceState.tier);
    let newTierIndex = currentTierIndex;

    if (decision === 'lower' && currentTierIndex > 0) {
      newTierIndex = currentTierIndex - 1;
    } else if (decision === 'raise' && currentTierIndex < TIER_ORDER.length - 1) {
      newTierIndex = currentTierIndex + 1;
    } else {
      // No adjustment needed (already at boundary)
      return;
    }

    const newTier = TIER_ORDER[newTierIndex];
    
    try {
      setTier(newTier);
      lastKnownTier.current = newTier;
      
      // Update state to reflect the adjustment
      setState(prev => ({
        ...prev,
        isInCooldown: true,
        lastAdjustmentTime: Date.now(),
      }));

      // Basic logging for tier adjustment decisions
      console.log(`[AdaptivePerformance] Tier adjusted: ${performanceState.tier} → ${newTier} (${decision})`);
    } catch (error) {
      console.error('[AdaptivePerformance] Failed to adjust tier:', error);
    }
  }, [performanceState.tier, setTier]);

  const handleFPSUpdate = useCallback((fps: number, avgFps: number, fpsHistory: number[]) => {
    // Update FPS history in state
    setState(prev => ({
      ...prev,
      fpsHistory: [...fpsHistory],
    }));

    if (!shouldAdjustTier()) {
      return;
    }

    const decision = analyzeFPSData(fpsHistory);
    if (decision !== 'maintain') {
      handleTierAdjustment(decision);
    }
  }, [shouldAdjustTier, analyzeFPSData, handleTierAdjustment]);

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