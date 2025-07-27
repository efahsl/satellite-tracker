import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useISS } from '../../state/ISSContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { EARTH_RADIUS, CAMERA_DISTANCE, ISS_ALTITUDE_SCALE } from '../../utils/constants';

interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
}

const Controls: React.FC<ControlsProps> = ({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.1,
}) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { state } = useISS();
  const cameraPositionRef = useRef<Vector3>(new Vector3(0, 0, CAMERA_DISTANCE));
  const lastFollowState = useRef<boolean>(false);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Follow ISS if enabled
  useFrame(() => {
    if (!controlsRef.current || !state.position) return;
    
    const { latitude, longitude, altitude } = state.position;
    const scaledAltitude = EARTH_RADIUS + altitude * ISS_ALTITUDE_SCALE;
    const [x, y, z] = latLongToVector3(latitude, longitude, scaledAltitude);
    const issPosition = new Vector3(x, y, z);
    
    if (state.followISS) {
      // Always keep the target at Earth center (0,0,0)
      controlsRef.current.target.set(0, 0, 0);
      
      // Calculate direction from Earth center to ISS
      const earthToIss = issPosition.clone().normalize();
      
      // Calculate distance from Earth center to ISS
      const issDistance = issPosition.length();
      
      // Position camera beyond the ISS along the same Earth-to-ISS line
      // This ensures the ISS is between the camera and Earth center
      const cameraDistance = issDistance * 1.8; // Adjust this multiplier to change the camera distance
      const cameraPos = earthToIss.clone().multiplyScalar(cameraDistance);
      
      // Smoothly move camera to new position
      cameraPositionRef.current.lerp(cameraPos, 0.05);
      camera.position.copy(cameraPositionRef.current);
      
      // If we just switched to follow mode, ensure camera is looking at Earth center
      if (!lastFollowState.current) {
        camera.lookAt(0, 0, 0);
      }
    } else {
      // When not following ISS, maintain default position
      if (lastFollowState.current) {
        // Smoothly transition back to a default position
        const defaultPos = new Vector3(0, 0, CAMERA_DISTANCE);
        cameraPositionRef.current.lerp(defaultPos, 0.05);
        camera.position.copy(cameraPositionRef.current);
      }
    }
    
    // Update last follow state
    lastFollowState.current = state.followISS;
    
    // Update controls
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={EARTH_RADIUS + 0.5}
      maxDistance={CAMERA_DISTANCE * 2}
    />
  );
};

export default Controls;
