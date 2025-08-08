import React, { Suspense, memo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import Earth from './Earth';
import ISS from './ISS';
import EnhancedISS from './ISS-Enhanced';
import Sun from './Sun';
import SolarLighting from './SolarLighting';
import Controls from './Controls';
import FPSMonitor from './FPSMonitor';
import { usePerformance } from '../../state/PerformanceContext';
import { useISS } from '../../state/ISSContext';
import { PerformanceManager } from './PerformanceManager';
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
import { getEarthQualitySettings, getStarFieldSettings } from '../../utils/earthQualitySettings';

interface GlobeProps {
  width?: string;
  height?: string;
}

const Globe: React.FC<GlobeProps> = memo(({ 
  width = '100%', 
  height = '100%' 
}) => {
  const { state } = usePerformance();
  const { shadowEnabled, updateInterval } = state.settings;
  const { state: issState } = useISS();
  
  // Get quality settings based on current performance tier
  const qualitySettings = getEarthQualitySettings(state.tier);
  const starSettings = getStarFieldSettings(qualitySettings);
  
  // Sun position state for dynamic lighting
  const [sunPosition, setSunPosition] = useState<Vector3>(new Vector3(1, 0, 0));
  // Solar activity state for dynamic lighting intensity
  const [solarActivity, setSolarActivity] = useState<number>(0.5);

  // Update sun position periodically based on performance tier
  useEffect(() => {
    const updateSunPosition = () => {
      const newSunPosition = calculateSunPosition();
      setSunPosition(newSunPosition);
    };

    updateSunPosition();
    const interval = setInterval(updateSunPosition, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative',
      display: 'block',
      minHeight: '100vh'
    }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        style={{ 
          background: '#000000',
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <Suspense fallback={null}>
          {/* Reduced ambient light for more dramatic day/night contrast */}
          <ambientLight intensity={0.1} color="#404080" />
          
          {/* Enhanced solar lighting system with realistic color temperature and dynamic intensity */}
          <SolarLighting 
            sunPosition={sunPosition}
            solarActivity={solarActivity}
            baseIntensity={SUN_INTENSITY}
            enableShadows={shadowEnabled}
            shadowMapSize={shadowEnabled ? 2048 : 512}
          />
          
          {/* Earth with enhanced textures and day/night cycle */}
          <Earth 
            sunPosition={sunPosition}
            dayTexturePath={EARTH_DAY_MAP}
            nightTexturePath={EARTH_NIGHT_MAP}
            normalMapPath={EARTH_NORMAL_MAP}
            specularMapPath={EARTH_SPECULAR_MAP}
          />
          
          {/* ISS with performance-based quality */}
          {state.tier === 'low' ? (
            <ISS showTrajectory={true} trajectoryLength={150} />
          ) : (
            <EnhancedISS showTrajectory={true} trajectoryLength={300} />
          )}
          
          {/* Sun with realistic appearance and positioning */}
          <Sun 
            sunPosition={sunPosition}
            size={SUN_SIZE}
            distance={SUN_DISTANCE}
            intensity={SUN_INTENSITY}
            visible={true}
            onSolarActivityChange={setSolarActivity}
          />
          
          {/* Enhanced camera controls */}
          <Controls 
            enableZoom={true} 
            enablePan={true}
            dampingFactor={0.05}
            earthRotateMode={issState.earthRotateMode}
          />
          
          {/* Enhanced star field with performance-based appearance */}
          <Stars 
            radius={starSettings.radius} 
            depth={starSettings.depth} 
            count={starSettings.count} 
            factor={starSettings.factor} 
            saturation={starSettings.saturation} 
            fade={true}
            speed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default Globe;
