import { ShaderMaterial } from 'three';
import { getShaderQualityLevel } from './sunQualitySettings';

// Common shader constants
const SHADER_CONSTANTS = {
  NOISE_SEED: 43758.5453123,
  NOISE_VECTOR: [127.1, 311.7, 74.7],
  CORONA_OPACITY: {
    HIGH: 0.3,
    MEDIUM: 0.2,
    LOW: 0.15
  },
  PULSE_INTENSITY: 1.0,
  STREAM_INTENSITY: 1.0
} as const;

/**
 * Create inner corona shader with animated plasma-like effects
 */
export function createInnerCoronaShader(qualityLevel: number, coronaLayers: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: coronaLayers >= 2 ? SHADER_CONSTANTS.CORONA_OPACITY.HIGH : SHADER_CONSTANTS.CORONA_OPACITY.MEDIUM },
      pulseIntensity: { value: SHADER_CONSTANTS.PULSE_INTENSITY },
      qualityLevel: { value: qualityLevel }
    },
    vertexShader: `
      uniform float time;
      uniform float pulseIntensity;
      uniform float qualityLevel;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vDisplacement;
      
      // Noise function for plasma displacement
      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
      }
      
      float turbulence(vec3 p, int maxOctaves) {
        float value = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;
        
        int octaves = int(qualityLevel) + 2; // 2-4 octaves based on quality
        octaves = min(octaves, maxOctaves);
        
        for(int i = 0; i < 4; i++) {
          if(i >= octaves) break;
          value += amplitude * abs(noise(p * frequency) - 0.5) * 2.0;
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Create plasma-like vertex displacement with quality-based complexity
        vec3 pos = position;
        float displacement = 0.0;
        
        if(qualityLevel > 0.5) {
          displacement = turbulence(pos * 2.0 + time * 0.5, 4) * 0.1;
          displacement += sin(pos.x * 10.0 + time * 2.0) * 0.02;
          displacement += cos(pos.y * 8.0 + time * 1.5) * 0.02;
          displacement += sin(pos.z * 12.0 + time * 1.8) * 0.015;
        } else {
          // Simplified displacement for low quality
          displacement = sin(pos.x * 5.0 + time * 1.0) * 0.01;
          displacement += cos(pos.y * 4.0 + time * 0.8) * 0.01;
        }
        
        vDisplacement = displacement;
        
        // Apply displacement to position
        pos += normal * displacement;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform float pulseIntensity;
      uniform float qualityLevel;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vDisplacement;
      
      // Noise for plasma effects
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      
      void main() {
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Plasma-like corona effect
        float plasmaNoise = noise(vUv * 8.0 + time * 0.5) * 0.5;
        plasmaNoise += noise(vUv * 16.0 + time * 0.3) * 0.25;
        
        // Pulsing effect based on quality
        float pulse = sin(time * 2.0 + qualityLevel * 3.14159) * 0.1 + 0.9;
        
        // Corona colors - bright yellow-orange
        vec3 coronaColor = vec3(1.0, 0.8, 0.4) * (0.8 + plasmaNoise * 0.4);
        coronaColor *= pulse * pulseIntensity;
        
        // Fade out with distance
        float alpha = (1.0 - pow(distFromCenter, 1.2)) * opacity;
        alpha *= (0.7 + plasmaNoise * 0.6);
        
        gl_FragColor = vec4(coronaColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: 1 // AdditiveBlending
  });
}

/**
 * Create outer corona shader with streaming effects
 */
export function createOuterCoronaShader(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: SHADER_CONSTANTS.CORONA_OPACITY.LOW },
      streamIntensity: { value: SHADER_CONSTANTS.STREAM_INTENSITY }
    },
    vertexShader: `
      uniform float time;
      uniform float streamIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform float streamIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      // Noise for streaming patterns
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      
      void main() {
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Create streaming patterns
        float angle = atan(centeredUv.y, centeredUv.x);
        vec2 streamCoord = vec2(angle * 3.0, distFromCenter * 5.0 - time * 2.0);
        float streamPattern = noise(streamCoord) * 0.7;
        streamPattern += noise(streamCoord * 2.0) * 0.3;
        
        // Radial streaming effect
        float radialStream = sin(distFromCenter * 10.0 - time * 3.0) * 0.5 + 0.5;
        streamPattern *= radialStream * streamIntensity;
        
        // Corona colors - more diffuse and cooler
        vec3 coronaColor = vec3(1.0, 0.6, 0.3) * (0.5 + streamPattern);
        
        // Fade out with distance and apply streaming
        float alpha = (1.0 - pow(distFromCenter, 0.8)) * opacity;
        alpha *= (0.7 + streamPattern * 0.6);
        alpha = clamp(alpha, 0.0, opacity);
        
        gl_FragColor = vec4(coronaColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: 1 // AdditiveBlending
  });
}

/**
 * Create sun surface shader with granulation and activity effects
 */
export function createSunSurfaceShader(
  qualityLevel: number,
  granulationDetail: number,
  activityLevel: number
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1.0 },
      activityLevel: { value: activityLevel },
      granulationDetail: { value: granulationDetail },
      qualityLevel: { value: qualityLevel }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform float activityLevel;
      uniform float granulationDetail;
      uniform float qualityLevel;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      // Enhanced noise functions for solar granulation
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      
      // Performance-aware solar granulation pattern
      float granulation(vec2 uv, float time, float detail) {
        float totalGranulation = 0.0;
        
        if(qualityLevel >= 2.0) {
          // High quality - 4 layers
          vec2 coord1 = uv * 8.0 + vec2(time * 0.03, time * 0.02);
          vec2 coord2 = uv * 16.0 + vec2(time * 0.05, -time * 0.03);
          vec2 coord3 = uv * 32.0 + vec2(-time * 0.04, time * 0.06);
          vec2 coord4 = uv * 64.0 + vec2(time * 0.07, time * 0.04);
          
          totalGranulation = (
            noise(coord1) * 0.4 +
            noise(coord2) * 0.3 +
            noise(coord3) * 0.2 +
            noise(coord4) * 0.1
          ) * detail;
        } else if(qualityLevel >= 1.0) {
          // Medium quality - 2 layers
          vec2 coord1 = uv * 8.0 + vec2(time * 0.03, time * 0.02);
          vec2 coord2 = uv * 16.0 + vec2(time * 0.05, -time * 0.03);
          
          totalGranulation = (
            noise(coord1) * 0.5 +
            noise(coord2) * 0.3
          ) * detail;
        } else {
          // Low quality - 1 layer
          vec2 coord1 = uv * 6.0 + vec2(time * 0.02, time * 0.015);
          totalGranulation = noise(coord1) * 0.6 * detail;
        }
        
        return totalGranulation;
      }
      
      void main() {
        // Calculate distance from center for limb darkening
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Enhanced limb darkening effect
        float limbDarkening = 1.0 - pow(distFromCenter, 1.5);
        limbDarkening = clamp(limbDarkening, 0.2, 1.0);
        
        // Solar granulation patterns
        float granulationPattern = granulation(vUv, time, granulationDetail);
        
        // Realistic solar color temperature variations
        vec3 coreColor = vec3(1.0, 0.98, 0.85);      // Hot white core
        vec3 middleColor = vec3(1.0, 0.85, 0.4);     // Yellow-orange
        vec3 edgeColor = vec3(1.0, 0.5, 0.2);        // Cooler orange-red
        
        // Temperature-based color mixing
        vec3 baseColor;
        if (distFromCenter < 0.3) {
          baseColor = mix(coreColor, middleColor, distFromCenter / 0.3);
        } else if (distFromCenter < 0.7) {
          baseColor = mix(middleColor, edgeColor, (distFromCenter - 0.3) / 0.4);
        } else {
          baseColor = mix(edgeColor, edgeColor * 0.7, (distFromCenter - 0.7) / 0.3);
        }
        
        // Apply granulation texture
        vec3 granulatedColor = baseColor + granulationPattern * 0.12;
        
        // Apply limb darkening
        vec3 finalColor = granulatedColor * limbDarkening;
        
        // Activity-based brightness variation
        float activityBrightness = 1.0 + (activityLevel - 0.5) * 0.25;
        finalColor *= activityBrightness;
        
        // Apply overall intensity
        finalColor *= intensity;
        
        // Ensure minimum brightness for visibility
        finalColor = max(finalColor, vec3(0.1));
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
} 