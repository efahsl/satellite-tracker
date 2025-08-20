import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, Spherical } from 'three';
import { useISS } from '../../state/ISSContext';
import { latLongToVector3 } from '../../utils/coordinates';
import { EARTH_RADIUS, CAMERA_DISTANCE, ISS_ALTITUDE_SCALE, EARTH_ROTATE_DISTANCE, EARTH_ROTATE_SPEED, EARTH_ROTATE_TRANSITION_SPEED } from '../../utils/constants';
import { TV_CAMERA_CONTROLS } from '../../utils/tvConstants';

interface ControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  dampingFactor?: number;
  earthRotateMode?: boolean;
}

export interface ControlsRef {
  rotateToDirection: (direction: 'north' | 'east' | 'south' | 'west') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getCurrentDistance: () => number;
}

const Controls = forwardRef<ControlsRef, ControlsProps>(({
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enableZoom = true,
  enablePan = true,
  dampingFactor = 0.1,
  earthRotateMode = false,
}, ref) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { state } = useISS();
  const cameraPositionRef = useRef<Vector3>(new Vector3(0, 0, CAMERA_DISTANCE));
  const lastFollowState = useRef<boolean>(false);
  const lastEarthRotateState = useRef<boolean>(false);
  const earthRotateAngle = useRef<number>(0);
  const targetRotationRef = useRef<Spherical | null>(null);
  const isRotatingRef = useRef<boolean>(false);

  // Utility function for linear interpolation
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Camera control methods
  const rotateToDirection = useCallback((direction: 'north' | 'east' | 'south' | 'west') => {
    if (!controlsRef.current) return;

    const currentPosition = camera.position.clone();
    const spherical = new Spherical().setFromVector3(currentPosition);
    
    // Calculate target rotation based on direction
    switch (direction) {
      case 'north':
        spherical.phi = Math.max(0.1, spherical.phi - TV_CAMERA_CONTROLS.ROTATION_SPEED);
        break;
      case 'south':
        spherical.phi = Math.min(Math.PI - 0.1, spherical.phi + TV_CAMERA_CONTROLS.ROTATION_SPEED);
        break;
      case 'east':
        spherical.theta += TV_CAMERA_CONTROLS.ROTATION_SPEED;
        break;
      case 'west':
        spherical.theta -= TV_CAMERA_CONTROLS.ROTATION_SPEED;
        break;
    }
    
    targetRotationRef.current = spherical;
    isRotatingRef.current = true;
  }, [camera]);

  const zoomIn = useCallback(() => {
    if (!controlsRef.current) return;
    
    const currentDistance = camera.position.length();
    const newDistance = Math.max(
      EARTH_RADIUS + TV_CAMERA_CONTROLS.MIN_ZOOM_DISTANCE,
      currentDistance - TV_CAMERA_CONTROLS.ZOOM_SPEED * 20
    );
    
    const direction = camera.position.clone().normalize();
    const newPosition = direction.multiplyScalar(newDistance);
    cameraPositionRef.current.copy(newPosition);
  }, [camera]);

  const zoomOut = useCallback(() => {
    if (!controlsRef.current) return;
    
    const currentDistance = camera.position.length();
    const newDistance = Math.min(
      CAMERA_DISTANCE * TV_CAMERA_CONTROLS.MAX_ZOOM_DISTANCE,
      currentDistance + TV_CAMERA_CONTROLS.ZOOM_SPEED * 20
    );
    
    const direction = camera.position.clone().normalize();
    const newPosition = direction.multiplyScalar(newDistance);
    cameraPositionRef.current.copy(newPosition);
  }, [camera]);

  const getCurrentDistance = useCallback(() => {
    return camera.position.length();
  }, [camera]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    rotateToDirection,
    zoomIn,
    zoomOut,
    getCurrentDistance,
  }), [rotateToDirection, zoomIn, zoomOut, getCurrentDistance]);

  // Cleanup animation references on unmount
  useEffect(() => {
    return () => {
      // Reset rotation angle on cleanup
      earthRotateAngle.current = 0;
    };
  }, []);

  // Camera control logic
  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    
    // Handle smooth camera rotation for TV controls
    if (isRotatingRef.current && targetRotationRef.current) {
      const currentPosition = camera.position.clone();
      const currentSpherical = new Spherical().setFromVector3(currentPosition);
      const targetSpherical = targetRotationRef.current;
      
      // Lerp towards target rotation
      currentSpherical.phi = lerp(currentSpherical.phi, targetSpherical.phi, TV_CAMERA_CONTROLS.SMOOTH_TRANSITION);
      currentSpherical.theta = lerp(currentSpherical.theta, targetSpherical.theta, TV_CAMERA_CONTROLS.SMOOTH_TRANSITION);
      
      // Apply new position
      const newPosition = new Vector3().setFromSpherical(currentSpherical);
      camera.position.copy(newPosition);
      cameraPositionRef.current.copy(newPosition);
      
      // Check if rotation is complete
      const phiDiff = Math.abs(currentSpherical.phi - targetSpherical.phi);
      const thetaDiff = Math.abs(currentSpherical.theta - targetSpherical.theta);
      if (phiDiff < 0.01 && thetaDiff < 0.01) {
        isRotatingRef.current = false;
        targetRotationRef.current = null;
      }
    }
    
    // Handle smooth zoom transitions
    if (!isRotatingRef.current) {
      camera.position.lerp(cameraPositionRef.current, TV_CAMERA_CONTROLS.SMOOTH_TRANSITION);
    }
    
    // Get ISS position if available
    let issPosition: Vector3 | null = null;
    if (state.position) {
      const { latitude, longitude, altitude } = state.position;
      const scaledAltitude = EARTH_RADIUS + altitude * ISS_ALTITUDE_SCALE;
      const [x, y, z] = latLongToVector3(latitude, longitude, scaledAltitude);
      issPosition = new Vector3(x, y, z);
    }
    
    // Handle Earth rotate mode
    if (earthRotateMode) {
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
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableDamping
      dampingFactor={dampingFactor}
      minDistance={EARTH_RADIUS + 0.5}
      maxDistance={CAMERA_DISTANCE * 2}
    />
  );
});

Controls.displayName = 'Controls';

export default Controls;
