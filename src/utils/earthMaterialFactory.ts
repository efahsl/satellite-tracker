import { 
  MeshBasicMaterial, 
  MeshPhongMaterial, 
  ShaderMaterial, 
  Vector3,
  Texture 
} from 'three';
import { 
  getEarthShaderQualityLevel,
  MATERIAL_CONSTANTS 
} from './earthQualitySettings';
import { EarthQualitySettings } from './earthQualitySettings';
import { 
  CITY_BRIGHTNESS_THRESHOLD,
  CITY_ENHANCEMENT_FACTOR,
  MAJOR_CITY_THRESHOLD,
  MAJOR_CITY_ENHANCEMENT,
  CITY_GLOW_INTENSITY
} from '../utils/constants';

/**
 * Create low quality Earth material (basic)
 */
export function createLowQualityMaterial(dayMap: Texture): MeshBasicMaterial {
  return new MeshBasicMaterial({
    map: dayMap,
    transparent: true,
    opacity: MATERIAL_CONSTANTS.BASE_OPACITY
  });
}

/**
 * Create medium quality Earth material (Phong with basic lighting)
 */
export function createMediumQualityMaterial(
  dayMap: Texture, 
  normalMap: Texture | null
): MeshPhongMaterial {
  return new MeshPhongMaterial({
    map: dayMap,
    normalMap: normalMap,
    shininess: MATERIAL_CONSTANTS.SHININESS,
    transparent: true,
    opacity: MATERIAL_CONSTANTS.BASE_OPACITY
  });
}

/**
 * Create high quality Earth material (custom shader with full effects)
 */
export function createHighQualityMaterial(
  dayMap: Texture,
  nightMap: Texture,
  normalMap: Texture | null,
  specularMap: Texture | null,
  sunPosition: Vector3,
  cityEffects: boolean
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      normalMap: { value: normalMap },
      specularMap: { value: specularMap || dayMap }, // Fallback to dayMap if no specular map
      sunDirection: { value: sunPosition.clone().normalize() },
      atmosphereColor: { value: new Vector3(...MATERIAL_CONSTANTS.ATMOSPHERE_COLOR) },
      glowColor: { value: new Vector3(...MATERIAL_CONSTANTS.GLOW_COLOR) },
      hasSpecularMap: { value: specularMap ? 1.0 : 0.0 },
      cityBrightnessThreshold: { value: CITY_BRIGHTNESS_THRESHOLD },
      cityEnhancementFactor: { value: CITY_ENHANCEMENT_FACTOR },
      majorCityThreshold: { value: MAJOR_CITY_THRESHOLD },
      majorCityEnhancement: { value: MAJOR_CITY_ENHANCEMENT },
      cityGlowIntensity: { value: CITY_GLOW_INTENSITY },
      cityEffectsEnabled: { value: cityEffects ? 1.0 : 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vPosition = position;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D normalMap;
      uniform sampler2D specularMap;
      uniform vec3 sunDirection;
      uniform vec3 atmosphereColor;
      uniform vec3 glowColor;
      uniform float cityBrightnessThreshold;
      uniform float cityEnhancementFactor;
      uniform float majorCityThreshold;
      uniform float majorCityEnhancement;
      uniform float cityGlowIntensity;
      uniform float cityEffectsEnabled;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        // Sample textures
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        
        // Calculate lighting using world space normal and sun direction
        float sunDot = dot(vWorldNormal, sunDirection);
        
        // Smooth transition between day and night
        float dayFactor = smoothstep(-0.1, 0.1, sunDot);
        
        // Enhanced night lighting for cities (only if enabled)
        vec4 enhancedNightColor = nightColor;
        
        if (cityEffectsEnabled > 0.5) {
          // Calculate brightness/luminance of the night texture to identify cities
          float cityBrightness = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
          
          // Create enhancement masks based on brightness thresholds
          float cityMask = smoothstep(cityBrightnessThreshold * 0.5, cityBrightnessThreshold, cityBrightness);
          float majorCityMask = smoothstep(majorCityThreshold * 0.7, majorCityThreshold, cityBrightness);
          
          // Apply selective city enhancement only on the night side
          float nightSideFactor = 1.0 - dayFactor;
          
          // Enhance city areas with different intensities
          vec3 cityEnhancement = nightColor.rgb * cityMask * cityEnhancementFactor * nightSideFactor;
          vec3 majorCityBoost = nightColor.rgb * majorCityMask * majorCityEnhancement * nightSideFactor;
          
          // Add subtle glow effect around bright cities
          float glowRadius = cityBrightness * cityGlowIntensity * nightSideFactor;
          vec3 cityGlow = vec3(
            glowRadius * 0.6,  // Warm orange-red glow
            glowRadius * 0.8,  // Slightly more yellow
            glowRadius * 1.0   // Cool blue highlights for major cities
          );
          
          // Combine all enhancements
          enhancedNightColor.rgb += cityEnhancement + majorCityBoost + cityGlow;
        }
        
        // Mix enhanced night and day textures
        vec4 earthColor = mix(enhancedNightColor, dayColor, dayFactor);
        
        // Add subtle atmospheric glow on the day side
        float atmosphereFactor = pow(max(0.0, sunDot), 0.5);
        vec3 atmosphere = atmosphereColor * atmosphereFactor * 0.3;
        
        // Add specular highlights for water bodies (always sample, but conditionally apply)
        vec4 specular = texture2D(specularMap, vUv);
        float specularStrength = specular.r * max(0.0, sunDot) * 0.5;
        earthColor.rgb += vec3(specularStrength * 0.3);
        
        // Final color with atmosphere
        gl_FragColor = vec4(earthColor.rgb + atmosphere, 1.0);
      }
    `
  });
}

/**
 * Create Earth material based on quality settings
 */
export function createEarthMaterial(
  quality: EarthQualitySettings,
  dayMap: Texture,
  nightMap: Texture,
  normalMap: Texture | null,
  specularMap: Texture | null,
  sunPosition: Vector3,
  cityEffects: boolean
): MeshBasicMaterial | MeshPhongMaterial | ShaderMaterial {
  switch (quality.shaderComplexity) {
    case 'low':
      return createLowQualityMaterial(dayMap);
      
    case 'medium':
      return createMediumQualityMaterial(dayMap, normalMap);
      
    case 'high':
      return createHighQualityMaterial(
        dayMap, 
        nightMap, 
        normalMap, 
        specularMap, 
        sunPosition, 
        cityEffects
      );
      
    default:
      return createLowQualityMaterial(dayMap);
  }
} 