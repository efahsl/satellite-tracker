import React, { useRef, memo, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, Mesh, Vector3 } from 'three';
import { 
  EARTH_RADIUS, 
  ROTATION_SPEED
} from '../../utils/constants';
import { usePerformance } from '../../state/PerformanceContext';
import { 
  getEarthQualitySettings,
  getGeometrySegments,
  shouldRenderAtmosphere,
  shouldRenderOuterAtmosphere,
  ATMOSPHERE_CONSTANTS
} from '../../utils/earthQualitySettings';
import { createEarthMaterial } from '../../utils/earthMaterialFactory';

interface EarthProps {
  sunPosition: Vector3;
  dayTexturePath: string;
  nightTexturePath: string;
  normalMapPath?: string;
  specularMapPath?: string;
  rotationEnabled?: boolean;
}

const Earth: React.FC<EarthProps> = memo(({
  sunPosition,
  dayTexturePath,
  nightTexturePath,
  normalMapPath,
  specularMapPath,
  rotationEnabled = false, // Disable rotation to maintain accurate ISS positioning
}) => {
  const { state } = usePerformance();
  const { earthQuality, shadowEnabled, cityEffects } = state.settings;

  // Get quality settings
  const qualitySettings = useMemo(() => 
    getEarthQualitySettings(earthQuality), 
    [earthQuality]
  );

  // Load required textures (always load to maintain hook order)
  const dayMap = useLoader(TextureLoader, dayTexturePath);
  const nightMap = useLoader(TextureLoader, nightTexturePath);
  const normalMap = useLoader(TextureLoader, normalMapPath || dayTexturePath);
  const specularMap = useLoader(TextureLoader, specularMapPath || dayTexturePath);
  
  // Use actual maps only if paths were provided and quality tier allows it
  const actualNormalMap = (normalMapPath && qualitySettings.enableNormalMap) ? normalMap : null;
  const actualSpecularMap = (specularMapPath && qualitySettings.enableSpecularMap) ? specularMap : null;

  // References for rotation animation
  const earthRef = useRef<Mesh>(null);
  const materialRef = useRef<any>(null); // Can be any material type

  // Create Earth material using factory
  const earthMaterial = useMemo(() => 
    createEarthMaterial(
      qualitySettings,
      dayMap,
      nightMap,
      actualNormalMap,
      actualSpecularMap,
      sunPosition,
      cityEffects
    ), 
    [qualitySettings, dayMap, nightMap, actualNormalMap, actualSpecularMap, sunPosition, cityEffects]
  );

  const { camera } = useThree();

  // Update shader uniforms
  useFrame(() => {
    if (rotationEnabled && earthRef.current) {
      earthRef.current.rotation.y += ROTATION_SPEED;
    }
    
    // Only update shader uniforms for high quality tier
    if (materialRef.current && qualitySettings.shaderComplexity === 'high') {
      // Use the world sun direction directly - this ensures lighting always matches sun position
      // The shader will handle the lighting calculation in world space
      const worldSunDirection = sunPosition.clone().normalize();
      
      // Apply automatic Earth rotation if enabled
      if (rotationEnabled && earthRef.current) {
        worldSunDirection.applyAxisAngle(new Vector3(0, 1, 0), -earthRef.current.rotation.y);
      }
      
      // Update the shader uniform with the world sun direction
      materialRef.current.uniforms.sunDirection.value = worldSunDirection;
    }
  });

  return (
    <group>
      {/* Earth sphere with tier-specific material */}
      <mesh ref={earthRef} receiveShadow={true}>
        <sphereGeometry args={[
          EARTH_RADIUS, 
          getGeometrySegments(qualitySettings), 
          getGeometrySegments(qualitySettings)
        ]} />
        <primitive object={earthMaterial} ref={materialRef} />
      </mesh>

      {/* Enhanced atmosphere glow effect (only for medium and high quality) */}
      {shouldRenderAtmosphere(qualitySettings) && (
        <mesh receiveShadow={true}>
          <sphereGeometry args={[
            EARTH_RADIUS + ATMOSPHERE_CONSTANTS.INNER_RADIUS_OFFSET, 
            ATMOSPHERE_CONSTANTS.INNER_SEGMENTS, 
            ATMOSPHERE_CONSTANTS.INNER_SEGMENTS
          ]} />
          <meshPhongMaterial
            color={ATMOSPHERE_CONSTANTS.INNER_COLOR}
            transparent={true}
            opacity={ATMOSPHERE_CONSTANTS.INNER_OPACITY}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Outer atmosphere layer (only for high quality) */}
      {shouldRenderOuterAtmosphere(qualitySettings) && (
        <mesh receiveShadow={true}>
          <sphereGeometry args={[
            EARTH_RADIUS + ATMOSPHERE_CONSTANTS.OUTER_RADIUS_OFFSET, 
            ATMOSPHERE_CONSTANTS.OUTER_SEGMENTS, 
            ATMOSPHERE_CONSTANTS.OUTER_SEGMENTS
          ]} />
          <meshPhongMaterial
            color={ATMOSPHERE_CONSTANTS.OUTER_COLOR}
            transparent={true}
            opacity={ATMOSPHERE_CONSTANTS.OUTER_OPACITY}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
});

export default Earth;
