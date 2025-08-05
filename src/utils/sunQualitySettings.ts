import { PerformanceTier } from '../state/PerformanceContext';

export interface SunQualitySettings {
  particleCount: number;
  coronaLayers: number;
  shaderComplexity: 'low' | 'medium' | 'high';
  granulationDetail: number;
  flareMaxCount: number;
  prominenceMaxCount: number;
  animationSpeed: number;
  enableLOD: boolean;
}

export interface SunActivitySettings {
  baseActivity: number;
  activityRange: number;
  cycleSpeed: number;
  complexity: 'simple' | 'medium' | 'complex';
}

// Quality presets for each tier
const QUALITY_PRESETS: Record<PerformanceTier, SunQualitySettings> = {
  high: {
    particleCount: 2000,
    coronaLayers: 2,
    shaderComplexity: 'high',
    granulationDetail: 1.0,
    flareMaxCount: 4,
    prominenceMaxCount: 3,
    animationSpeed: 1.0,
    enableLOD: true
  },
  medium: {
    particleCount: 600,
    coronaLayers: 2,
    shaderComplexity: 'medium',
    granulationDetail: 0.5,
    flareMaxCount: 1,
    prominenceMaxCount: 1,
    animationSpeed: 0.6,
    enableLOD: true
  },
  low: {
    particleCount: 500,
    coronaLayers: 1,
    shaderComplexity: 'low',
    granulationDetail: 0.4,
    flareMaxCount: 1,
    prominenceMaxCount: 1,
    animationSpeed: 0.6,
    enableLOD: true
  }
};

// Activity presets for each tier
const ACTIVITY_PRESETS: Record<PerformanceTier, SunActivitySettings> = {
  high: {
    baseActivity: 0.5,
    activityRange: 0.4, // 0.1 to 0.9
    cycleSpeed: 0.05,
    complexity: 'complex'
  },
  medium: {
    baseActivity: 0.5,
    activityRange: 0.3, // 0.2 to 0.8
    cycleSpeed: 0.08,
    complexity: 'medium'
  },
  low: {
    baseActivity: 0.5,
    activityRange: 0.0, // Static
    cycleSpeed: 0.0,
    complexity: 'simple'
  }
};

// LOD distance constants
const LOD_CONSTANTS = {
  MIN_DISTANCE: 10,
  MAX_DISTANCE: 50,
  DISTANCE_RANGE: 40,
  PARTICLE_REDUCTION: 0.7,
  GRANULATION_REDUCTION: 0.5,
  FLARE_REDUCTION: 0.5,
  HIGH_QUALITY_THRESHOLD: 0.7,
  MEDIUM_QUALITY_THRESHOLD: 0.9
} as const;

/**
 * Get quality settings for a specific tier with distance-based LOD
 */
export function getSunQualitySettings(
  tier: PerformanceTier, 
  distance: number
): SunQualitySettings {
  const baseSettings = QUALITY_PRESETS[tier];
  
  if (!baseSettings.enableLOD) {
    return baseSettings;
  }

  // Calculate normalized distance (0-1)
  const normalizedDistance = Math.max(0, Math.min(1, 
    (distance - LOD_CONSTANTS.MIN_DISTANCE) / LOD_CONSTANTS.DISTANCE_RANGE
  ));
  
  const lodSettings = { ...baseSettings };
  
  // Apply distance-based reductions
  lodSettings.particleCount = Math.floor(
    baseSettings.particleCount * (1 - normalizedDistance * LOD_CONSTANTS.PARTICLE_REDUCTION)
  );
  
  lodSettings.granulationDetail = baseSettings.granulationDetail * 
    (1 - normalizedDistance * LOD_CONSTANTS.GRANULATION_REDUCTION);
  
  lodSettings.flareMaxCount = Math.max(1, Math.floor(
    baseSettings.flareMaxCount * (1 - normalizedDistance * LOD_CONSTANTS.FLARE_REDUCTION)
  ));
  
  // Simplify shader complexity at far distances
  if (normalizedDistance > LOD_CONSTANTS.HIGH_QUALITY_THRESHOLD && 
      baseSettings.shaderComplexity === 'high') {
    lodSettings.shaderComplexity = 'medium';
  } else if (normalizedDistance > LOD_CONSTANTS.MEDIUM_QUALITY_THRESHOLD && 
             baseSettings.shaderComplexity === 'medium') {
    lodSettings.shaderComplexity = 'low';
  }
  
  return lodSettings;
}

/**
 * Get activity settings for a specific tier
 */
export function getSunActivitySettings(tier: PerformanceTier): SunActivitySettings {
  return ACTIVITY_PRESETS[tier];
}

/**
 * Calculate solar activity based on tier and time
 */
export function calculateSolarActivity(
  tier: PerformanceTier, 
  time: number, 
  activitySettings: SunActivitySettings
): number {
  switch (activitySettings.complexity) {
    case 'complex':
      // Full complexity for high tier
      const baseActivityCycle = activitySettings.baseActivity + 
        Math.sin(time * activitySettings.cycleSpeed) * activitySettings.activityRange;
      const mediumActivityCycle = Math.sin(time * 0.15) * 0.15;
      const shortActivityCycle = Math.sin(time * 0.8) * 0.05;
      
      return Math.max(
        0.1,
        Math.min(0.9, baseActivityCycle + mediumActivityCycle + shortActivityCycle)
      );
      
    case 'medium':
      // Simplified for medium tier
      const simpleActivityCycle = activitySettings.baseActivity + 
        Math.sin(time * activitySettings.cycleSpeed) * activitySettings.activityRange;
      return Math.max(0.2, Math.min(0.8, simpleActivityCycle));
      
    case 'simple':
    default:
      // Static for low tier
      return activitySettings.baseActivity;
  }
}

/**
 * Get shader quality level as number
 */
export function getShaderQualityLevel(shaderComplexity: 'low' | 'medium' | 'high'): number {
  switch (shaderComplexity) {
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 0;
    default: return 0;
  }
} 