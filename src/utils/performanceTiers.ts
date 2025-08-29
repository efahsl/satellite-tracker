import { PerformanceTier, PerformanceSettings } from '../state/PerformanceContext';

export const PERFORMANCE_TIERS: Record<PerformanceTier, PerformanceSettings> = {
  high: {
    earthQuality: 'high',
    trailLength: 300,
    trailSegments: 8,
    shadowEnabled: true,
    textureQuality: 'high',
    animationFPS: 60,
    updateInterval: 5000,
    cityEffects: true,
    sunEnabled: true
  },
  medium: {
    earthQuality: 'medium',
    trailLength: 150,
    trailSegments: 4,
    shadowEnabled: false,
    textureQuality: 'medium',
    animationFPS: 30,
    updateInterval: 10000,
    cityEffects: true,
    sunEnabled: true
  },
  low: {
    earthQuality: 'low',
    trailLength: 50,
    trailSegments: 2,
    shadowEnabled: false,
    textureQuality: 'low',
    animationFPS: 15,
    updateInterval: 30000,
    cityEffects: false,
    sunEnabled: false
  }
};

export function getTierSettings(tier: PerformanceTier): PerformanceSettings {
  return PERFORMANCE_TIERS[tier];
}

export function getTextureQuality(tier: PerformanceTier): 'high' | 'medium' | 'low' {
  return PERFORMANCE_TIERS[tier].textureQuality;
}

export function getEarthQuality(tier: PerformanceTier): 'high' | 'medium' | 'low' {
  return PERFORMANCE_TIERS[tier].earthQuality;
}

export function getTrailSettings(tier: PerformanceTier): { length: number; segments: number } {
  const settings = PERFORMANCE_TIERS[tier];
  return {
    length: settings.trailLength,
    segments: settings.trailSegments
  };
}

export function getAnimationSettings(tier: PerformanceTier): { fps: number; updateInterval: number } {
  const settings = PERFORMANCE_TIERS[tier];
  return {
    fps: settings.animationFPS,
    updateInterval: settings.updateInterval
  };
} 