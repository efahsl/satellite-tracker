import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useISS } from '../../state/ISSContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { 
  EARTH_RADIUS, 
  CAMERA_DISTANCE, 
  ISS_ALTITUDE_SCALE, 
  EARTH_ROTATE_DISTANCE, 
  EARTH_ROTATE_SPEED, 
  EARTH_ROTATE_TRANSITION_SPEED,
  TV_DPAD_CONFIG,
  CARDINAL_DIRECTIONS
} from '../../utils/constants';

interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  earthRotateMode?: boolean;
  tvDpadMode?: boolean;
  targetDirection?: keyof typeof CARDINAL_DIRECTIONS | null;
  zoomLevel?: number;
}

const Controls: React.FC<ControlsProps> = ({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.1,
  earthRotateMode = false,
  tvDpadMode = false,
  targetDirection = null,
  zoomLevel = CAMERA_DISTANCE,
}) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { state } = useISS();
  const cameraPositionRef = useRef<Vector3>(new Vector3(0, 0, CAMERA_DISTANCE));
  const lastFollowState = useRef<boolean>(false);
  const lastEarthRotateState = useRef<boolean>(false);
  const earthRotateAngle = useRef<number>(0);
  
  // D-pad camera control refs
  const targetDirectionRef = useRef<keyof typeof CARDINAL_DIRECTIONS | null>(null);
  const rotationProgressRef = useRef<number>(0);
  const targetZoomRef = useRef<number | null>(null);
  const isRotatingRef = useRef<boolean>(false);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Handle target direction changes
  useEffect(() => {
    if (targetDirection && targetDirection !== targetDirectionRef.current) {
      targetDirectionRef.current = targetDirection;
      rotationProgressRef.current = 0;
      isRotatingRef.current = true;
    }
  }, [targetDirection]);

  // Handle zoom level changes
  useEffect(() => {
    if (zoomLevel !== targetZoomRef.current) {
      targetZoomRef.current = zoomLevel;
    }
  }, [zoomLevel]);

  // Cleanup animation references on unmount
  useEffect(() => {
    return () => {
      // Reset rotation angle on cleanup
      earthRotateAngle.current = 0;
      rotationProgressRef.current = 0;
      isRotatingRef.current = false;
    };
  }, []);

  // Camera control logic
  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    
    // Get ISS position if available
    let issPosition: Vector3 | null = null;
    if (state.position) {
      const { latitude, longitude, altitude } = state.position;
      const scaledAltitude = EARTH_RADIUS + altitude * ISS_ALTITUDE_SCALE;
      const [x, y, z] = latLongToVector3(latitude, longitude, scaledAltitude);
      issPosition = new Vector3(x, y, z);
    }
    
    // Handle D-pad camera rotation
    if (tvDpadMode && targetDirectionRef.current && !isRotatingRef.current) {
      // Start rotation
      isRotatingRef.current = true;
      rotationProgressRef.current = 0;
    }
    
    if (tvDpadMode && targetDirectionRef.current && isRotatingRef.current) {
      // Always keep the target at Earth center (0,0,0)
      controlsRef.current.target.set(0, 0, 0);
      
      // Get target direction coordinates
      const targetCoords = CARDINAL_DIRECTIONS[targetDirectionRef.current];
      
      // Calculate target camera position
      const targetPos = new Vector3(
        Math.cos((targetCoords.longitude * Math.PI) / 180) * targetCoords.distance,
        0,
        Math.sin((targetCoords.longitude * Math.PI) / 180) * targetCoords.distance
      );
      
      // Update rotation progress
      rotationProgressRef.current += TV_DPAD_CONFIG.ROTATION_SPEED;
      
      if (rotationProgressRef.current >= 1) {
        // Rotation complete
        rotationProgressRef.current = 1;
        isRotatingRef.current = false;
        targetDirectionRef.current = null;
      }
      
      // Smooth transition to target position
      cameraPositionRef.current.lerp(targetPos, TV_DPAD_CONFIG.ROTATION_SPEED);
      camera.position.copy(cameraPositionRef.current);
      
      // Ensure camera is looking at Earth center
      camera.lookAt(0, 0, 0);
      
    } else if (tvDpadMode) {
      // In TV D-pad mode, always override OrbitControls
      controlsRef.current.target.set(0, 0, 0);
      
      if (!targetDirectionRef.current && !targetZoomRef.current) {
        // When not actively controlling, sync camera position reference
        cameraPositionRef.current.copy(camera.position);
      }
      
    } else if (earthRotateMode) {
      // Always keep the target at Earth center (0,0,0)
      controlsRef.current.target.set(0, 0, 0);
      
      // Update rotation angle
      earthRotateAngle.current += EARTH_ROTATE_SPEED * delta;
      
      // Calculate camera position in equatorial orbit
      const x = Math.cos(earthRotateAngle.current) * EARTH_ROTATE_DISTANCE;
      const z = Math.sin(earthRotateAngle.current) * EARTH_ROTATE_DISTANCE;
      const y = 0; // Keep at equatorial level
      
      const targetPos = new Vector3(x, y, z);
      
      // Smooth transition to Earth rotate position
      cameraPositionRef.current.lerp(targetPos, EARTH_ROTATE_TRANSITION_SPEED);
      camera.position.copy(cameraPositionRef.current);
      
      // Ensure camera is looking at Earth center
      camera.lookAt(0, 0, 0);
      
    } else if (state.followISS && issPosition) {
      // Follow ISS mode
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
      // Manual/default mode - maintain default position when transitioning from other modes
      if (lastFollowState.current || lastEarthRotateState.current) {
        // Smoothly transition back to a default position
        const defaultPos = new Vector3(0, 0, CAMERA_DISTANCE);
        cameraPositionRef.current.lerp(defaultPos, 0.05);
        camera.position.copy(cameraPositionRef.current);
      }
    }
    
    // Handle D-pad zoom
    if (tvDpadMode && targetZoomRef.current !== null) {
      const currentDistance = cameraPositionRef.current.length();
      const targetDistance = targetZoomRef.current;
      const distanceDiff = Math.abs(targetDistance - currentDistance);
      
      // Only zoom if we're not already close enough to the target
      if (distanceDiff > 0.1) {
        // Calculate zoom direction
        const zoomDirection = cameraPositionRef.current.clone().normalize();
        const newDistance = currentDistance + (targetDistance - currentDistance) * TV_DPAD_CONFIG.ZOOM_SPEED;
        
        // Apply zoom
        const newPosition = zoomDirection.multiplyScalar(newDistance);
        cameraPositionRef.current.copy(newPosition);
        camera.position.copy(cameraPositionRef.current);
        
        // Ensure camera is looking at Earth center
        camera.lookAt(0, 0, 0);
      } else {
        // Zoom complete, reset target
        targetZoomRef.current = null;
      }
    }
    
    // Update state tracking
    lastFollowState.current = state.followISS;
    lastEarthRotateState.current = earthRotateMode;
    
    // Update controls
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      enableZoom={tvDpadMode ? false : enableZoom}
      enablePan={tvDpadMode ? false : enablePan}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={EARTH_RADIUS + 0.5}
      maxDistance={CAMERA_DISTANCE * 2}
    />
  );
};

export default Controls;
