import React, { Suspense, memo, useState, useEffect, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import Earth from './Earth';
import ISS from './ISS';
import EnhancedISS from './ISS-Enhanced';
import Sun from './Sun';
import Controls, { ControlsRef } from './Controls';
import { useISS } from '../../state/ISSContext';
import { usePerformance } from '../../state/PerformanceContext';
import { 
  EARTH_DAY_MAP, 
  EARTH_NIGHT_MAP, 
  EARTH_NORMAL_MAP, 
  EARTH_SPECULAR_MAP,
  SUN_SIZE,
  SUN_DISTANCE,
  SUN_INTENSITY
} from '../../utils/constants';
import { calculateSunPosition } from '../../utils/sunPosition';

interface GlobeProps {
  width?: string;
  height?: string;
}

const Globe = memo(forwardRef<ControlsRef, GlobeProps>(({ 
  width = '100%', 
  height = '100%' 
}, ref) => {
  // Add ISS context hook to access earthRotateMode state
  const { state } = useISS();
  
  // Add performance context hook to access performance tier
  const { state: performanceState } = usePerformance();
  
  // Sun position state for dynamic lighting
  const [sunPosition, setSunPosition] = useState<Vector3>(new Vector3(1, 0, 0));

  // Update sun position periodically
  useEffect(() => {
    const updateSunPosition = () => {
      const newSunPosition = calculateSunPosition();
      setSunPosition(newSunPosition);
    };

    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={null}>
          {/* Reduced ambient light for more dramatic day/night contrast */}
          <ambientLight intensity={0.1} color="#404080" />
          
          {/* Dynamic directional light positioned at sun location */}
          <directionalLight 
            position={sunPosition}
            intensity={2.0} 
            color="#fff8dc"
            castShadow={performanceState.settings.shadowEnabled}
            shadow-mapSize-width={performanceState.settings.shadowEnabled ? 2048 : 0}
            shadow-mapSize-height={performanceState.settings.shadowEnabled ? 2048 : 0}
          />
          
          {/* Additional rim lighting for atmosphere effect */}
          <directionalLight 
            position={sunPosition.clone().multiplyScalar(-0.3)}
            intensity={0.3} 
            color="#4169e1"
          />
          
          {/* Earth with enhanced textures and day/night cycle */}
          <Earth 
            sunPosition={sunPosition}
            dayTexturePath={EARTH_DAY_MAP}
            nightTexturePath={EARTH_NIGHT_MAP}
            normalMapPath={EARTH_NORMAL_MAP}
            specularMapPath={EARTH_SPECULAR_MAP}
          />
          
          {/* ISS with conditional rendering based on performance tier */}
          {performanceState.tier === 'low' ? (
            <ISS showTrajectory={true} trajectoryLength={performanceState.settings.trailLength} />
          ) : (
            <EnhancedISS showTrajectory={true} trajectoryLength={performanceState.settings.trailLength} />
          )}
          
          {/* Sun with conditional rendering based on performance tier */}
          {performanceState.settings.sunEnabled && (
            <Sun 
              sunPosition={sunPosition}
              size={SUN_SIZE}
              distance={SUN_DISTANCE}
              intensity={SUN_INTENSITY}
              visible={true}
            />
          )}
          
          {/* Enhanced camera controls */}
          <Controls 
            ref={ref}
            enableZoom={true} 
            enablePan={true}
            dampingFactor={0.05}
            earthRotateMode={state.earthRotateMode}
          />
          
          {/* Enhanced star field with conditional rendering based on performance tier */}
          <Stars 
            radius={200} 
            depth={100} 
            count={performanceState.tier === 'low' ? 2000 : performanceState.tier === 'medium' ? 4000 : 8000} 
            factor={6} 
            saturation={0.1} 
            fade={true}
            speed={0.5}
          />
        </Suspense>
      </Canvas>
      
      {/* Enhanced loading indicator */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'none', // Will be shown conditionally when loading
          color: '#ffffff',
          fontSize: '1.2rem',
          fontWeight: '300',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div>Loading Earth...</div>
        <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>
          Initializing day/night cycle
        </div>
      </div>
    </div>
  );
}));

Globe.displayName = 'Globe';

export default Globe;
