import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, Vector3, Color } from 'three';

interface SolarLightingProps {
  sunPosition: Vector3;
  solarActivity?: number; // 0-1 scale for solar activity level
  baseIntensity?: number;
  enableShadows?: boolean;
  shadowMapSize?: number;
}

/**
 * Enhanced solar lighting system with realistic color temperature and dynamic intensity
 */
const SolarLighting: React.FC<SolarLightingProps> = ({
  sunPosition,
  solarActivity = 0.5,
  baseIntensity = 2.0,
  enableShadows = true,
  shadowMapSize = 2048
}) => {
  const mainLightRef = useRef<DirectionalLight>(null);
  const rimLightRef = useRef<DirectionalLight>(null);
  const atmosphericLightRef = useRef<DirectionalLight>(null);

  // Realistic solar color temperature (5778K) - manual color values
  const solarColor = new Color(0xfff8dc); // Warm white (cornsilk)
  
  // Atmospheric scattering colors
  const atmosphericColor = new Color(0x87ceeb); // Sky blue for atmosphere
  const rimColor = new Color(0xffa500); // Orange for rim lighting

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Calculate dynamic intensity based on solar activity
    const activityVariation = 0.8 + (solarActivity * 0.4); // 0.8 to 1.2 range
    const timeVariation = 1.0 + Math.sin(time * 0.1) * 0.05; // Subtle time-based variation
    const dynamicIntensity = baseIntensity * activityVariation * timeVariation;
    
    // Update main directional light
    if (mainLightRef.current) {
      mainLightRef.current.position.copy(sunPosition);
      mainLightRef.current.intensity = dynamicIntensity;
      mainLightRef.current.color.copy(solarColor);
      
      // Configure shadow properties for enhanced realism
      if (enableShadows) {
        mainLightRef.current.castShadow = true;
        mainLightRef.current.shadow.mapSize.width = shadowMapSize;
        mainLightRef.current.shadow.mapSize.height = shadowMapSize;
        
        // Optimize shadow camera for Earth-scale scene
        mainLightRef.current.shadow.camera.near = 0.1;
        mainLightRef.current.shadow.camera.far = 200;
        mainLightRef.current.shadow.camera.left = -20;
        mainLightRef.current.shadow.camera.right = 20;
        mainLightRef.current.shadow.camera.top = 20;
        mainLightRef.current.shadow.camera.bottom = -20;
        
        // Enhanced shadow quality
        mainLightRef.current.shadow.bias = -0.0001;
        mainLightRef.current.shadow.normalBias = 0.02;
        mainLightRef.current.shadow.radius = 4;
      }
    }
    
    // Update rim lighting for atmospheric effect
    if (rimLightRef.current) {
      // Position rim light slightly offset from main sun position
      const rimPosition = sunPosition.clone().multiplyScalar(0.8);
      rimLightRef.current.position.copy(rimPosition);
      rimLightRef.current.intensity = dynamicIntensity * 0.3;
      rimLightRef.current.color.copy(rimColor);
    }
    
    // Update atmospheric scattering light
    if (atmosphericLightRef.current) {
      // Position atmospheric light opposite to sun for subtle fill lighting
      const atmosphericPosition = sunPosition.clone().multiplyScalar(-0.2);
      atmosphericLightRef.current.position.copy(atmosphericPosition);
      atmosphericLightRef.current.intensity = dynamicIntensity * 0.15;
      atmosphericLightRef.current.color.copy(atmosphericColor);
    }
  });

  return (
    <>
      {/* Main solar directional light with realistic color temperature */}
      <directionalLight
        ref={mainLightRef}
        position={sunPosition}
        intensity={baseIntensity}
        color={solarColor}
        castShadow={enableShadows}
      />
      
      {/* Rim lighting for atmospheric effect */}
      <directionalLight
        ref={rimLightRef}
        position={sunPosition.clone().multiplyScalar(0.8)}
        intensity={baseIntensity * 0.3}
        color={rimColor}
        castShadow={false}
      />
      
      {/* Atmospheric scattering fill light */}
      <directionalLight
        ref={atmosphericLightRef}
        position={sunPosition.clone().multiplyScalar(-0.2)}
        intensity={baseIntensity * 0.15}
        color={atmosphericColor}
        castShadow={false}
      />
    </>
  );
};

export default SolarLighting;