import React, { Suspense, memo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import Earth from './Earth';
import ISS from './ISS';
import EnhancedISS from './ISS-Enhanced';
import Sun from './Sun';
import FPSMonitor from './FPSMonitor';
import Controls, { ControlsRef } from './Controls';
import { useISS } from '../../state/ISSContext';
import { usePerformance } from '../../state/PerformanceContext';
import { useDevice } from '../../state/DeviceContext';
import { useUI } from '../../state/UIContext';
import { useAdaptivePerformance } from '../../hooks/useAdaptivePerformance';
import { 
  EARTH_DAY_MAP, 
  EARTH_NIGHT_MAP, 
  EARTH_NORMAL_MAP, 
  EARTH_SPECULAR_MAP,
  SUN_SIZE,
  SUN_DISTANCE,
  SUN_INTENSITY
} from '../../utils/constants';
import { getEarthQualitySettings, getStarFieldSettings } from '../../utils/earthQualitySettings';
import { calculateSunPosition } from '../../utils/sunPosition';

interface GlobeProps {
  width?: string;
  height?: string;
  onCameraRotate?: (direction: string, delta: number) => void;
  onZoomChange?: (zoomIn: boolean, delta: number) => void;
}

export interface GlobeRef {
  getControlsRef: () => ControlsRef | null;
}

const Globe = memo(forwardRef<GlobeRef, GlobeProps>(({ 
  width = '100%', 
  height = '100%',
  onCameraRotate,
  onZoomChange
}, ref) => {
  // Add ISS context hook to access earthRotateMode state
  const { state } = useISS();
  
  // Add performance context hook to access performance tier
  const { state: performanceState } = usePerformance();
  
  // Add device context hook to check TV profile
  const { isTVProfile } = useDevice();
  
  // Add UI context hook to check FPS monitor visibility
  const { state: uiState } = useUI();
  
  // Initialize adaptive performance system with more responsive thresholds
  const adaptivePerformance = useAdaptivePerformance({
    enabled: true, // Enable by default
    lowerThreshold: 25, // More responsive - lower from 30 FPS
    upperThreshold: 50, // More responsive - raise above 50 FPS
    cooldownPeriod: 3000, // Shorter cooldown for testing (3 seconds)
    analysisWindow: 2000, // Shorter analysis window (2 seconds)
  });
  
  // Sun position state for dynamic lighting
  const [sunPosition, setSunPosition] = useState<Vector3>(new Vector3(1, 0, 0));
  
  // Controls ref for TV camera navigation
  const controlsRef = useRef<ControlsRef>(null);
  
  // Get star field settings based on performance tier
  const starSettings = getStarFieldSettings(getEarthQualitySettings(performanceState.tier));

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

  // Track previous tier to only log actual changes
  const prevTierRef = useRef<string>(performanceState.tier);
  
  // Monitor performance tier changes for logging (only log actual tier changes)
  useEffect(() => {
    if (prevTierRef.current !== performanceState.tier) {
      console.log(`[Globe] Performance tier changed: ${prevTierRef.current} → ${performanceState.tier}`);
      prevTierRef.current = performanceState.tier;
    }
  }, [performanceState.tier]);

  // Cleanup adaptive performance system on unmount
  useEffect(() => {
    return () => {
      // Only log cleanup in development mode - don't call resetCooldown as it causes setState during unmount
      if (process.env.NODE_ENV === 'development') {
        console.log('[Globe] Adaptive performance system cleaned up');
      }
    };
  }, []); // Empty dependency array to avoid re-creating the cleanup function

  // Expose controls ref for external access
  useImperativeHandle(ref, () => ({
    getControlsRef: () => controlsRef.current,
  }), []);

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
            ref={controlsRef}
            enableZoom={true} 
            enablePan={true}
            dampingFactor={0.05}
            earthRotateMode={state.earthRotateMode}
            tvCameraNavigation={isTVProfile}
            onCameraRotate={onCameraRotate}
            onZoomChange={onZoomChange}
          />
          
          {/* Enhanced star field with quality-based settings */}
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

      {/* FPS Monitor with Adaptive Performance Integration */}
      {uiState.fpsMonitorVisible && (
        <FPSMonitor
          position="top-right"
          warningThreshold={30}
          criticalThreshold={20}
          enableDataExport={true}
          onFPSUpdate={adaptivePerformance.handleFPSUpdate}
        />
      )}
    </div>
  );
}));

Globe.displayName = 'Globe';

export default Globe;
