import React, { useRef, memo, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Mesh,
  Vector3,
  ShaderMaterial,
  Points,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  AdditiveBlending,
  CatmullRomCurve3,
  TubeGeometry,
  Group,
} from "three";
import { usePerformance } from '../../state/PerformanceContext';
import { ParticlePool, globalResourceManager } from "../../utils/ObjectPool";
import OptimizedParticleSystem from "./OptimizedParticleSystem";

interface SunProps {
  sunPosition: Vector3;
  size?: number;
  distance?: number;
  intensity?: number;
  visible?: boolean;
  onSolarActivityChange?: (activity: number) => void;
}

interface SolarFlare {
  id: number;
  position: Vector3;
  direction: Vector3;
  intensity: number;
  age: number;
  maxAge: number;
  particles: Float32Array;
  particleCount: number;
}

interface Prominence {
  id: number;
  startPosition: Vector3;
  endPosition: Vector3;
  controlPoints: Vector3[];
  age: number;
  maxAge: number;
  intensity: number;
}

const Sun: React.FC<SunProps> = memo(
  ({
    sunPosition,
    size = 2.0,
    distance = 50,
    intensity = 1.0,
    visible = true,
    onSolarActivityChange,
  }) => {
    // Use existing performance tier system
    const { state } = usePerformance();
    const { sunEnabled } = state.settings;
    const { tier } = state;
    
    const sunRef = useRef<Mesh>(null);
    const innerCoronaRef = useRef<Mesh>(null);
    const outerCoronaRef = useRef<Mesh>(null);
    const coronaParticlesRef = useRef<Points>(null);
    const rimGlowRef = useRef<Mesh>(null);
    const solarFlaresGroupRef = useRef<Group>(null);
    const prominencesGroupRef = useRef<Group>(null);

    // Performance management - adapt to tier system
    const isPerformanceCritical = tier === 'low';
    const particlePool = useRef<ParticlePool>();
    const currentDistance = useRef(distance);

    // State for dynamic solar activity
    const [solarFlares, setSolarFlares] = useState<SolarFlare[]>([]);
    const [prominences, setProminences] = useState<Prominence[]>([]);
    const [lastFlareTime, setLastFlareTime] = useState(0);
    const [lastProminenceTime, setLastProminenceTime] = useState(0);
    const [currentSolarActivity, setCurrentSolarActivity] = useState(0.5);
    const [targetSolarActivity, setTargetSolarActivity] = useState(0.5);
    const [activityTransitionSpeed, setActivityTransitionSpeed] =
      useState(0.02);
    const currentTimeRef = useRef(0);

    // Enhanced solar activity parameters
    const [granulationSpeed, setGranulationSpeed] = useState(1.0);
    const [convectionIntensity, setConvectionIntensity] = useState(0.5);
    const [surfaceTemperatureVariation, setSurfaceTemperatureVariation] =
      useState(0.3);

    // Initialize particle pool
    useEffect(() => {
      particlePool.current = new ParticlePool(100, 1000);

      return () => {
        // Cleanup will be handled by the pool itself
      };
    }, []);

    // Tier-based quality settings
    const currentQuality = useMemo(() => {
      const baseSettings = {
        particleCount: tier === 'high' ? 2000 : tier === 'medium' ? 1000 : 500,
        coronaLayers: tier === 'high' ? 2 : tier === 'medium' ? 2 : 1,
        shaderComplexity: tier === 'high' ? 'high' : tier === 'medium' ? 'medium' : 'low',
        granulationDetail: tier === 'high' ? 1.0 : tier === 'medium' ? 0.7 : 0.4,
        flareMaxCount: tier === 'high' ? 4 : tier === 'medium' ? 2 : 1,
        prominenceMaxCount: tier === 'high' ? 3 : tier === 'medium' ? 2 : 1,
        animationSpeed: tier === 'high' ? 1.0 : tier === 'medium' ? 0.8 : 0.6,
        enableLOD: true
      };
      
      // Apply distance-based LOD
      const normalizedDistance = Math.max(0, Math.min(1, (currentDistance.current - 10) / 40));
      const lodSettings = { ...baseSettings };
      
      // Reduce particle count with distance
      lodSettings.particleCount = Math.floor(baseSettings.particleCount * (1 - normalizedDistance * 0.7));
      
      // Reduce granulation detail with distance
      lodSettings.granulationDetail = baseSettings.granulationDetail * (1 - normalizedDistance * 0.5);
      
      // Reduce flare count with distance
      lodSettings.flareMaxCount = Math.max(1, Math.floor(baseSettings.flareMaxCount * (1 - normalizedDistance * 0.5)));
      
      // Simplify shader complexity at far distances
      if (normalizedDistance > 0.7 && baseSettings.shaderComplexity === 'high') {
        lodSettings.shaderComplexity = 'medium';
      } else if (normalizedDistance > 0.9 && baseSettings.shaderComplexity === 'medium') {
        lodSettings.shaderComplexity = 'low';
      }
      
      return lodSettings;
    }, [tier, currentDistance.current]);

    // Inner corona shader with animated plasma-like effects using vertex displacement
    const innerCoronaShader = useMemo(() => {
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: currentQuality.coronaLayers >= 2 ? 0.3 : 0.2 },
          pulseIntensity: { value: 1.0 },
          qualityLevel: {
            value:
              currentQuality.shaderComplexity === "high"
                ? 2
                : currentQuality.shaderComplexity === "medium"
                ? 1
                : 0,
          },
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
          displacement = turbulence(pos * 1.5 + time * 0.3, 2) * 0.05;
          displacement += sin(pos.x * 5.0 + time * 1.0) * 0.01;
        }
        
        // Apply pulsing effect
        displacement *= pulseIntensity;
        vDisplacement = displacement;
        
        pos += normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform float opacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vDisplacement;
      
      void main() {
        // Create plasma-like color variations
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Corona color gradient (inner bright to outer dim)
        vec3 innerColor = vec3(1.0, 0.9, 0.6);  // Bright yellow-white
        vec3 outerColor = vec3(1.0, 0.4, 0.1);  // Orange-red
        
        vec3 coronaColor = mix(innerColor, outerColor, distFromCenter);
        
        // Add displacement-based intensity variation
        float intensity = 1.0 + vDisplacement * 3.0;
        coronaColor *= intensity;
        
        // Fade out at edges
        float alpha = (1.0 - distFromCenter) * opacity;
        alpha *= (1.0 + vDisplacement * 2.0);
        alpha = clamp(alpha, 0.0, opacity);
        
        gl_FragColor = vec4(coronaColor, alpha);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, [currentQuality.coronaLayers, currentQuality.shaderComplexity]);

    // Outer corona shader with streaming effects
    const outerCoronaShader = useMemo(() => {
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: 0.15 },
          streamIntensity: { value: 1.0 },
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
        blending: AdditiveBlending,
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, []);

    // Performance-aware corona particle system
    const coronaParticles = useMemo(() => {
      const particleCount = Math.min(currentQuality.particleCount, 2000);
      const geometry = new BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const velocities = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Start particles near the sun surface
        const radius = size * (1.2 + Math.random() * 0.3);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Particle colors (corona-like)
        const colorIntensity = 0.5 + Math.random() * 0.5;
        colors[i3] = colorIntensity; // Red
        colors[i3 + 1] = colorIntensity * 0.6; // Green
        colors[i3 + 2] = colorIntensity * 0.3; // Blue

        // Particle sizes
        sizes[i] = Math.random() * 0.1 + 0.05;

        // Outward velocities for streaming effect
        const direction = new Vector3(
          positions[i3],
          positions[i3 + 1],
          positions[i3 + 2]
        ).normalize();
        const speed = 0.5 + Math.random() * 1.0;
        velocities[i3] = direction.x * speed;
        velocities[i3 + 1] = direction.y * speed;
        velocities[i3 + 2] = direction.z * speed;
      }

      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setAttribute("color", new BufferAttribute(colors, 3));
      geometry.setAttribute("size", new BufferAttribute(sizes, 1));
      geometry.setAttribute("velocity", new BufferAttribute(velocities, 3));

      // Register for cleanup
      globalResourceManager.addGeometry(geometry);

      return geometry;
    }, [size, currentQuality.particleCount]);

    const coronaParticleMaterial = useMemo(() => {
      const material = new PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: isPerformanceCritical ? 0.4 : 0.6,
        vertexColors: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, [isPerformanceCritical]);

    // Solar flare particle material
    const flareParticleMaterial = useMemo(() => {
      const material = new PointsMaterial({
        size: 0.15,
        sizeAttenuation: true,
        transparent: true,
        opacity: isPerformanceCritical ? 0.6 : 0.8,
        vertexColors: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, [isPerformanceCritical]);

    // Prominence material with animated shader
    const prominenceMaterial = useMemo(() => {
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: 0.7 },
          intensity: { value: 1.0 },
        },
        vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vIntensity;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Add subtle animation to prominence
        vec3 pos = position;
        float wave = sin(pos.y * 5.0 + time * 2.0) * 0.02;
        pos.x += wave;
        pos.z += wave * 0.5;
        
        vIntensity = 1.0 + wave * 2.0;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vIntensity;
      
      void main() {
        // Prominence color - hot plasma
        vec3 baseColor = vec3(1.0, 0.3, 0.1); // Orange-red
        vec3 hotColor = vec3(1.0, 0.8, 0.4);  // Yellow-white
        
        // Mix colors based on intensity and position
        float colorMix = vIntensity * 0.5 + sin(time * 3.0) * 0.2;
        vec3 prominenceColor = mix(baseColor, hotColor, colorMix);
        
        // Fade at edges
        float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float alpha = edgeFade * opacity * intensity;
        
        gl_FragColor = vec4(prominenceColor, alpha);
      }
    `,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: 2, // DoubleSide
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, []);

    // Function to create smooth activity state transitions
    const updateActivityTransition = (deltaTime: number) => {
      // Adjust transition speed based on activity difference
      const activityDifference = Math.abs(
        targetSolarActivity - currentSolarActivity
      );
      const baseSpeed = 0.02;
      const adaptiveSpeed = baseSpeed + activityDifference * 0.05;
      setActivityTransitionSpeed(Math.min(adaptiveSpeed, 0.1));
    };

    // Enhanced function to create a new solar flare with activity-based parameters
    const createSolarFlare = (time: number): SolarFlare => {
      // Random position on sun surface, with preference for active regions during high activity
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.random() * Math.PI;

      // During high activity, bias flares toward equatorial regions (more realistic)
      if (currentSolarActivity > 0.6) {
        phi = Math.PI * 0.3 + Math.random() * Math.PI * 0.4; // Bias toward equator
      }

      const surfacePosition = new Vector3(
        size * Math.sin(phi) * Math.cos(theta),
        size * Math.sin(phi) * Math.sin(theta),
        size * Math.cos(phi)
      );

      // Direction pointing outward from surface
      const direction = surfacePosition.clone().normalize();

      // Performance-aware particle count
      const baseParticleCount = isPerformanceCritical ? 75 : 150;
      const maxParticleBonus = isPerformanceCritical ? 200 : 400;
      const activityParticleBonus = Math.floor(
        currentSolarActivity * maxParticleBonus
      );
      const randomBonus = Math.floor(
        Math.random() * (isPerformanceCritical ? 100 : 200)
      );
      const particleCount = Math.min(
        baseParticleCount + activityParticleBonus + randomBonus,
        currentQuality.particleCount * 0.5 // Limit to half of total particle budget
      );

      const particles = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Start particles at surface position with activity-based spread
        const spread = 0.15 + currentSolarActivity * 0.25;
        particles[i3] = surfacePosition.x + (Math.random() - 0.5) * spread;
        particles[i3 + 1] = surfacePosition.y + (Math.random() - 0.5) * spread;
        particles[i3 + 2] = surfacePosition.z + (Math.random() - 0.5) * spread;
      }

      // Activity-based flare characteristics
      const baseIntensity = 0.4 + Math.random() * 0.4;
      const activityIntensityBonus = currentSolarActivity * 0.4;
      const baseDuration = 2.5 + Math.random() * 3.5;
      const activityDurationBonus = currentSolarActivity * 2.0;

      return {
        id: Math.random(),
        position: surfacePosition,
        direction,
        intensity: baseIntensity + activityIntensityBonus,
        age: 0,
        maxAge: baseDuration + activityDurationBonus,
        particles,
        particleCount,
      };
    };

    // Enhanced function to create a new prominence with activity-based parameters
    const createProminence = (time: number): Prominence => {
      // Random start position on sun surface, with activity-based positioning
      let theta1 = Math.random() * Math.PI * 2;
      let phi1 = Math.random() * Math.PI;

      // During high activity, prominences are more likely near active regions
      if (currentSolarActivity > 0.7) {
        // Bias toward solar active latitudes
        phi1 = Math.PI * 0.25 + Math.random() * Math.PI * 0.5;
      }

      const startPosition = new Vector3(
        size * Math.sin(phi1) * Math.cos(theta1),
        size * Math.sin(phi1) * Math.sin(theta1),
        size * Math.cos(phi1)
      );

      // End position nearby on surface - activity affects prominence span
      const spanMultiplier = 0.3 + currentSolarActivity * 0.4; // Larger prominences during high activity
      const theta2 = theta1 + (Math.random() - 0.5) * Math.PI * spanMultiplier;
      const phi2 =
        phi1 + (Math.random() - 0.5) * Math.PI * (spanMultiplier * 0.6);
      const endPosition = new Vector3(
        size * Math.sin(phi2) * Math.cos(theta2),
        size * Math.sin(phi2) * Math.sin(theta2),
        size * Math.cos(phi2)
      );

      // Create arc control points with activity-based height
      const midPoint = startPosition
        .clone()
        .add(endPosition)
        .multiplyScalar(0.5);
      const baseArcHeight = size * (0.25 + Math.random() * 0.35);
      const activityHeightBonus = size * currentSolarActivity * 0.3;
      const arcHeight = baseArcHeight + activityHeightBonus;

      const controlPoint1 = midPoint
        .clone()
        .normalize()
        .multiplyScalar(size + arcHeight * 0.4);
      const controlPoint2 = midPoint
        .clone()
        .normalize()
        .multiplyScalar(size + arcHeight);

      // Activity-based prominence characteristics
      const baseIntensity = 0.3 + Math.random() * 0.5;
      const activityIntensityBonus = currentSolarActivity * 0.3;
      const baseDuration = 6 + Math.random() * 10;
      const activityDurationBonus = currentSolarActivity * 8;

      return {
        id: Math.random(),
        startPosition,
        endPosition,
        controlPoints: [controlPoint1, controlPoint2],
        age: 0,
        maxAge: baseDuration + activityDurationBonus,
        intensity: baseIntensity + activityIntensityBonus,
      };
    };

    // Custom shader for realistic sun surface with enhanced granulation and limb darkening
    const sunShaderMaterial = useMemo(() => {
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: intensity },
          activityLevel: { value: 0.5 },
          granulationSpeed: { value: 1.0 },
          convectionIntensity: { value: 0.5 },
          temperatureVariation: { value: 0.3 },
          surfaceAnimationPhase: { value: 0.0 },
          qualityLevel: {
            value:
              currentQuality.shaderComplexity === "high"
                ? 2
                : currentQuality.shaderComplexity === "medium"
                ? 1
                : 0,
          },
          granulationDetail: { value: currentQuality.granulationDetail },
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
      uniform float granulationSpeed;
      uniform float convectionIntensity;
      uniform float temperatureVariation;
      uniform float surfaceAnimationPhase;
      uniform float qualityLevel;
      uniform float granulationDetail;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      // Enhanced noise functions for solar granulation
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float hash3(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
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
      
      float noise3d(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(
            mix(hash3(i + vec3(0.0, 0.0, 0.0)), hash3(i + vec3(1.0, 0.0, 0.0)), u.x),
            mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), u.x),
            u.y
          ),
          mix(
            mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), u.x),
            mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), u.x),
            u.y
          ),
          u.z
        );
      }
      
      // Fractal Brownian Motion for complex surface patterns
      float fbm(vec2 p, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 6; i++) {
          if(i >= octaves) break;
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      float fbm3d(vec3 p, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 4; i++) {
          if(i >= octaves) break;
          value += amplitude * noise3d(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      // Performance-aware solar granulation pattern with time-based animation
      float granulation(vec2 uv, float time, float speed, float intensity) {
        float totalGranulation = 0.0;
        
        // Quality-based granulation layers
        if(qualityLevel >= 2.0) {
          // High quality - 4 layers
          vec2 coord1 = uv * 8.0 + vec2(time * speed * 0.03, time * speed * 0.02);
          vec2 coord2 = uv * 16.0 + vec2(time * speed * 0.05, -time * speed * 0.03);
          vec2 coord3 = uv * 32.0 + vec2(-time * speed * 0.04, time * speed * 0.06);
          vec2 coord4 = uv * 64.0 + vec2(time * speed * 0.07, time * speed * 0.04);
          
          float gran1 = fbm(coord1, 4) * 0.4;  // Large granules
          float gran2 = fbm(coord2, 3) * 0.3;  // Medium granules
          float gran3 = fbm(coord3, 2) * 0.2;  // Small granules
          float gran4 = fbm(coord4, 2) * 0.1;  // Fine detail
          
          totalGranulation = (gran1 + gran2 + gran3 + gran4) * intensity * granulationDetail;
        } else if(qualityLevel >= 1.0) {
          // Medium quality - 2 layers
          vec2 coord1 = uv * 8.0 + vec2(time * speed * 0.03, time * speed * 0.02);
          vec2 coord2 = uv * 16.0 + vec2(time * speed * 0.05, -time * speed * 0.03);
          
          float gran1 = fbm(coord1, 3) * 0.5;  // Large granules
          float gran2 = fbm(coord2, 2) * 0.3;  // Medium granules
          
          totalGranulation = (gran1 + gran2) * intensity * granulationDetail;
        } else {
          // Low quality - 1 layer
          vec2 coord1 = uv * 6.0 + vec2(time * speed * 0.02, time * speed * 0.015);
          float gran1 = fbm(coord1, 2) * 0.6;  // Basic granulation
          
          totalGranulation = gran1 * intensity * granulationDetail;
        }
        
        // Add time-based pulsing to simulate convection cells (simplified for low quality)
        float pulsePhase = time * speed * 0.8 + surfaceAnimationPhase;
        float convectionPulse = qualityLevel >= 1.0 ? 
          sin(pulsePhase) * 0.1 + cos(pulsePhase * 1.3) * 0.05 :
          sin(pulsePhase) * 0.05;
        
        return totalGranulation + convectionPulse;
      }
      
      // Surface convection animation using 3D noise
      float convectionPattern(vec3 worldPos, float time, float intensity) {
        // Create slow-moving convection cells
        vec3 convectionCoord = worldPos * 3.0 + vec3(0.0, 0.0, time * 0.1);
        float convection = fbm3d(convectionCoord, 3);
        
        // Add faster surface turbulence
        vec3 turbulenceCoord = worldPos * 12.0 + vec3(time * 0.2, time * 0.15, time * 0.18);
        float turbulence = fbm3d(turbulenceCoord, 2) * 0.3;
        
        // Combine convection patterns
        float totalConvection = (convection + turbulence) * intensity;
        
        // Add subtle pulsing based on activity level
        float activityPulse = sin(time * 0.5 + activityLevel * 3.14159) * 0.1;
        
        return totalConvection + activityPulse;
      }
      
      // Enhanced sunspot simulation with activity-based variation
      float sunspots(vec2 uv, float time, float activity) {
        // Sunspot frequency and intensity based on solar activity
        float spotFrequency = 4.0 + activity * 4.0;  // More spots during high activity
        vec2 spotCoord = uv * spotFrequency + vec2(time * 0.008, time * 0.005);
        float spots = fbm(spotCoord, 3);
        
        // Activity affects sunspot threshold and intensity
        float spotThreshold = 0.65 - activity * 0.1;  // Lower threshold = more spots
        float spotIntensity = 0.3 + activity * 0.2;   // Higher intensity during active periods
        
        return smoothstep(spotThreshold, spotThreshold + 0.15, spots) * spotIntensity;
      }
      
      // Temperature variation based on activity and surface features
      float temperatureVariation(vec2 uv, float time, float activity, float granulationValue) {
        // Base temperature variation
        float tempVar = sin(uv.x * 6.28318 + time * 0.1) * cos(uv.y * 6.28318 + time * 0.08);
        tempVar *= temperatureVariation;
        
        // Activity affects temperature distribution
        float activityTemp = activity * 0.2 * sin(time * 0.3 + uv.x * 3.14159);
        
        // Granulation affects local temperature
        float granulationTemp = granulationValue * 0.15;
        
        return tempVar + activityTemp + granulationTemp;
      }
      
      void main() {
        // Calculate distance from center for limb darkening
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Enhanced limb darkening effect (realistic solar physics)
        float limbDarkening = 1.0 - pow(distFromCenter, 1.5);
        limbDarkening = clamp(limbDarkening, 0.2, 1.0);
        
        // Enhanced solar granulation patterns with time-based animation
        float granulationPattern = granulation(vUv, time, granulationSpeed, 1.0);
        
        // Surface convection animation
        float convectionPattern = convectionPattern(vWorldPosition, time, convectionIntensity);
        
        // Activity-based sunspot effects
        float sunspotEffect = sunspots(vUv, time, activityLevel);
        
        // Temperature variation effects
        float tempVariation = temperatureVariation(vUv, time, activityLevel, granulationPattern);
        
        // Realistic solar color temperature variations
        // Center: ~5778K (white-yellow), Edge: ~4500K (orange-red)
        vec3 coreColor = vec3(1.0, 0.98, 0.85);      // Hot white core
        vec3 middleColor = vec3(1.0, 0.85, 0.4);     // Yellow-orange
        vec3 edgeColor = vec3(1.0, 0.5, 0.2);        // Cooler orange-red
        vec3 sunspotColor = vec3(0.3, 0.15, 0.1);    // Dark sunspots
        vec3 hotSpotColor = vec3(1.0, 1.0, 0.9);     // Hot convection areas
        
        // Temperature-based color mixing with enhanced transitions
        vec3 baseColor;
        if (distFromCenter < 0.3) {
          baseColor = mix(coreColor, middleColor, distFromCenter / 0.3);
        } else if (distFromCenter < 0.7) {
          baseColor = mix(middleColor, edgeColor, (distFromCenter - 0.3) / 0.4);
        } else {
          baseColor = mix(edgeColor, edgeColor * 0.7, (distFromCenter - 0.7) / 0.3);
        }
        
        // Apply temperature variation to base color
        vec3 tempAdjustedColor = baseColor;
        if (tempVariation > 0.0) {
          tempAdjustedColor = mix(baseColor, hotSpotColor, tempVariation * 0.3);
        } else {
          tempAdjustedColor = mix(baseColor, baseColor * 0.8, abs(tempVariation) * 0.2);
        }
        
        // Apply granulation texture with enhanced detail
        vec3 granulatedColor = tempAdjustedColor + granulationPattern * 0.12;
        
        // Apply convection pattern effects
        granulatedColor += convectionPattern * 0.08;
        
        // Apply sunspot darkening
        granulatedColor = mix(granulatedColor, sunspotColor, sunspotEffect);
        
        // Apply limb darkening
        vec3 finalColor = granulatedColor * limbDarkening;
        
        // Enhanced activity-based brightness variation with smooth transitions
        float activityBrightness = 1.0 + (activityLevel - 0.5) * 0.25;
        
        // Add subtle pulsing based on solar activity
        float activityPulse = sin(time * 0.4 + activityLevel * 6.28318) * 0.03 * activityLevel;
        activityBrightness += activityPulse;
        
        finalColor *= activityBrightness;
        
        // Apply overall intensity
        finalColor *= intensity;
        
        // Ensure minimum brightness for visibility
        finalColor = max(finalColor, vec3(0.1));
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
      });

      // Register for cleanup
      globalResourceManager.addMaterial(material);

      return material;
    }, [
      intensity,
      currentQuality.shaderComplexity,
      currentQuality.granulationDetail,
    ]);

    // Update animation and position
    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      const deltaTime = state.clock.getDelta();
      currentTimeRef.current = time;

      // Update distance for LOD calculations
      if (state.camera) {
        const sunWorldPosition = sunPosition
          .clone()
          .normalize()
          .multiplyScalar(distance);
        currentDistance.current =
          state.camera.position.distanceTo(sunWorldPosition);
      }

      // Update activity transition smoothing
      updateActivityTransition(deltaTime);

      // Position sun at calculated position
      const normalizedPosition = sunPosition
        .clone()
        .normalize()
        .multiplyScalar(distance);

      // Calculate dynamic solar activity with smooth transitions
      const baseActivityCycle = 0.5 + Math.sin(time * 0.05) * 0.2; // Long-term cycle (20s period)
      const mediumActivityCycle = Math.sin(time * 0.15) * 0.15; // Medium-term variation (6.7s period)
      const shortActivityCycle = Math.sin(time * 0.8) * 0.05; // Short-term fluctuation (1.25s period)

      // Combine activity cycles for realistic solar behavior
      const calculatedTargetActivity = Math.max(
        0.1,
        Math.min(
          0.9,
          baseActivityCycle + mediumActivityCycle + shortActivityCycle
        )
      );

      // Update target activity with some randomness
      if (Math.abs(calculatedTargetActivity - targetSolarActivity) > 0.1) {
        setTargetSolarActivity(calculatedTargetActivity);
      }

      // Smooth transition to target activity level
      const activityDifference = targetSolarActivity - currentSolarActivity;
      const smoothedActivity =
        currentSolarActivity + activityDifference * activityTransitionSpeed;

      if (Math.abs(activityDifference) > 0.01) {
        setCurrentSolarActivity(smoothedActivity);
      }

      // Update granulation and convection parameters based on activity
      const newGranulationSpeed = 0.8 + currentSolarActivity * 0.4; // 0.8 to 1.2
      const newConvectionIntensity = 0.3 + currentSolarActivity * 0.4; // 0.3 to 0.7
      const newTemperatureVariation = 0.2 + currentSolarActivity * 0.3; // 0.2 to 0.5

      setGranulationSpeed(newGranulationSpeed);
      setConvectionIntensity(newConvectionIntensity);
      setSurfaceTemperatureVariation(newTemperatureVariation);

      // Performance-aware solar flare generation based on activity level
      const activityBasedFlareInterval =
        8 -
        currentSolarActivity * 6 +
        Math.random() * (12 - currentSolarActivity * 8);
      const baseMaxFlares = Math.floor(1 + currentSolarActivity * 3); // 1-4 flares based on activity
      const maxFlares = Math.min(baseMaxFlares, currentQuality.flareMaxCount);

      // Reduce flare frequency if performance is critical
      const flarePerformanceMultiplier = isPerformanceCritical ? 2.0 : 1.0;
      const adjustedFlareInterval =
        activityBasedFlareInterval * flarePerformanceMultiplier;

      if (
        time - lastFlareTime > adjustedFlareInterval &&
        solarFlares.length < maxFlares
      ) {
        const newFlare = createSolarFlare(time);
        // Enhance flare intensity based on current activity
        newFlare.intensity *= 0.7 + currentSolarActivity * 0.6;
        setSolarFlares((prev) => [...prev, newFlare]);
        setLastFlareTime(time);
      }

      // Performance-aware prominence generation based on activity level
      const activityBasedProminenceInterval =
        20 -
        currentSolarActivity * 10 +
        Math.random() * (25 - currentSolarActivity * 15);
      const baseMaxProminences = Math.floor(1 + currentSolarActivity * 2); // 1-3 prominences based on activity
      const maxProminences = Math.min(
        baseMaxProminences,
        currentQuality.prominenceMaxCount
      );

      // Reduce prominence frequency if performance is critical
      const prominencePerformanceMultiplier = isPerformanceCritical ? 1.5 : 1.0;
      const adjustedProminenceInterval =
        activityBasedProminenceInterval * prominencePerformanceMultiplier;

      if (
        time - lastProminenceTime > adjustedProminenceInterval &&
        prominences.length < maxProminences
      ) {
        const newProminence = createProminence(time);
        // Enhance prominence intensity and duration based on activity
        newProminence.intensity *= 0.6 + currentSolarActivity * 0.7;
        newProminence.maxAge *= 0.8 + currentSolarActivity * 0.4;
        setProminences((prev) => [...prev, newProminence]);
        setLastProminenceTime(time);
      }

      // Update solar flares
      setSolarFlares((prevFlares) => {
        return prevFlares
          .map((flare) => {
            const updatedFlare = { ...flare };
            updatedFlare.age += 0.016; // Increment age by frame time

            // Update flare particles
            const deltaTime = 0.016; // Approximate frame time
            for (let i = 0; i < flare.particleCount; i++) {
              const i3 = i * 3;
              const speed = 2 + Math.random() * 3; // Particle speed
              const spread = 0.5 + Math.random() * 0.5; // Directional spread

              // Move particles outward with some randomness
              const direction = flare.direction.clone();
              direction.x += (Math.random() - 0.5) * spread;
              direction.y += (Math.random() - 0.5) * spread;
              direction.z += (Math.random() - 0.5) * spread;
              direction.normalize();

              updatedFlare.particles[i3] += direction.x * speed * deltaTime;
              updatedFlare.particles[i3 + 1] += direction.y * speed * deltaTime;
              updatedFlare.particles[i3 + 2] += direction.z * speed * deltaTime;
            }

            return updatedFlare;
          })
          .filter((flare) => flare.age < flare.maxAge); // Remove expired flares
      });

      // Update prominences
      setProminences((prevProminences) => {
        return prevProminences
          .map((prominence) => {
            const updatedProminence = { ...prominence };
            updatedProminence.age += 0.016; // Increment age by frame time
            return updatedProminence;
          })
          .filter((prominence) => prominence.age < prominence.maxAge); // Remove expired prominences
      });

      if (sunRef.current) {
        sunRef.current.position.copy(normalizedPosition);
        // Add subtle rotation for surface animation
        sunRef.current.rotation.y = time * 0.02;
        sunRef.current.rotation.x = time * 0.01;
      }

      // Inner corona with pulsing and rotation
      if (innerCoronaRef.current) {
        innerCoronaRef.current.position.copy(normalizedPosition);
        innerCoronaRef.current.rotation.z = time * 0.05; // Subtle rotation
        innerCoronaRef.current.rotation.y = time * 0.03;
      }

      // Outer corona with different rotation speed
      if (outerCoronaRef.current) {
        outerCoronaRef.current.position.copy(normalizedPosition);
        outerCoronaRef.current.rotation.z = -time * 0.02; // Counter-rotation
        outerCoronaRef.current.rotation.x = time * 0.015;
      }

      // Corona particles streaming effect
      if (coronaParticlesRef.current) {
        coronaParticlesRef.current.position.copy(normalizedPosition);

        // Update particle positions for streaming effect
        const positions = coronaParticles.attributes.position
          .array as Float32Array;
        const velocities = coronaParticles.attributes.velocity
          .array as Float32Array;
        const colors = coronaParticles.attributes.color.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
          // Move particles outward
          positions[i] += velocities[i] * 0.02;
          positions[i + 1] += velocities[i + 1] * 0.02;
          positions[i + 2] += velocities[i + 2] * 0.02;

          // Calculate distance from center
          const distance = Math.sqrt(
            positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
          );

          // Reset particles that have moved too far
          if (distance > size * 4) {
            const radius = size * (1.2 + Math.random() * 0.3);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);

            // Reset color intensity
            const colorIntensity = 0.5 + Math.random() * 0.5;
            colors[(i / 3) * 3] = colorIntensity;
            colors[(i / 3) * 3 + 1] = colorIntensity * 0.6;
            colors[(i / 3) * 3 + 2] = colorIntensity * 0.3;
          } else {
            // Fade particles as they move away
            const fadeDistance = size * 3;
            const fadeFactor = Math.max(
              0,
              1 - (distance - size * 1.5) / fadeDistance
            );
            const baseIntensity = 0.5 + Math.random() * 0.5;
            colors[(i / 3) * 3] = baseIntensity * fadeFactor;
            colors[(i / 3) * 3 + 1] = baseIntensity * 0.6 * fadeFactor;
            colors[(i / 3) * 3 + 2] = baseIntensity * 0.3 * fadeFactor;
          }
        }

        coronaParticles.attributes.position.needsUpdate = true;
        coronaParticles.attributes.color.needsUpdate = true;
      }

      if (rimGlowRef.current) {
        rimGlowRef.current.position.copy(normalizedPosition);
      }

      // Position solar flares and prominences groups
      if (solarFlaresGroupRef.current) {
        solarFlaresGroupRef.current.position.copy(normalizedPosition);
      }

      if (prominencesGroupRef.current) {
        prominencesGroupRef.current.position.copy(normalizedPosition);
      }

      // Update shader uniforms with enhanced parameters
      sunShaderMaterial.uniforms.time.value = time;
      sunShaderMaterial.uniforms.intensity.value = intensity;
      sunShaderMaterial.uniforms.activityLevel.value = currentSolarActivity;
      sunShaderMaterial.uniforms.granulationSpeed.value = granulationSpeed;
      sunShaderMaterial.uniforms.convectionIntensity.value =
        convectionIntensity;
      sunShaderMaterial.uniforms.temperatureVariation.value =
        surfaceTemperatureVariation;
      sunShaderMaterial.uniforms.surfaceAnimationPhase.value =
        time * 0.3 + currentSolarActivity * 2.0;

      // Update corona shader uniforms with activity-based variations
      innerCoronaShader.uniforms.time.value = time;
      outerCoronaShader.uniforms.time.value = time;

      // Enhanced pulsing effect based on solar activity
      const activityBasedPulse =
        0.7 +
        currentSolarActivity * 0.4 +
        Math.sin(time * (1.2 + currentSolarActivity * 0.8)) * 0.15;
      innerCoronaShader.uniforms.pulseIntensity.value = activityBasedPulse;
      outerCoronaShader.uniforms.streamIntensity.value = activityBasedPulse;

      // Enhanced corona opacity based on activity
      const activityBasedOpacity = 0.25 + currentSolarActivity * 0.15;
      innerCoronaShader.uniforms.opacity.value = activityBasedOpacity;
      outerCoronaShader.uniforms.opacity.value = activityBasedOpacity * 0.6;

      // Notify parent component of activity changes
      if (onSolarActivityChange) {
        onSolarActivityChange(currentSolarActivity);
      }
    });

    // Cleanup resources on unmount
    useEffect(() => {
      return () => {
        // Resources are automatically cleaned up by the global resource manager
        // Individual cleanup is handled when materials/geometries are removed from the manager

        // Clean up any remaining active particles
        if (particlePool.current) {
          // Pool cleanup is handled by the pool itself
        }

        // Clear flare and prominence arrays to help with garbage collection
        setSolarFlares([]);
        setProminences([]);
      };
    }, []);

    if (!visible || !sunEnabled) return null;

    return (
      <group>
        {/* Main realistic sun sphere with enhanced geometry */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[size, 128, 128]} />
          <primitive object={sunShaderMaterial} />
        </mesh>

        {/* Bright rim glow - very close to surface */}
        <mesh ref={rimGlowRef}>
          <sphereGeometry args={[size * 1.05, 32, 32]} />
          <meshBasicMaterial
            color="#ffeb3b"
            transparent={true}
            opacity={0.4}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>

        {/* Inner corona layer with animated plasma-like effects */}
        <mesh ref={innerCoronaRef} renderOrder={1}>
          <sphereGeometry args={[size * 1.3, 64, 64]} />
          <primitive object={innerCoronaShader} />
        </mesh>

        {/* Outer corona layer with streaming particle effects */}
        <mesh ref={outerCoronaRef} renderOrder={2}>
          <sphereGeometry args={[size * 1.8, 48, 48]} />
          <primitive object={outerCoronaShader} />
        </mesh>

        {/* Corona particle system for streaming effects */}
        <points ref={coronaParticlesRef} renderOrder={3}>
          <primitive object={coronaParticles} />
          <primitive object={coronaParticleMaterial} />
        </points>

        {/* Solar flares group */}
        <group ref={solarFlaresGroupRef}>
          {solarFlares.map((flare) => {
            // Create geometry for this flare
            const flareGeometry = new BufferGeometry();
            const colors = new Float32Array(flare.particleCount * 3);
            const sizes = new Float32Array(flare.particleCount);

            // Calculate fade based on age
            const ageFactor = 1 - flare.age / flare.maxAge;
            const intensityFactor = flare.intensity * ageFactor;

            for (let i = 0; i < flare.particleCount; i++) {
              const i3 = i * 3;
              // Flare colors - bright white to orange-red
              const colorIntensity =
                intensityFactor * (0.7 + Math.random() * 0.3);
              colors[i3] = colorIntensity; // Red
              colors[i3 + 1] = colorIntensity * 0.8; // Green
              colors[i3 + 2] = colorIntensity * 0.4; // Blue

              // Particle sizes with variation
              sizes[i] = (0.1 + Math.random() * 0.2) * intensityFactor;
            }

            flareGeometry.setAttribute(
              "position",
              new BufferAttribute(flare.particles, 3)
            );
            flareGeometry.setAttribute("color", new BufferAttribute(colors, 3));
            flareGeometry.setAttribute("size", new BufferAttribute(sizes, 1));

            return (
              <points key={flare.id} renderOrder={4}>
                <primitive object={flareGeometry} />
                <primitive object={flareParticleMaterial} />
              </points>
            );
          })}
        </group>

        {/* Prominences group */}
        <group ref={prominencesGroupRef}>
          {prominences.map((prominence) => {
            // Create curved path for prominence
            const curve = new CatmullRomCurve3([
              prominence.startPosition,
              ...prominence.controlPoints,
              prominence.endPosition,
            ]);

            // Create tube geometry along the curve
            const tubeGeometry = new TubeGeometry(curve, 32, 0.05, 8, false);

            // Calculate fade based on age
            const ageFactor = 1 - prominence.age / prominence.maxAge;
            const currentIntensity = prominence.intensity * ageFactor;

            // Clone material with current intensity
            const currentMaterial = prominenceMaterial.clone();
            currentMaterial.uniforms.intensity.value = currentIntensity;
            currentMaterial.uniforms.time.value = currentTimeRef.current;

            return (
              <mesh key={prominence.id} renderOrder={5}>
                <primitive object={tubeGeometry} />
                <primitive object={currentMaterial} />
              </mesh>
            );
          })}
        </group>
      </group>
    );
  }
);

export default Sun;
