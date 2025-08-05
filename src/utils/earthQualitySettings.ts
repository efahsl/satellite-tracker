import { PerformanceTier } from '../state/PerformanceContext';

export interface EarthQualitySettings {
  geometrySegments: number;
  atmosphereLayers: number;
  shaderComplexity: 'low' | 'medium' | 'high';
  enableNormalMap: boolean;
  enableSpecularMap: boolean;
  enableCityEffects: boolean;
  enableAtmosphere: boolean;
  enableRotation: boolean;
}

// Quality presets for each tier
const QUALITY_PRESETS: Record<PerformanceTier, EarthQualitySettings> = {
  high: {
    geometrySegments: 64,
    atmosphereLayers: 2,
    shaderComplexity: 'high',
    enableNormalMap: true,
    enableSpecularMap: true,
    enableCityEffects: true,
    enableAtmosphere: true,
    enableRotation: true
  },
  medium: {
    geometrySegments: 48,
    atmosphereLayers: 1,
    shaderComplexity: 'medium',
    enableNormalMap: true,
    enableSpecularMap: false,
    enableCityEffects: false,
    enableAtmosphere: true,
    enableRotation: true
  },
  low: {
    geometrySegments: 32,
    atmosphereLayers: 0,
    shaderComplexity: 'low',
    enableNormalMap: false,
    enableSpecularMap: false,
    enableCityEffects: false,
    enableAtmosphere: false,
    enableRotation: false
  }
};

// Atmosphere constants
export const ATMOSPHERE_CONSTANTS = {
  INNER_RADIUS_OFFSET: 0.1,
  OUTER_RADIUS_OFFSET: 0.2,
  INNER_SEGMENTS: 32,
  OUTER_SEGMENTS: 16,
  INNER_OPACITY: 0.15,
  OUTER_OPACITY: 0.05,
  INNER_COLOR: '#4a90e2',
  OUTER_COLOR: '#87ceeb'
} as const;

// Material constants
export const MATERIAL_CONSTANTS = {
  BASE_OPACITY: 0.9,
  SHININESS: 30,
  ATMOSPHERE_COLOR: [0.3, 0.6, 1.0],
  GLOW_COLOR: [0.8, 0.8, 1.0]
} as const;

/**
 * Get quality settings for a specific tier
 */
export function getEarthQualitySettings(tier: PerformanceTier): EarthQualitySettings {
  return QUALITY_PRESETS[tier];
}

/**
 * Get geometry segments based on quality
 */
export function getGeometrySegments(quality: EarthQualitySettings): number {
  return quality.geometrySegments;
}

/**
 * Check if atmosphere should be rendered
 */
export function shouldRenderAtmosphere(quality: EarthQualitySettings): boolean {
  return quality.enableAtmosphere;
}

/**
 * Check if outer atmosphere should be rendered
 */
export function shouldRenderOuterAtmosphere(quality: EarthQualitySettings): boolean {
  return quality.atmosphereLayers >= 2;
}

/**
 * Get shader quality level as number
 */
export function getEarthShaderQualityLevel(shaderComplexity: 'low' | 'medium' | 'high'): number {
  switch (shaderComplexity) {
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 0;
    default: return 0;
  }
} 